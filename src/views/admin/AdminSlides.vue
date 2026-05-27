<script setup>
import { computed, ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import BaseButton from '@/components/BaseButton.vue'
import BaseImage from '@/components/BaseImage.vue'

const slides = ref([])
const isSaving = ref(false)
const isLoading = ref(false)
const errorText = ref('')
const successText = ref('')
const selectedPage = ref('home')

const uploadProgress = ref(0)
const uploadStatus = ref('')

const parseSlidePage = (slide) => {
  const fileName = String(slide?.image_url || '').split('/').pop() || ''
  if (fileName.startsWith('portfolio-')) return 'portfolio'
  return 'home'
}

const fetchSlides = async () => {
  isLoading.value = true
  const { data, error } = await supabase
    .from('main_slides')
    .select('*')
    .order('order', { ascending: true })
  
  if (!error) slides.value = data
  isLoading.value = false
}

const filteredSlides = computed(() =>
  slides.value.filter((slide) => parseSlidePage(slide) === selectedPage.value)
)

const handleUpload = async (event) => {
  const files = Array.from(event.target.files || [])
  if (!files.length) return

  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  uploadProgress.value = 0

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      uploadStatus.value = `Завантаження: ${i + 1} з ${files.length}`
      
      // ВИПРАВЛЕННЯ "Invalid key": створюємо чисте ім'я файлу без кирилиці
      const fileExt = file.name.split('.').pop()
      const pagePrefix = selectedPage.value === 'portfolio' ? 'portfolio' : 'home'
      const fileName = `${pagePrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`

      const { data: storageData, error: storageError } = await supabase.storage
        .from('slides')
        .upload(fileName, file)

      if (storageError) throw storageError

      const { data: urlData } = supabase.storage.from('slides').getPublicUrl(fileName)

      const { error: dbError } = await supabase.from('main_slides').insert([
        { 
          image_url: urlData.publicUrl,
          order: slides.value.length + i + 1
        }
      ])

      if (dbError) throw dbError
      uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
    }

    successText.value = 'Слайди додано'
    await fetchSlides()
  } catch (e) {
    errorText.value = e.message
  } finally {
    isSaving.value = false
    uploadStatus.value = ''
    event.target.value = ''
  }
}

const removeSlide = async (slide) => {
  if (!slide?.image_url) return // Захист від помилок undefined
  
  isSaving.value = true
  try {
    // Витягуємо назву файлу з URL (безпечно)
    const urlParts = slide.image_url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    
    await supabase.from('main_slides').delete().eq('id', slide.id)
    await supabase.storage.from('slides').remove([fileName])
    
    await fetchSlides()
  } catch (e) {
    errorText.value = 'Помилка видалення'
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchSlides)
</script>

<template>
  <section class="admin-portfolio">
    <h1>Керування слайдами</h1>

    <div class="block">
      <div class="row">
        <label class="page-select">
          Тип слайду:
          <select v-model="selectedPage">
            <option value="home">Home</option>
            <option value="portfolio">Portfolio</option>
          </select>
        </label>
        <input type="file" multiple :disabled="isSaving" @change="handleUpload" accept="image/*" />
        <BaseButton v-if="isSaving" :label="uploadStatus" />
      </div>

      <div v-if="isSaving && uploadProgress > 0" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p>{{ uploadProgress }}%</p>
      </div>

      <p v-if="errorText" class="error">{{ errorText }}</p>
      <p v-if="successText" class="success">{{ successText }}</p>
    </div>

    <div v-if="filteredSlides.length" class="grid">
      <div v-for="slide in filteredSlides" :key="slide.id" class="photoCard">
        <BaseImage :src="slide.image_url" />
        <div class="photoActions">
          <span>Сторінка: {{ parseSlidePage(slide) }}</span>
          <span>Порядок: {{ slide.order }}</span>
          <button @click="removeSlide(slide)" :disabled="isSaving">Видалити</button>
        </div>
      </div>
    </div>

    <p v-else class="empty-state">На сторінці {{ selectedPage }} ще немає слайдів.</p>
  </section>
</template>

<style scoped>
.admin-portfolio {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  color: #333;
}

.admin-portfolio h1 {
  margin: 0 0 24px;
  font-size: 2rem;
  font-weight: 600;
  color: #222;
}

.block {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.page-select {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
}

.page-select select {
  min-width: 160px;
  padding: 10px 12px;
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  background: #fafafa;
  color: #333;
}

input[type="file"] {
  padding: 10px;
  border: 1px solid #d8d8d8;
  border-radius: 8px;
  background: #fafafa;
  color: #333;
}

.progress-container {
  margin-top: 18px;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: #f1f1f1;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2196f3;
  width: 0;
  transition: width 0.3s ease;
}

.error,
.success,
.empty-state {
  margin-top: 16px;
  font-size: 14px;
}

.error {
  color: #c0392b;
}

.success {
  color: #2e7d32;
}

.grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin-top: 24px;
}

.photoCard {
  background: #fafafa;
  border: 1px solid #e6e6e6;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}

.photoActions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
}

.photoActions span {
  color: #555;
  font-size: 13px;
}

.photoActions button {
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #333;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.photoActions button:hover:not(:disabled) {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.photoActions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .admin-portfolio {
    padding: 24px 14px 40px;
  }

  .row {
    flex-direction: column;
    align-items: stretch;
  }

  .photoActions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
