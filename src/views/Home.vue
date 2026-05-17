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

<style scoped>
.home-page {
  width: 100vw;
  min-width: 100vw;
  margin: -96px 0 0 0;
  padding: 0;
  overflow: hidden;
  background: transparent;
}

.home-slider {
  width: 100vw;
  min-width: 100vw;
  min-height: 100vh;
  height: 100vh;
}

.home-slider .swiper-wrapper,
.home-slider .swiper-slide {
  width: 100vw !important;
}

.hero-slide {
  min-width: 100vw;
}

.hero-slide {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hero-slide::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.55));
  pointer-events: none;
}

.hero-slide::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.08), transparent 40%);
  pointer-events: none;
}

.hero-slide__inner {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  max-width: min(720px, 92%);
  width: 100%;
  background: rgba(5, 5, 5, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 28px;
  padding: 24px 28px;
  backdrop-filter: blur(16px);
}

.hero-slide__title {
  margin: 0;
  color: #f7f7f7;
  font-size: clamp(2.1rem, 4vw, 4rem);
  letter-spacing: 0.18em;
  line-height: 1.05;
  text-transform: uppercase;
  text-shadow: 0 18px 80px rgba(0, 0, 0, 0.25);
}

.swiper-button-prev,
.swiper-button-next {
  color: rgba(255, 255, 255, 0.88);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(8px);
}

.swiper-button-prev::after,
.swiper-button-next::after {
  font-size: 18px;
}

.swiper-pagination {
  bottom: 28px !important;
}

.swiper-pagination-bullet {
  width: 10px;
  height: 10px;
  opacity: 0.5;
  background: #fff;
}

.swiper-pagination-bullet-active {
  opacity: 1;
  background: #fff;
}

.empty-state {
  text-align: center;
  color: #666;
  padding: 80px 20px;
}

@media (max-width: 1024px) {
  .home-slider {
    height: 60vh;
  }
}

@media (max-width: 768px) {
  .home-slider {
    height: 46vh;
  }

  .hero-slide__title {
    font-size: 2rem;
  }
}

@media (max-width: 640px) {
  .home-slider {
    min-height: 260px;
    height: 45vh;
  }

  .hero-slide__title {
    font-size: 1.2rem;
  }
}
</style>
