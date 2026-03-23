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
  height: 80vh; 
  min-height: 400px;
  margin-bottom: 2rem;
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
  font-size: 3rem;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.hero-slide::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}

/* Адаптація під мобільні пристрої */
@media (max-width: 768px) {
  .main-slider {
    height: 50vh;
  }
  .hero-slide h2 {
    font-size: 1.5rem;
  }
}
</style>