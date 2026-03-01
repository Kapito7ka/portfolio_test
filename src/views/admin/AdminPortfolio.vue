<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseImage from '@/components/BaseImage.vue'
import { uploadPhoto, deletePhoto } from '@/supabase'
import { getCategories, getCollection, setCollectionCoverImage, setCollectionPhotos } from '@/services/portfolioService'

const isLoading = ref(false)
const isSaving = ref(false)
const errorText = ref('')
const successText = ref('')

// Нові змінні для прогресу
const uploadProgress = ref(0)
const uploadStatus = ref('')

const categories = ref([])
const selectedCategoryId = ref('')
const selectedCollectionId = ref('')
const selectedCollection = ref(null)

const collectionOptions = computed(() => {
  const cat = categories.value.find((c) => c.id === selectedCategoryId.value)
  const collections = cat?.collections || {}
  return Object.entries(collections)
    .filter(([, v]) => !!v)
    .map(([id, v]) => ({ id, name: v.name || id }))
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
watch([selectedCategoryId, selectedCollectionId], loadSelectedCollection)

watch(selectedCategoryId, () => {
  const first = collectionOptions.value[0]?.id || ''
  selectedCollectionId.value = first
})

const persistPhotos = async (nextPhotos) => {
  const ok = await setCollectionPhotos(selectedCategoryId.value, selectedCollectionId.value, nextPhotos)
  if (!ok) throw new Error('Не вдалося зберегти фото в Firestore')
  selectedCollection.value = { ...(selectedCollection.value || {}), photos: nextPhotos }
}

const handleUpload = async (event) => {
  const files = Array.from(event.target.files || [])
  event.target.value = ''
  if (!files.length) return
  if (!selectedCategoryId.value || !selectedCollectionId.value) return

  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  uploadProgress.value = 0 // Скидаємо прогрес

  try {
    const current = normalizedPhotos.value.map((p) => ({ url: p.url, fileName: p.fileName }))
    const added = []
    const total = files.length

    for (let i = 0; i < total; i++) {
      // Оновлюємо статус тексту та відсотки
      uploadStatus.value = `Завантаження: ${i + 1} з ${total}`
      
      const result = await uploadPhoto(files[i])
      if (result) {
        added.push({ 
          url: result.publicUrl, 
          fileName: result.fileName, 
          createdAt: Date.now() 
        })
      }
      
      // Рахуємо прогрес
      uploadProgress.value = Math.round(((i + 1) / total) * 100)
    }

    const next = [...current, ...added]
    await persistPhotos(next)

    if (!selectedCollection.value?.image && next[0]?.url) {
      await setCollectionCoverImage(selectedCategoryId.value, selectedCollectionId.value, next[0].url)
      selectedCollection.value = { ...(selectedCollection.value || {}), image: next[0].url }
    }

    if (added.length) {
      successText.value = `Успішно завантажено ${added.length} фото`
    }

  } catch (e) {
    errorText.value = e?.message || 'Помилка завантаження/збереження'
  } finally {
    isSaving.value = false
    uploadProgress.value = 0 // Приховуємо прогрес-бар після завершення
    uploadStatus.value = ''
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

    await persistPhotos(next)

    if (photo.fileName) {
      await deletePhoto(photo.fileName)
    }
  } catch (e) {
    errorText.value = e?.message || 'Помилка видалення'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <section>
    <h1>Адмінка · Портфоліо</h1>

    <template v-if="isLoading">
      <p>Завантаження...</p>
    </template>

    <template v-else>
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

      <div v-if="selectedCollection" class="block">
        <h2 style="margin: 0 0 8px;">{{ selectedCollection.name }}</h2>
        <p v-if="selectedCollection.location" style="margin: 0 0 12px;">{{ selectedCollection.location }}</p>

        <div class="row">
          <input type="file" multiple :disabled="isSaving" @change="handleUpload" />
          <BaseButton v-if="isSaving" :label="uploadStatus || 'Зберігаю...'" />
        </div>

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
              <button type="button" :disabled="isSaving" @click="removePhoto(p)">Видалити</button>
            </div>
          </div>
        </div>

        <p v-else style="margin-top: 12px;">Фото ще не додані.</p>
      </div>

      <p v-else style="margin-top: 12px;">Обери колекцію, щоб додати фото.</p>
    </template>
  </section>
</template>

<style scoped>
.row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  margin: 12px 0;
}
.block {
  margin-top: 12px;
}
.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 16px;
}
.photoCard {
  display: grid;
  gap: 8px;
}
.photoActions {
  display: flex;
  justify-content: flex-end;
}
.error {
  color: #b42318;
  margin-top: 8px;
}
.success {
  color: #067647;
  margin-top: 8px;
}

/* Стилі для прогрес-бару */
.progress-container {
  margin: 10px 0;
  max-width: 300px;
}
.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}
.progress-text {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}
</style>