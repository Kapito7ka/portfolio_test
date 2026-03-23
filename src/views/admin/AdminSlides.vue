<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import BaseButton from '@/components/BaseButton.vue'
import BaseImage from '@/components/BaseImage.vue'

const slides = ref([])
const isSaving = ref(false)
const isLoading = ref(false)
const errorText = ref('')
const successText = ref('')

const uploadProgress = ref(0)
const uploadStatus = ref('')

const fetchSlides = async () => {
  isLoading.value = true
  const { data, error } = await supabase
    .from('main_slides')
    .select('*')
    .order('order', { ascending: true })
  
  if (!error) slides.value = data
  isLoading.value = false
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
      
      // ВИПРАВЛЕННЯ "Invalid key": створюємо чисте ім'я файлу без кирилиці
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`

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

    <div v-if="slides.length" class="grid">
      <div v-for="slide in slides" :key="slide.id" class="photoCard">
        <BaseImage :src="slide.image_url" />
        <div class="photoActions">
          <span>Порядок: {{ slide.order }}</span>
          <button @click="removeSlide(slide)" :disabled="isSaving">Видалити</button>
        </div>
      </div>
    </div>
  </section>
</template>