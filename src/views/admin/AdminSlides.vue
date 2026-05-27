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

<style scoped>
.admin-panel { max-width: 900px; margin: auto; padding: 20px; }
.tabs { margin-bottom: 20px; display: flex; gap: 10px; }
.tabs button { padding: 8px 16px; cursor: pointer; border: 1px solid #ddd; background: white; border-radius: 4px; }
.tabs button.active { background: #000; color: #fff; }
.gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
.card { border: 1px solid #eee; padding: 10px; border-radius: 8px; }
.card img { width: 100%; height: 150px; object-fit: cover; margin-bottom: 8px; border-radius: 4px; }
.actions { display: flex; gap: 5px; }
.actions button { flex: 1; padding: 5px; cursor: pointer; }
.delete-btn { background: white; color: #ff4d4d; border: 1px solid #ff4d4d; border-radius: 4px; }
.delete-btn:hover { background: #ff4d4d; color: white; }
</style>