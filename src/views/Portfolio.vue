<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/supabase'
import { getCategories, getInstagramSpotlights } from '@/services/portfolioService'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

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
    <section class="portfolio-hero">
      <swiper
        v-if="portfolioSlides.length > 0"
        :modules="[Autoplay, Pagination]"
        :autoplay="{ delay: 5000 }"
        pagination
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

<style scoped>
.portfolio-home {
  padding-bottom: 40px;
}

.full-bleed {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
}

.portfolio-hero {
  margin: 0 auto 0;
  max-width: 1280px;
  padding: 0 20px;
}

.portfolio-slider {
  width: 100%;
  height: 80vh;
  min-height: 520px;
  margin: 0 auto;
}

.hero-slide {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.hero-slide::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
}

.hero-slide__inner {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 24px;
}

.hero-slide__title {
  margin: 0;
  color: #fff;
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: clamp(1.5rem, 4vw, 3.25rem);
  font-weight: 400;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
}

.hero-slide__kicker {
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.92);
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 0.85rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
}

.portfolio-hero-empty {
  text-align: center;
  color: #666;
  padding: 80px 20px;
  margin: 0;
}

.portfolio-intro {
  max-width: 640px;
  margin: 0 auto;
  padding: 56px 28px 48px;
  text-align: center;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1rem;
  line-height: 1.85;
  color: #444;
  font-weight: 400;
}

.category-rows {
  margin-bottom: 24px;
  padding: 0 20px;
}

.category-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.category-tile {
  display: flex;
  flex-direction: column;
  color: inherit;
  text-decoration: none;
  background: #f0f0f0;
  min-width: 0;
}

.category-tile__media {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #e8e8e8;
  min-height: 280px;
}

.category-tile__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.45s ease;
}

.category-tile:hover .category-tile__img {
  transform: scale(1.04);
}

.category-tile__placeholder {
  width: 100%;
  height: 100%;
  min-height: 200px;
  background: #ddd;
}

.category-tile__title {
  display: block;
  padding: 12px 12px 16px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 0.92rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  color: #1a1a1a;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
}

.category-tile:hover .category-tile__title {
  color: #111;
}

.ig-spotlights-section {
  padding: 48px 0 56px;
  text-align: center;
}

.ig-spotlights-label {
  margin: 0 0 28px;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #333;
}

.ig-spotlights.full-bleed {
  width: auto;
  margin-left: auto;
  margin-right: auto;
  max-width: 1280px;
  padding: 0 80px;
}

.ig-spotlights__row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: stretch;
}

.ig-spotlight-tile {
  display: block;
  text-decoration: none;
  color: inherit;
  background: #fff;
  overflow: hidden;
}

.ig-spotlight-tile__media {
  height: 520px;
  overflow: hidden;
  display: block;
}

.ig-spotlight-tile__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease, filter 0.4s ease;
  filter: grayscale(100%) contrast(0.95) saturate(0.8);
}

.ig-spotlight-tile:hover .ig-spotlight-tile__img {
  transform: scale(1.03);
  filter: grayscale(0%) contrast(1) saturate(1);
}

.ig-spotlight-tile__placeholder {
  width: 100%;
  height: 100%;
  min-height: 180px;
  background: #f2f2f2;
}

.ig-spotlight-tile--empty {
  pointer-events: none;
}

.ig-spotlight-tile--empty .ig-spotlight-tile__placeholder {
  opacity: 0.35;
}

@media (max-width: 1024px) {
  .portfolio-slider {
    height: 55vh;
  }
}

@media (max-width: 768px) {
  .portfolio-slider {
    height: 45vh;
  }

  .portfolio-intro {
    padding: 40px 20px 36px;
    font-size: 0.95rem;
  }

  .category-row {
    grid-template-columns: 1fr;
  }

  .category-tile__media {
    aspect-ratio: 4 / 3;
  }

  .ig-spotlights__row {
    grid-template-columns: 1fr;
  }

  .ig-spotlight-tile__media {
    aspect-ratio: 4 / 3;
  }
}

@media (max-width: 640px) {
  .portfolio-slider {
    height: 40vh;
    min-height: 260px;
  }
}
</style>
