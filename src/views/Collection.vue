<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCollection } from '@/services/portfolioService'
import CollectionHeader from '@/components/CollectionHeader.vue'
import CollectionGallery from '@/components/CollectionGallery.vue'

const route = useRoute()
const isLoading = ref(false)
const isLoadingMore = ref(false)
const collection = ref(null)
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
    return
  }
  isLoading.value = true
  collection.value = await getCollection(categoryId.value, collectionId.value)
  isLoading.value = false
}

watch(photos, () => {
  visibleCount.value = Math.min(10, photos.value.length)
})

onMounted(load)
watch([categoryId, collectionId], load)
</script>

<template>
  <section>
    <div class="collection-nav-buttons">
      <RouterLink
        :to="{ name: 'CategoryCollections', params: { categoryId } }"
        class="back-link"
      >
        ← Go back to collections
      </RouterLink>
    </div>

    <template v-if="isLoading">
      <p>Loading...</p>
    </template>

    <template v-else-if="collection">
      <CollectionHeader :collection="collection" />
      <CollectionGallery
        :photos="displayedPhotos"
        :fallback-image="collection.image"
        :name="collection.name"
        :total-photos="photos.length"
        :photo-offset="0"
        @load-more="loadMorePhotos"
      />

      <div class="collection-meta">
        <p>Показано {{ displayedPhotos.length }} з {{ photos.length }} фото</p>
      </div>

      <div class="collection-controls">
        <button
          v-if="hasMorePhotos"
          class="load-more-btn"
          @click="loadMorePhotos"
          :disabled="isLoadingMore"
        >
          {{ isLoadingMore ? 'Loading...' : 'Завантажити ще 10 фото' }}
        </button>
      </div>
    </template>

    <template v-else>
      <p>Collection not found.</p>
    </template>
  </section>
</template>

<style scoped>
.collection-nav-buttons {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.back-link--secondary {
  opacity: 0.75;
}
</style>

<style scoped>
.collection-controls {
  display: flex;
  justify-content: center;
  margin: 32px 0 18px;
}

.load-more-btn,
.page-arrow,
.pagination button {
  border: 1px solid #111;
  background: transparent;
  color: #111;
  width: 52px;
  height: 52px;
  margin: 0 6px;
  border-radius: 0;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease, transform 0.2s ease;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.load-more-btn {
  min-width: auto;
  width: auto;
  height: auto;
  padding: 10px 18px;
  border-radius: 0;
  letter-spacing: 0.14em;
}

.load-more-btn:hover,
.pagination button:hover:not(:disabled) {
  background: #111;
  color: #fff;
  transform: translateY(-1px);
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.pagination button.active {
  background: #111;
  color: #fff;
}

.page-arrow:disabled,
.load-more-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
