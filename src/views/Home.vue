<script setup>
import { computed, onMounted, ref } from 'vue'
import { supabase } from '@/supabase'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const slides = ref([])

const getSlidePage = (slide) => {
  const page = String(slide?.page || '').trim().toLowerCase()
  if (page === 'portfolio') return 'portfolio'
  if (page === 'home') return 'home'

  const fileName = String(slide?.image_url || '').split('/').pop() || ''
  if (fileName.startsWith('portfolio-')) return 'portfolio'
  return 'home'
}

const homeSlides = computed(() =>
  slides.value.filter((slide) => getSlidePage(slide) === 'home')
)

onMounted(async () => {
  const { data, error } = await supabase
    .from('main_slides')
    .select('*')
    .order('order', { ascending: true })

  if (!error && data) {
    slides.value = data
  } else if (error) {
    console.error('Помилка завантаження слайдів:', error.message)
  }
})
</script>

<template>
  <section class="home-page">
    <swiper
      v-if="homeSlides.length > 0"
      :modules="[Autoplay, Pagination]"
      :autoplay="{ delay: 5000 }"
      pagination
      class="home-slider"
    >
      <swiper-slide v-for="slide in homeSlides" :key="slide.id">
        <div
          class="hero-slide"
          :style="{ backgroundImage: slide.image_url ? `url(${slide.image_url})` : undefined }"
        >
          <div v-if="slide.title" class="hero-slide__inner">
            <h2 class="hero-slide__title">{{ slide.title }}</h2>
          </div>
        </div>
      </swiper-slide>
    </swiper>

    <p v-else class="empty-state">Слайди поки не додані.</p>
  </section>
</template>

<style scoped src="@/styles/home-slider.css"></style>
