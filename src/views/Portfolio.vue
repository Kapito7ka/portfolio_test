<script setup>
import { onMounted, ref } from 'vue'
import { getCategories } from '@/services/portfolioService'
import { supabase } from '@/supabase'
import CategoryCard from '@/components/CategoryCard.vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const categories = ref([])
const slides = ref([])

onMounted(async () => {
  categories.value = await getCategories()

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

  <section class="portfolio-section">
    <p class="portfolio-welcome">
      Welcome to view warm and sincere photos in my portfolio
    </p>
    <div class="grid category-grid">
      <CategoryCard
        v-for="cat in categories"
        :key="cat.id"
        :category="cat"
      />
    </div>
  </section>
</template>
<style scoped>
.main-slider {
  width: 100%;
  height: 70vh; 
  min-height: 400px;
  margin: 0 0 60px 0;
}

/* Стиль самого слайда */
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

.hero-slide h2 {
  color: white;
  font-size: 3.5rem;
  text-shadow: 1px 1px 8px rgba(0, 0, 0, 0.4);
  z-index: 2;
  font-weight: 300;
  letter-spacing: 1px;
}

.hero-slide::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
}

.portfolio-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

/* Адаптація під мобільні пристрої */
@media (max-width: 1024px) {
  .main-slider {
    height: 55vh;
  }
  .hero-slide h2 {
    font-size: 2.5rem;
  }
}

@media (max-width: 768px) {
  .main-slider {
    height: 45vh;
  }
  .hero-slide h2 {
    font-size: 1.8rem;
  }
}

@media (max-width: 640px) {
  .main-slider {
    height: 40vh;
    margin-bottom: 40px;
  }
  .hero-slide h2 {
    font-size: 1.2rem;
  }
  .portfolio-section {
    padding: 0 20px 40px;
  }
}
</style>