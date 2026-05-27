<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import BaseButton from '@/components/BaseButton.vue'
import BaseImage from '@/components/BaseImage.vue'
import '@/styles/AdminSlides.css'

const slides = ref([])
const isSaving = ref(false)
const isLoading = ref(false)
const errorText = ref('')
const successText = ref('')
const selectedPage = ref('home')

const uploadProgress = ref(0)
const uploadStatus = ref('')

// Функція розпізнавання сторінки
const parseSlidePage = (slide) => {
  if (!slide || !slide.image_url) return 'home'
  const decodedUrl = decodeURIComponent(slide.image_url)
  const urlWithoutQuery = decodedUrl.split('?')[0]
  const fileName = urlWithoutQuery.split('/').pop() || ''
  
  if (fileName.toLowerCase().startsWith('portfolio-')) {
    return 'portfolio'
  }
  return 'home'
}

const fetchSlides = async () => {
  isLoading.value = true
  const { data, error } = await supabase
    .from('main_slides')
    .select('*')
    .order('order', { ascending: true })
  
  if (!error) {
    slides.value = data
  } else {
    errorText.value = 'Не вдалося завантажити слайди'
  }
  isLoading.value = false
}

// ФУНКЦІЯ ДЛЯ ОНОВЛЕННЯ ПОРЯДКУ СЛАЙДУ (Зміна місця)
const updateOrder = async (slide, newOrder) => {
  isSaving.value = true
  errorText.value = ''
  successText.value = ''
  
  try {
    const { error } = await supabase
      .from('main_slides')
      .update({ order: parseInt(newOrder, 10) })
      .eq('id', slide.id)

    if (error) throw error
    
    successText.value = 'Порядок слайдів оновлено!'
    await fetchSlides() // Перезавантажуємо, щоб вони відсортувалися по-новому
  } catch (e) {
    errorText.value = 'Помилка зміни порядку: ' + e.message
  } finally {
    isSaving.value = false
  }
}

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
      
      const fileExt = file.name.split('.').pop()
      const pagePrefix = selectedPage.value === 'portfolio' ? 'portfolio' : 'home'
      const fileName = `${pagePrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`

      const { error: storageError } = await supabase.storage
        .from('slides')
        .upload(fileName, file)

      if (storageError) throw storageError

      const { data: urlData } = supabase.storage.from('slides').getPublicUrl(fileName)

      // Визначаємо максимальний поточний order, щоб додати в кінець
      const maxOrder = slides.value.length ? Math.max(...slides.value.map(s => s.order || 0)) : 0

      const { error: dbError } = await supabase.from('main_slides').insert([
        { 
          image_url: urlData.publicUrl,
          order: maxOrder + i + 1
        }
      ])

      if (dbError) throw dbError
      uploadProgress.value = Math.round(((i + 1) / files.length) * 100)
    }

    successText.value = 'Слайди успішно додано!'
    await fetchSlides()
  } catch (e) {
    console.error(e)
    errorText.value = e.message || 'Помилка завантаження'
  } finally {
    isSaving.value = false
    uploadStatus.value = ''
    event.target.value = ''
  }
}

const removeSlide = async (slide) => {
  if (!slide?.image_url) return
  isSaving.value = true
  try {
    const decodedUrl = decodeURIComponent(slide.image_url)
    const urlWithoutQuery = decodedUrl.split('?')[0]
    const fileName = urlWithoutQuery.split('/').pop()
    
    await supabase.from('main_slides').delete().eq('id', slide.id)
    await supabase.storage.from('slides').remove([fileName])
    
    await fetchSlides()
    successText.value = 'Слайд видалено'
  } catch (e) {
    errorText.value = 'Помилка видалення слайду'
  } finally {
    isSaving.value = false
  }
}

onMounted(fetchSlides)
</script>

<template>
  <section class="admin-slides-container">
    <h1>Керування слайдами</h1>

    <div class="upload-block">
      <div class="controls-row">
        <label class="page-select">
          <span>Категорія відображення</span>
          <select v-model="selectedPage">
            <option value="home">Головна сторінка (Home)</option>
            <option value="portfolio">Портфоліо (Portfolio)</option>
          </select>
        </label>
        
        <label class="file-input-wrapper">
          <span>Обрати зображення</span>
          <input type="file" multiple :disabled="isSaving" @change="handleUpload" accept="image/*" />
        </label>

        <BaseButton v-if="isSaving" :label="uploadStatus" class="upload-btn-status" />
      </div>

      <div v-if="isSaving && uploadProgress > 0" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <p class="progress-text">Завантажено {{ uploadProgress }}%</p>
      </div>

      <p v-if="errorText" class="error">{{ errorText }}</p>
      <p v-if="successText" class="success">{{ successText }}</p>
    </div>

    <div class="slides-grid">
      <template v-for="slide in slides" :key="slide.id">
        <div v-if="parseSlidePage(slide) === selectedPage" class="photoCard">
          <div class="slide-image-wrapper">
            <BaseImage :src="slide.image_url" />
          </div>
          
          <div class="photoActions">
            <div class="order-management">
              <label>Позиція:</label>
              <input 
                type="number" 
                class="order-input"
                :value="slide.order" 
                @change="(e) => updateOrder(slide, e.target.value)"
                :disabled="isSaving"
                min="1"
              />
            </div>
            
            <button @click="removeSlide(slide)" :disabled="isSaving" class="delete-btn">
              Видалити слайд
            </button>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>