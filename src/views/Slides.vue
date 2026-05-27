<script setup>
import { onMounted, ref } from 'vue'
import { supabase } from '@/supabase'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import '@/styles/Slides.css'

const slides = ref([])

onMounted(async () => {
  const { data, error } = await supabase
    .from('main_slides')
    .select('*')
    .order('order', { ascending: true })

  if (!error) {
    slides.value = data
  } else {
    console.error('Помилка завантаження слайдів:', error.message)
  }
})
</script>

<template>
  <section class="slides-page">
    <swiper
      v-if="slides.length > 0"
      :modules="[Autoplay, Navigation, Pagination]"
      :autoplay="{ delay: 5000 }"
      navigation
      pagination
      class="main-slider"
    >
      <swiper-slide v-for="slide in slides" :key="slide.id">
        <div class="hero-slide" :style="{ backgroundImage: `url(${slide.image_url})` }">
          <h2 v-if="slide.title">{{ slide.title }}</h2>
        </div>
      </swiper-slide>
    </swiper>

    <p v-else class="empty-state">Слайди поки не додані.</p>
  </section>
</template>
