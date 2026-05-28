<script setup>
import { defineProps } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

const props = defineProps({
  slides: { type: Array, default: () => [] },
  kicker: { type: String, default: 'Портфоліо' },
  autoplayDelay: { type: Number, default: 5000 }
})
</script>

<template>
  <section class="portfolio-hero">
    <swiper
      v-if="slides && slides.length"
      :modules="[Autoplay]"
      :autoplay="{ delay: autoplayDelay }"
      class="portfolio-slider"
    >
      <swiper-slide v-for="slide in slides" :key="slide.id">
        <div
          class="hero-slide"
          :style="{ backgroundImage: slide.image_url ? `url(${slide.image_url})` : undefined }"
        >
          <div class="hero-slide__inner">
            <h2 v-if="slide.title" class="hero-slide__title">{{ slide.title }}</h2>
            <p class="hero-slide__kicker">{{ kicker }}</p>
          </div>
        </div>
      </swiper-slide>
    </swiper>
    <p v-else class="portfolio-hero-empty">Слайди поки не додані.</p>
  </section>
</template>

<style scoped>
/* component is presentational; slider styles are loaded globally */
</style>
