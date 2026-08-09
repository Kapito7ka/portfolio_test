<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCategory } from '@/services/portfolioService'
import CollectionCard from '@/components/CollectionCard.vue'
import { supabase } from '@/supabase'
import PortfolioSlider from '@/components/PortfolioSlider.vue'

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
    <section class="portfolio-hero full-bleed">
      <PortfolioSlider :slides="portfolioSlides" kicker="Портфоліо" />
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

<style scoped>
.category-collections-page {
  width: 100%;
  margin: 0;
  padding: 0;
  background: #fff;
}

.category-collections-page .portfolio-hero {
  background: #f8f8f8;
}

.category-content-block {
  max-width: 1240px;
  margin: 0 auto;
  padding: 28px var(--portfolio-gutter) 72px;
}

.back-link-wrap {
  text-align: left;
  margin: 0 0 16px;
}

.category-content-block .category-title {
  margin: 0 0 28px;
  padding: 0;
  text-align: center !important;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.08;
  letter-spacing: 0.12em;
}

.category-content-block .collection-card-wrapper {
  gap: 34px;
}

@media (max-width: 768px) {
  .category-content-block {
    padding: 24px 24px 56px;
  }

  .category-content-block .category-title {
    text-align: center;
  }
}

@media (max-width: 640px) {
  .category-content-block {
    padding: 20px 20px 48px;
  }
}
</style>
