<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import NavButton from '@/components/NavButton.vue'
import BaseImage from '@/components/BaseImage.vue'
import AdminCategoryList from '@/components/AdminCategoryList.vue'
import AdminCollectionList from '@/components/AdminCollectionList.vue'
import slugify from 'slug'
import { uploadPhoto, uploadCategoryCover, uploadCollectionCover, deletePhoto } from '@/supabase'
import { logout } from '@/supabase'
import { useRouter } from 'vue-router'
import { getCategories, getCollection, setCollectionCoverImage, setCollectionPhotos, createCategory } from '@/services/portfolioService'

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

const {
  currentPage,
  totalPages,
  paginatedItems: paginatedPhotos,
  nextPage,
  prevPage,
  goToPage,
  reset
} = usePagination(normalizedPhotos, 20)

const load = async () => {
  errorText.value = ''
  isLoading.value = true
  categories.value = await getCategories()
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

      <div class="row">
        <label>
          Категорія:
          <select v-model="selectedCategoryId" :disabled="isSaving">
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name || c.id }}</option>
          </select>
        </label>

        <label>
          Колекція:
          <select v-model="selectedCollectionId" :disabled="isSaving || !collectionOptions.length">
            <option v-for="c in collectionOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </label>
      </div>
      <div class="block">
      <h2>Створити нову колекцію</h2>
        <div class="row">
          <input v-model="newCollectionName" placeholder="Назва колекції"/>
          <input v-model="newCollectionLocation" placeholder="Локація"/>
          <input v-model="newCollectionId" placeholder="ID (slug)"/>
          <BaseButton label="Створити" :disabled="isSaving" @click="createCollection"/>
        </div>
      </div>

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
              <button type="button" :disabled="isSaving" @click="setCover(p)">Зробити обкладинкою</button>
              <button type="button" :disabled="isSaving" @click="removePhoto(p)"> Видалити</button>
            </div>
          </div>
        </div>

        <p v-else class="admin-portfolio-else">Фото ще не додані.</p>
      </div>
    </template>
  </section>
</template>