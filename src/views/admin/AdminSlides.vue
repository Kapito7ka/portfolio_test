<template>
  <section class="admin-panel">
    <h1>Керування слайдами</h1>

    <div class="tabs">
      <button :class="{ active: selectedPage === 'home' }" @click="selectedPage = 'home'">Головна</button>
      <button :class="{ active: selectedPage === 'portfolio' }" @click="selectedPage = 'portfolio'">Портфоліо</button>
    </div>

    <div class="upload-box">
      <input type="file" @change="handleUpload" accept="image/*" />
      <span v-if="isSaving" class="loader">Зберігаю...</span>
    </div>

    <div class="gallery">
      <div v-for="(slide, index) in filteredSlides" :key="slide.id" class="card">
        <img :src="slide.image_url" alt="slide" />
        
        <div class="actions">
          <button @click="moveSlide(slide, index, -1)" :disabled="index === 0">↑</button>
          <button @click="moveSlide(slide, index, 1)" :disabled="index === filteredSlides.length - 1">↓</button>
          <button class="delete-btn" @click="removeSlide(slide)">Видалити</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'
import '@/styles/AdminSlides.css'

const slides = ref([])
const selectedPage = ref('home')
const isSaving = ref(false)

const fetchSlides = async () => {
  const { data } = await supabase.from('main_slides').select('*').order('order')
  if (data) slides.value = data
}

const filteredSlides = computed(() => {
  return slides.value.filter(s => s.page_type === selectedPage.value)
})

const moveSlide = async (slide, index, direction) => {
  const targetIndex = index + direction
  const targetSlide = filteredSlides.value[targetIndex]
  
  const currentOrder = slide.order || index
  const targetOrder = targetSlide.order || targetIndex

  await supabase.from('main_slides').update({ order: targetOrder }).eq('id', slide.id)
  await supabase.from('main_slides').update({ order: currentOrder }).eq('id', targetSlide.id)
  
  await fetchSlides()
}

const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  isSaving.value = true

  const fileName = `${selectedPage.value}_${Date.now()}.png`
  await supabase.storage.from('slides').upload(fileName, file)
  const { data: { publicUrl } } = supabase.storage.from('slides').getPublicUrl(fileName)
  
  await supabase.from('main_slides').insert({ 
    image_url: publicUrl, 
    page_type: selectedPage.value,
    order: slides.value.length 
  })
  
  isSaving.value = false
  fetchSlides()
}

const removeSlide = async (slide) => {
  if (!confirm('Видалити це фото?')) return
  await supabase.from('main_slides').delete().eq('id', slide.id)
  const path = slide.image_url.split('/').pop()
  await supabase.storage.from('slides').remove([path])
  fetchSlides()
}

onMounted(fetchSlides)
</script>

