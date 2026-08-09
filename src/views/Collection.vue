<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCategory, getCollection } from '@/services/portfolioService'
import CollectionGallery from '@/components/CollectionGallery.vue'

const route = useRoute()
const isLoading = ref(false)
const isLoadingMore = ref(false)
const collection = ref(null)
const category = ref(null)
const categoryId = computed(() => String(route.params.categoryId || ''))
const collectionId = computed(() => String(route.params.collectionId || ''))

const photos = computed(() => {
  const raw = collection.value?.photos
  if (!raw) return []
  if (!Array.isArray(raw)) return []

  return raw
    .map((p) => {
      if (typeof p === 'string') return { url: p }
      if (p && typeof p === 'object') return { url: p.url || p.publicUrl || p.src || '', fileName: p.fileName }
      return { url: '' }
    })
    .filter((p) => p.url && String(p.url).trim() !== '')
})

const visibleCount = ref(10)

const displayedPhotos = computed(() => photos.value.slice(0, visibleCount.value))
const hasMorePhotos = computed(() => visibleCount.value < photos.value.length)

const heroImage = computed(() => {
  if (collection.value?.image) return collection.value.image
  if (photos.value[0]?.url) return photos.value[0].url
  return ''
})

const worksDescription = computed(() => {
  const categoryDescription = String(category.value?.description || '').trim()
  if (categoryDescription) return categoryDescription

  const location = String(collection.value?.location || '').trim()
  if (location) return location

  return 'Підбірка робіт з цієї колекції — живі моменти, емоції та атмосфера зйомки.'
})

const siblingCollections = computed(() => {
  if (!category.value?.collections) return []

  return Object.entries(category.value.collections)
    .filter(([, value]) => !!value)
    .map(([id, value]) => ({
      collectionId: id,
      name: value.name || id
    }))
})

const loadMorePhotos = async () => {
  if (isLoadingMore.value || !hasMorePhotos.value) return
  isLoadingMore.value = true
  await new Promise((resolve) => setTimeout(resolve, 120))
  visibleCount.value = Math.min(visibleCount.value + 10, photos.value.length)
  isLoadingMore.value = false
}

const load = async () => {
  if (!categoryId.value || !collectionId.value) {
    collection.value = null
    category.value = null
    return
  }

  isLoading.value = true
  const [collectionData, categoryData] = await Promise.all([
    getCollection(categoryId.value, collectionId.value),
    getCategory(categoryId.value)
  ])
  collection.value = collectionData
  category.value = categoryData
  isLoading.value = false
}

watch(photos, () => {
  visibleCount.value = Math.min(10, photos.value.length)
})

onMounted(load)
watch([categoryId, collectionId], load)
</script>

<template>
  <div class="collection-page">
    <template v-if="isLoading">
      <p class="collection-loading">Loading...</p>
    </template>

    <template v-else-if="collection">
      <section class="collection-hero">
        <div
          class="collection-hero__media"
          :style="heroImage ? { backgroundImage: `url(${heroImage})` } : undefined"
        >
          <div class="collection-hero__content">
            <h1 class="collection-hero__title">{{ collection.name }}</h1>
            <p v-if="collection.location" class="collection-hero__subtitle">
              {{ collection.location }}
            </p>
          </div>
        </div>
      </section>

      <div class="collection-page__spacing-after-hero" />

      <div class="collection-page__content-shell">
        <div class="collection-works__header">
          <div class="collection-back-wrap">
            <RouterLink
              :to="{ name: 'CategoryCollections', params: { categoryId } }"
              class="collection-back"
            >
              ← Go back to collections
            </RouterLink>
          </div>

          <div class="collection-works__intro">
            <h2 class="collection-works__title">{{ collection.name }}</h2>
            <p v-if="collection.location" class="collection-works__location">
              {{ collection.location }}
            </p>
          </div>
        </div>

        <section class="collection-works">
          <CollectionGallery
            :photos="displayedPhotos"
            :fallback-image="collection.image"
            :name="collection.name"
            :total-photos="photos.length"
            :photo-offset="0"
            @load-more="loadMorePhotos"
          />

          <div v-if="hasMorePhotos" class="collection-controls">
            <button
              class="collection-load-more"
              @click="loadMorePhotos"
              :disabled="isLoadingMore"
            >
              {{ isLoadingMore ? 'Loading...' : 'Завантажити ще' }}
            </button>
          </div>

          <p class="collection-meta">
            Показано {{ displayedPhotos.length }} з {{ photos.length }} фото
          </p>
        </section>
      </div>
    </template>

    <template v-else>
      <p class="collection-empty">Collection not found.</p>
    </template>
  </div>
</template>
