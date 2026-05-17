<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import NavButton from '@/components/NavButton.vue'
import BaseImage from '@/components/BaseImage.vue'
import AdminCategoryList from '@/components/AdminCategoryList.vue'
import AdminCollectionList from '@/components/AdminCollectionList.vue'
import slugify from 'slug'
import { uploadPhoto, uploadCategoryCover, uploadCollectionCover, deletePhoto, uploadInstagramSpotlightPhoto } from '@/supabase'
import { logout } from '@/supabase'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import {
  getCategories,
  getCollection,
  setCategoryCoverImage,
  setCollectionCoverImage,
  setCollectionData,
  setCollectionPhotos,
  createCategory,
  deleteCategory,
  deleteCollection,
  getInstagramSpotlights,
  saveInstagramSpotlights
} from '@/services/portfolioService'
import { usePagination } from '@/composables/usePagination'

const isLoading = ref(false)
const isSaving = ref(false)
const errorText = ref('')
const successText = ref('')

const uploadProgress = ref(0)
const uploadStatus = ref('')

const showNewCategoryForm = ref(false)
const showNewCollectionForm = ref(false)
const uploadingCollectionId = ref(null)
const uploadTargetCollectionId = ref('')
const collectionFileInput = ref(null)
const collectionCoverFileInput = ref(null)
const uploadingCategoryId = ref(null)
const uploadTargetCategoryId = ref('')
const categoryFileInput = ref(null)

const categories = ref([])
const selectedCategoryId = ref('')
const selectedCollectionId = ref('')
const selectedCollection = ref(null)
const newCollectionName = ref('')
const newCollectionLocation = ref('')
const newCollectionId = ref('')
const newCategoryName = ref('')
const newCategoryId = ref('')
const newCategoryDescription = ref('')

const emptyInstagramSlot = () => ({ imageUrl: '', postUrl: '', fileName: '' })
const instagramSlots = ref([
  emptyInstagramSlot(),
  emptyInstagramSlot(),
  emptyInstagramSlot()
])

const hydrateInstagramSlots = async () => {
  const items = await getInstagramSpotlights()
  for (let i = 0; i < 3; i++) {
    const it = items[i]
    instagramSlots.value[i] = it
      ? {
          imageUrl: String(it.imageUrl || '').trim(),
          postUrl: String(it.postUrl || '').trim(),
          fileName: String(it.fileName || '').trim()
        }
      : emptyInstagramSlot()
  }
}

const handleInstagramSpotlightUpload = async (event, index) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file || index < 0 || index > 2) return

  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  try {
    const oldFileName = instagramSlots.value[index]?.fileName || ''
    const result = await uploadInstagramSpotlightPhoto(file)
    if (!result?.publicUrl) {
      throw new Error('Не вдалося завантажити фото')
    }
    if (oldFileName && oldFileName !== result.fileName) {
      try {
        await deletePhoto(oldFileName)
      } catch (err) {
        console.warn('Не вдалося видалити попереднє фото Instagram:', err)
      }
    }
    instagramSlots.value[index] = {
      ...instagramSlots.value[index],
      imageUrl: result.publicUrl,
      fileName: result.fileName || ''
    }
    const ok = await saveInstagramSpotlights(instagramSlots.value.map((s) => ({ ...s })))
    if (!ok) throw new Error('Не вдалося зберегти дані Instagram')
    successText.value = 'Фото для Instagram оновлено.'
  } catch (e) {
    errorText.value = e?.message || 'Помилка завантаження'
  } finally {
    isSaving.value = false
  }
}

const clearInstagramSlot = async (index) => {
  if (index < 0 || index > 2) return
  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  try {
    const fn = instagramSlots.value[index]?.fileName
    if (fn) {
      try {
        await deletePhoto(fn)
      } catch (err) {
        console.warn('Видалення файлу Instagram:', err)
      }
    }
    instagramSlots.value[index] = emptyInstagramSlot()
    const ok = await saveInstagramSpotlights(instagramSlots.value.map((s) => ({ ...s })))
    if (!ok) throw new Error('Не вдалося зберегти')
    successText.value = 'Слот Instagram очищено.'
  } catch (e) {
    errorText.value = e?.message || 'Помилка'
  } finally {
    isSaving.value = false
  }
}

const saveInstagramSlotsForm = async () => {
  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  try {
    const ok = await saveInstagramSpotlights(instagramSlots.value.map((s) => ({ ...s })))
    if (!ok) throw new Error('Не вдалося зберегти блок Instagram')
    successText.value = 'Посилання Instagram збережено.'
  } catch (e) {
    errorText.value = e?.message || 'Помилка збереження'
  } finally {
    isSaving.value = false
  }
}

const generateSlug = (text) => {
  const value = typeof text === 'string' ? text.trim() : ''
  if (!value) return ''
  const locale = (typeof navigator !== 'undefined' && navigator.language)
    ? navigator.language.split('-')[0]
    : 'uk'

  return slugify(value, {
    lower: true,
    locale,
    remove: /[*+~.()"!:@\[\]\/\\]/g
  })
}

watch(newCollectionName, (v) => {
  newCollectionId.value = generateSlug(v)
})

watch(newCategoryName, (v) => {
  if (!newCategoryId.value) {
    newCategoryId.value = generateSlug(v)
  }
})

const currentCategory = computed(() => {
  return categories.value.find((c) => c.id === selectedCategoryId.value)
})

const collectionOptions = computed(() => {
  const cat = currentCategory.value
  const collections = cat?.collections || {}
  return Object.entries(collections)
    .filter(([, v]) => !!v)
    .map(([id, v]) => ({ id, name: v.name || id, location: v.location || '' }))
    .sort((a, b) => a.name.localeCompare(b.name, 'uk'))
})

const normalizedPhotos = computed(() => {
  const raw = selectedCollection.value?.photos
  if (!Array.isArray(raw)) return []
  return raw
    .map((p) => {
      if (typeof p === 'string') return { url: p, fileName: null }
      if (p && typeof p === 'object') return { url: p.url || p.publicUrl || p.src || '', fileName: p.fileName || null }
      return { url: '', fileName: null }
    })
    .filter((p) => p.url && String(p.url).trim() !== '')
})
const {
  currentPage,
  totalPages,
  paginatedItems: paginatedPhotos,
  nextPage,
  prevPage,
  goToPage,
  reset
} = usePagination(normalizedPhotos, 20)

const isCoverPhoto = (photo) => {
  if (!photo || !selectedCollection.value) return false
  const coverFileName = selectedCollection.value.coverFileName || ''
  const coverUrl = selectedCollection.value.image || ''
  if (coverFileName && photo.fileName) {
    return photo.fileName === coverFileName
  }
  return coverUrl ? photo.url === coverUrl : false
}

const load = async () => {
  errorText.value = ''
  isLoading.value = true
  categories.value = await getCategories()
  await hydrateInstagramSlots()
  if (!selectedCategoryId.value && categories.value.length) {
    selectedCategoryId.value = categories.value[0].id
  }
  isLoading.value = false
}

const loadSelectedCollection = async () => {
  errorText.value = ''
  if (!selectedCategoryId.value || !selectedCollectionId.value) {
    selectedCollection.value = null
    return
  }
  selectedCollection.value = await getCollection(selectedCategoryId.value, selectedCollectionId.value)
}

onMounted(load)
watch([selectedCategoryId, selectedCollectionId], async () => {
  reset()
  await loadSelectedCollection()
})

watch(selectedCategoryId, () => {
  const first = collectionOptions.value[0]?.id || ''
  selectedCollectionId.value = first
})

const selectCategory = (catId) => {
  if (!catId) return
  selectedCategoryId.value = catId

  const cat = categories.value.find((c) => c.id === catId)
  const first = Object.keys(cat?.collections || {})[0] || ''
  selectedCollectionId.value = first
  loadSelectedCollection()
}

const selectCollection = (collectionId) => {
  if (!collectionId) return
  selectedCollectionId.value = collectionId
  loadSelectedCollection()
}

const deleteCategoryHandler = async (catId) => {
  if (!catId || isSaving.value) return
  if (!window.confirm('Видалити категорію та всі колекції в ній? Цю дію не можна скасувати.')) return
  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  try {
    const ok = await deleteCategory(catId)
    if (!ok) throw new Error('Не вдалося видалити категорію')
    if (selectedCategoryId.value === catId) {
      selectedCategoryId.value = ''
      selectedCollectionId.value = ''
    }
    await load()
    if (!selectedCategoryId.value && categories.value.length) {
      selectedCategoryId.value = categories.value[0].id
    }
    successText.value = 'Категорію видалено.'
  } catch (e) {
    errorText.value = e?.message || 'Помилка видалення категорії'
  } finally {
    isSaving.value = false
  }
}

const deleteCollectionHandler = async (collectionId) => {
  if (!selectedCategoryId.value || !collectionId || isSaving.value) return
  if (!window.confirm('Видалити цю колекцію? Цю дію не можна скасувати.')) return
  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  try {
    const catId = selectedCategoryId.value
    const ok = await deleteCollection(catId, collectionId)
    if (!ok) throw new Error('Не вдалося видалити колекцію')
    if (selectedCollectionId.value === collectionId) {
      selectedCollectionId.value = ''
    }
    await load()
    const opts = collectionOptions.value
    if (!selectedCollectionId.value && opts.length) {
      selectedCollectionId.value = opts[0].id
    }
    await loadSelectedCollection()
    successText.value = 'Колекцію видалено.'
  } catch (e) {
    errorText.value = e?.message || 'Помилка видалення колекції'
  } finally {
    isSaving.value = false
  }
}

const onEditCategory = (catId) => {
  selectCategory(catId)
}

const onEditCollection = (collectionId) => {
  selectCollection(collectionId)
}

const openFileDialogForCollection = (collectionId) => {
  uploadTargetCollectionId.value = collectionId
  if (collectionFileInput.value) {
    collectionFileInput.value.click()
  }
}

const openFileDialogForCategory = (categoryId) => {
  uploadTargetCategoryId.value = categoryId
  if (categoryFileInput.value) {
    categoryFileInput.value.click()
  }
}

const setCategoryCover = (categoryId) => {
  openFileDialogForCategory(categoryId)
}

const setCollectionCover = (collectionId) => {
  uploadTargetCollectionId.value = collectionId
  if (collectionCoverFileInput.value) {
    collectionCoverFileInput.value.click()
  }
}

const handleCategoryCoverUpload = async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  const categoryId = uploadTargetCategoryId.value || selectedCategoryId.value
  uploadTargetCategoryId.value = ''

  if (!file || !categoryId) return

  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  uploadingCategoryId.value = categoryId

  try {
    const existingCategory = categories.value.find((c) => c.id === categoryId)
    const oldCoverFileName = existingCategory?.coverFileName || ''

    const result = await uploadCategoryCover(file, categoryId)
    if (!result?.publicUrl) {
      throw new Error('Не вдалося завантажити обкладинку категорії')
    }

    const ok = await setCategoryCoverImage(categoryId, result.publicUrl, result.fileName)
    if (!ok) {
      throw new Error('Не вдалося зберегти обкладинку категорії')
    }

    if (oldCoverFileName && oldCoverFileName !== result.fileName) {
      try {
        await deletePhoto(oldCoverFileName)
      } catch (err) {
        console.warn('Не вдалося видалити попередню обкладинку категорії:', err)
      }
    }

    successText.value = 'Обкладинку категорії оновлено.'
    await load()
  } catch (e) {
    errorText.value = e?.message || 'Не вдалося оновити обкладинку категорії'
  } finally {
    isSaving.value = false
    uploadingCategoryId.value = null
  }
}

const handleCollectionCoverUpload = async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  const categoryId = selectedCategoryId.value
  const collectionId = uploadTargetCollectionId.value || selectedCollectionId.value
  uploadTargetCollectionId.value = ''

  if (!file || !categoryId || !collectionId) return

  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  uploadingCollectionId.value = collectionId

  try {
    const existingCollection = currentCategory.value?.collections?.[collectionId]
    const oldCoverFileName = existingCollection?.coverFileName || ''

    const result = await uploadCollectionCover(file, categoryId, collectionId)
    if (!result?.publicUrl) {
      throw new Error('Не вдалося завантажити обкладинку колекції')
    }

    const ok = await setCollectionCoverImage(categoryId, collectionId, result.publicUrl, result.fileName)
    if (!ok) {
      throw new Error('Не вдалося зберегти обкладинку колекції')
    }

    if (oldCoverFileName && oldCoverFileName !== result.fileName) {
      try {
        await deletePhoto(oldCoverFileName)
      } catch (err) {
        console.warn('Не вдалося видалити попередню обкладинку колекції:', err)
      }
    }

    successText.value = 'Обкладинку колекції оновлено.'
    await load()
  } catch (e) {
    errorText.value = e?.message || 'Не вдалося оновити обкладинку колекції'
  } finally {
    isSaving.value = false
    uploadingCollectionId.value = null
  }
}

const persistPhotos = async (categoryId, collectionId, nextPhotos) => {
  const ok = await setCollectionPhotos(categoryId, collectionId, nextPhotos)
  if (!ok) throw new Error('Не вдалося зберегти фото в Firestore')
}

const handleUpload = async (event, collectionId = uploadTargetCollectionId.value, categoryId = selectedCategoryId.value) => {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  uploadTargetCollectionId.value = ''
  if (!files.length) return

  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  uploadProgress.value = 0
  uploadingCollectionId.value = collectionId

  try {
    const collection = await getCollection(categoryId, collectionId)
    const current = (Array.isArray(collection?.photos) ? collection.photos : []).map((p) => {
      if (typeof p === 'string') return { url: p, fileName: null }
      if (p && typeof p === 'object') return { url: p.url || p.publicUrl || p.src || '', fileName: p.fileName || null }
      return { url: '', fileName: null }
    }).filter((p) => p.url && String(p.url).trim() !== '')

    const added = []
    const total = files.length

    for (let i = 0; i < total; i++) {
      uploadStatus.value = `Завантаження: ${i + 1} з ${total}`
      
      const result = await uploadPhoto(files[i], categoryId, collectionId)
      if (result) {
        added.push({ 
          url: result.publicUrl, 
          fileName: result.fileName, 
          createdAt: Date.now() 
        })
      }
      
      uploadProgress.value = Math.round(((i + 1) / total) * 100)
    }

    const next = [...current, ...added]
    await persistPhotos(categoryId, collectionId, next)

    if (!collection?.image && next[0]?.url) {
      await setCollectionCoverImage(categoryId, collectionId, next[0].url, next[0].fileName || '')
    }

    if (added.length) {
      successText.value = `Успішно завантажено ${added.length} фото`
    }

    await load()

  } catch (e) {
    errorText.value = e?.message || 'Помилка завантаження/збереження'
  } finally {
    isSaving.value = false
    uploadProgress.value = 0
    uploadStatus.value = ''
    uploadingCollectionId.value = null
  }
}

const removePhoto = async (photo) => {
  if (!photo?.url) return
  if (!selectedCategoryId.value || !selectedCollectionId.value) return

  errorText.value = ''
  isSaving.value = true
  try {
    const next = normalizedPhotos.value
      .filter((p) => p.url !== photo.url)
      .map((p) => ({ url: p.url, fileName: p.fileName }))

    await persistPhotos(selectedCategoryId.value, selectedCollectionId.value, next)

    if (photo.fileName) {
      await deletePhoto(photo.fileName)
    }

    await load()
  } catch (e) {
    errorText.value = e?.message || 'Помилка видалення'
  } finally {
    isSaving.value = false
  }
}

const setCover = async (photo) => {
  if (!photo?.url || !photo?.fileName) return
  if (!selectedCategoryId.value || !selectedCollectionId.value) return

  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  uploadingCollectionId.value = selectedCollectionId.value

  try {
    await setCollectionCoverImage(
      selectedCategoryId.value,
      selectedCollectionId.value,
      photo.url
    )

    // оновлюємо локально
    selectedCollection.value = {
      ...(selectedCollection.value || {}),
      image: photo.url
    }

  } catch (e) {
    errorText.value = e?.message || 'Не вдалося встановити обкладинку'
  } finally {
    isSaving.value = false
    uploadingCollectionId.value = null
  }
}

const createCollection = async () => {
  if (!selectedCategoryId.value) return
  if (!newCollectionId.value) return

  const collectionId = newCollectionId.value
  const payload = {
    name: newCollectionName.value,
    location: newCollectionLocation.value,
    photos: [],
    image: ''
  }

  const ok = await setCollectionData(selectedCategoryId.value, collectionId, payload)
  if (!ok) {
    errorText.value = 'Не вдалося створити колекцію.'
    return
  }

  newCollectionName.value = ''
  newCollectionLocation.value = ''
  newCollectionId.value = ''
  showNewCollectionForm.value = false

  await load()
  selectedCollectionId.value = collectionId
}

const router = useRouter()
const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const createCategoryHandler = async () => {
  errorText.value = ''
  successText.value = ''
  const id = newCategoryId.value.trim() || generateSlug(newCategoryName.value)
  if (!id) {
    errorText.value = 'Вкажи ID категорії (латиницею) або назву.'
    return
  }

  isSaving.value = true
  const result = await createCategory({
    id,
    name: newCategoryName.value.trim(),
    description: newCategoryDescription.value.trim()
  })
  isSaving.value = false

  if (!result.ok) {
    if (result.reason === 'exists') {
      errorText.value = 'Категорія з таким ID вже існує.'
    } else {
      errorText.value = 'Не вдалося створити категорію.'
    }
    return
  }

  newCategoryName.value = ''
  newCategoryId.value = ''
  newCategoryDescription.value = ''
  showNewCategoryForm.value = false

  await load()
  selectedCategoryId.value = id
  successText.value = 'Категорію створено.'
}
</script>

<template>
  <section class="admin-portfolio">
    <h1>Адмінка · Портфоліо</h1>

    <template v-if="isLoading">
      <p>Завантаження...</p>
    </template>

    <template v-else>
      <div class="block">
        <h2>Нова категорія</h2>
        <NavButton label="+" variant="add" @click="showNewCategoryForm = !showNewCategoryForm" />
      </div>
      <div v-if="showNewCategoryForm" class="accordion-content">
        <div class="form-row">
          <input v-model="newCategoryName" placeholder="Назва категорії" />
          <input v-model="newCategoryId" placeholder="ID (наприклад: wedding)" />
          <input v-model="newCategoryDescription" placeholder="Опис (необовʼязково)" />
          <NavButton label="Створити категорію" variant="add" :disabled="isSaving" @click="createCategoryHandler" />
        </div>
      </div>

      <div class="block instagram-spotlights-admin">
        <h2>Instagram під категоріями (3 фото)</h2>
        <p class="instagram-spotlights-hint">
          Превʼю та посилання на пост (reel / фото). На головній показуються плитки лише з заповненим посиланням.
        </p>
        <div class="instagram-spotlights-grid">
          <div
            v-for="(slot, idx) in instagramSlots"
            :key="idx"
            class="instagram-spotlight-card"
          >
            <p class="instagram-spotlight-num">Фото {{ idx + 1 }}</p>
            <div v-if="slot.imageUrl" class="instagram-spotlight-preview">
              <img :src="slot.imageUrl" alt="" />
            </div>
            <div v-else class="instagram-spotlight-preview instagram-spotlight-preview--empty">
              Немає фото
            </div>
            <label class="instagram-file-label">
              <input
                type="file"
                accept="image/*"
                class="instagram-file-input"
                :disabled="isSaving"
                @change="handleInstagramSpotlightUpload($event, idx)"
              />
              Завантажити зображення
            </label>
            <input
              v-model="slot.postUrl"
              type="url"
              class="instagram-post-url"
              placeholder="https://www.instagram.com/p/… або reel"
              :disabled="isSaving"
            />
            <button
              type="button"
              class="instagram-clear-btn"
              :disabled="isSaving || (!slot.imageUrl && !slot.postUrl)"
              @click="clearInstagramSlot(idx)"
            >
              Очистити слот
            </button>
          </div>
        </div>
        <NavButton label="Зберегти посилання" variant="add" :disabled="isSaving" @click="saveInstagramSlotsForm" />
        <p class="instagram-spotlights-hint instagram-spotlights-hint--secondary">
          Після збереження фото та посилання зʼявляться на головній під категоріями (онови сторінку сайту, якщо не бачиш змін).
        </p>
      </div>

      <AdminCategoryList
        :categories="categories"
        :selected-category-id="selectedCategoryId"
        :is-saving="isSaving"
        :uploading-category-id="uploadingCategoryId"
        @select="selectCategory"
        @set-cover="setCategoryCover"
        @delete="deleteCategoryHandler"
        @edit="onEditCategory"
      />

      <AdminCollectionList
        v-if="selectedCategoryId"
        :collections="collectionOptions"
        :selected-collection-id="selectedCollectionId"
        :is-saving="isSaving"
        :uploading-collection-id="uploadingCollectionId"
        @select="selectCollection"
        @toggle-new="showNewCollectionForm = !showNewCollectionForm"
        @delete="deleteCollectionHandler"
        @edit="onEditCollection"
        @add-photos="openFileDialogForCollection"
        @set-collection-cover="setCollectionCover"
      />
      <p v-else class="admin-hint-muted">Оберіть категорію зі списку вище, щоб керувати колекціями.</p>

      <div v-if="showNewCollectionForm && selectedCategoryId" class="block">
        <h2>Створити нову колекцію</h2>
        <div class="row">
          <input v-model="newCollectionName" placeholder="Назва колекції" />
          <input v-model="newCollectionLocation" placeholder="Локація" />
          <input v-model="newCollectionId" placeholder="ID (slug)" />
          <BaseButton label="Створити" :disabled="isSaving" @click="createCollection" />
        </div>
      </div>

      <input
        ref="categoryFileInput"
        type="file"
        accept="image/*"
        class="admin-hidden-file"
        @change="handleCategoryCoverUpload"
      >
      <input
        ref="collectionCoverFileInput"
        type="file"
        accept="image/*"
        class="admin-hidden-file"
        @change="handleCollectionCoverUpload"
      >
      <input
        ref="collectionFileInput"
        type="file"
        accept="image/*"
        multiple
        class="admin-hidden-file"
        @change="handleUpload"
      >

      <!-- Прогрес завантаження -->
      <div v-if="isSaving && uploadProgress > 0" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="progress-text">{{ uploadProgress }}% готово</p>
      </div>

      <p v-if="errorText" class="error">{{ errorText }}</p>
      <p v-if="successText" class="success">{{ successText }}</p>

        <div v-if="normalizedPhotos.length" class="grid">
          <div v-for="p in normalizedPhotos" :key="p.fileName || p.url" class="photoCard">
            <BaseImage :src="p.url" :alt="selectedCollection.name" />
            <div class="photoActions">
              <button
                v-if="!isCoverPhoto(p)"
                type="button"
                :disabled="isSaving"
                @click="setCover(p)"
              >
                Зробити обкладинкою
              </button>
              <button type="button" :disabled="isSaving" @click="removePhoto(p)"> Видалити</button>
            </div>
          </div>
        </div>

        <p v-else class="admin-portfolio-else">Фото ще не додані.</p>
      </template>
    </section>
</template>

<style scoped>
.instagram-spotlights-admin {
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
}

.instagram-spotlights-hint {
  margin: 0 0 16px;
  font-size: 13px;
  color: #666;
  max-width: 720px;
  line-height: 1.5;
}

.instagram-spotlights-hint--secondary {
  margin-top: 12px;
  margin-bottom: 0;
  font-size: 12px;
  color: #888;
}

.admin-hint-muted {
  margin: 16px 0 24px;
  font-size: 13px;
  color: #888;
}

.admin-hidden-file {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.instagram-spotlights-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

@media (max-width: 900px) {
  .instagram-spotlights-grid {
    grid-template-columns: 1fr;
  }
}

.instagram-spotlight-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fafafa;
}

.instagram-spotlight-num {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.instagram-spotlight-preview {
  aspect-ratio: 3 / 4;
  max-height: 220px;
  overflow: hidden;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.instagram-spotlight-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.instagram-spotlight-preview--empty {
  font-size: 12px;
  color: #999;
}

.instagram-file-label {
  font-size: 12px;
  cursor: pointer;
  color: #2196f3;
}

.instagram-file-input {
  display: block;
  margin-top: 6px;
  font-size: 12px;
}

.instagram-post-url {
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.instagram-clear-btn {
  align-self: flex-start;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
}

.instagram-clear-btn:hover:not(:disabled) {
  border-color: #ff6b6b;
  color: #ff6b6b;
}
</style>