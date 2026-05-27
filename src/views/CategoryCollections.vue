<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCategory } from '@/services/portfolioService'
import CollectionCard from '@/components/CollectionCard.vue'
import { supabase } from '@/supabase'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

const route = useRoute()
const isLoading = ref(false)
const category = ref(null)

const categoryId = computed(() => String(route.params.categoryId || ''))

const collectionsList = computed(() => {
  if (!category.value?.collections) return []
  const catId = category.value.id
  const catName = category.value.name || ''
  return Object.entries(category.value.collections)
    .filter(([, v]) => !!v)
    .map(([colId, colValue]) => ({
      id: `${catId}_${colId}`,
      categoryId: catId,
      collectionId: colId,
      categoryName: catName,
      ...colValue
    }))
})

const slides = ref([])

const getSlidePage = (slide) => {
  const page = String(slide?.page || '').trim().toLowerCase()
  if (page === 'portfolio') return 'portfolio'
  if (page === 'home') return 'home'

  const fileName = String(slide?.image_url || '').split('/').pop() || ''
  if (fileName.startsWith('portfolio-')) return 'portfolio'
  return 'home'
}

const portfolioSlides = computed(() =>
  slides.value.filter((slide) => getSlidePage(slide) === 'portfolio')
)

const load = async () => {
  if (!categoryId.value) {
    category.value = null
    return
  }
  isLoading.value = true
  category.value = await getCategory(categoryId.value)
  isLoading.value = false
}

onMounted(async () => {
  const { data, error } = await supabase
    .from('main_slides')
    .select('*')
    .order('order', { ascending: true })

  if (!error && data) slides.value = data
  else if (error) console.error('Помилка завантаження слайдів:', error.message)
})

onMounted(load)
watch(categoryId, load)
</script>

<template>
  <div class="category-collections-page">
    <section class="portfolio-hero">
      <swiper
        v-if="portfolioSlides.length > 0"
        :modules="[Autoplay]"
        :autoplay="{ delay: 5000 }"
        class="portfolio-slider"
      >
        <swiper-slide v-for="slide in portfolioSlides" :key="slide.id">
          <div
            class="hero-slide"
            :style="{ backgroundImage: slide.image_url ? `url(${slide.image_url})` : undefined }"
          >
            <div class="hero-slide__inner">
              <h2 v-if="slide.title" class="hero-slide__title">{{ slide.title }}</h2>
              <p class="hero-slide__kicker">Портфоліо</p>
            </div>
          </div>
        </swiper-slide>
      </swiper>
      <p v-else class="portfolio-hero-empty">Слайди поки не додані.</p>
    </section>

    <div class="category-content-block">
      <div class="back-link-wrap">
        <RouterLink :to="{ name: 'Portfolio' }" class="back-link">← Go back to categories</RouterLink>
      </div>

      <template v-if="isLoading">
        <p>Loading...</p>
      </template>

      <template v-else-if="category">
        <h1 class="category-title">{{ category.name || category.id }}</h1>
        <CollectionCard :collections-list="collectionsList" />
      </template>

      <template v-else>
        <p>Category not found.</p>
      </template>
    </div>
  </div>
</template>

<style scoped src="@/styles/category-slider.css"></style>

<style scoped>
.category-collections-page {
  width: 100%;
  margin: 0;
  padding: 0;
}

.category-content-block {
  margin-bottom: 50px;
  padding: 25px 80px;
}

.back-link-wrap {
  text-align: left;
  margin: 18px 0 8px;
}

.back-link {
  color: #777;
  text-decoration: none;
  font-weight: 600;
}

.category-title,
h1.category-title {
  color: #666 !important;
}
</style>
