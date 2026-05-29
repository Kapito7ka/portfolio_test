<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/supabase'
import { getCategories, getInstagramSpotlights } from '@/services/portfolioService'
import PortfolioSlider from '@/components/PortfolioSlider.vue'

const categories = ref([])
const slides = ref([])
const instagramSpotlights = ref([])

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

onMounted(async () => {
  categories.value = await getCategories()
  instagramSpotlights.value = await getInstagramSpotlights()

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

const categoryRows = computed(() => {
  const cats = categories.value
  if (!cats.length) return []
  const rows = []
  for (let i = 0; i < cats.length; i += 3) {
    rows.push(cats.slice(i, i + 3))
  }
  return rows
})

const showInstagramSpotlights = computed(() =>
  instagramSpotlights.value.some((s) => s.postUrl && String(s.postUrl).trim())
)

function instagramPostHref(url) {
  const u = String(url || '').trim()
  if (!u) return '#'
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}
</script>
<template>
  <div class="portfolio-home">
    <section class="portfolio-hero full-bleed">
      <PortfolioSlider :slides="portfolioSlides" kicker="Портфоліо" />
    </section>

    <p class="portfolio-intro">
      Ми знімаємо важливі моменти вашого життя — щоб кожна фотографія залишалась живою історією.
    </p>

    <div
      v-for="(row, idx) in categoryRows"
      :key="`cat-row-${idx}`"
      class="category-rows full-bleed"
    >
      <div class="category-row">
        <RouterLink
          v-for="cat in row"
          :key="cat.id"
          :to="{ name: 'CategoryCollections', params: { categoryId: cat.id } }"
          class="category-tile"
        >
          <div class="category-tile__media">
            <img
              v-if="cat.image"
              :src="cat.image"
              :alt="cat.name || cat.id"
              class="category-tile__img"
            />
            <div v-else class="category-tile__placeholder" />
          </div>
          <span class="category-tile__title">{{ cat.name || cat.id }}</span>
        </RouterLink>
      </div>
    </div>

    <section v-if="showInstagramSpotlights" class="ig-spotlights-section">
      <p class="ig-spotlights-label">Підпишіться на нас в INSTAGRAM</p>
      <div class="ig-spotlights full-bleed">
        <div class="ig-spotlights__row">
          <template v-for="idx in [0, 1, 2]" :key="`ig-${idx}`">
            <a
              v-if="instagramSpotlights[idx]?.postUrl?.trim()"
              class="ig-spotlight-tile"
              :href="instagramPostHref(instagramSpotlights[idx].postUrl)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div class="ig-spotlight-tile__media">
                <img
                  v-if="instagramSpotlights[idx]?.imageUrl"
                  :src="instagramSpotlights[idx].imageUrl"
                  alt=""
                  class="ig-spotlight-tile__img"
                />
                <div v-else class="ig-spotlight-tile__placeholder" />
              </div>
            </a>
            <div v-else class="ig-spotlight-tile ig-spotlight-tile--empty" aria-hidden="true">
              <div class="ig-spotlight-tile__media">
                <div class="ig-spotlight-tile__placeholder" />
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped src="@/styles/portfolio.css"></style>
