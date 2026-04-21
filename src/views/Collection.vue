<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCollection } from '@/services/portfolioService'
import CollectionHeader from '@/components/CollectionHeader.vue'
import CollectionGallery from '@/components/CollectionGallery.vue'
import { usePagination } from '@/composables/usePagination'
const route = useRoute()
const isLoading = ref(false)
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

const {
  currentPage,
  totalPages,
  paginatedItems: paginatedPhotos,
  nextPage,
  prevPage,
  goToPage
} = usePagination(photos, 20)

const load = async () => {
  if (!categoryId.value || !collectionId.value) {
    collection.value = null
    return
  }
  isLoading.value = true
  collection.value = await getCollection(categoryId.value, collectionId.value)
  isLoading.value = false
}

onMounted(load)
watch([categoryId, collectionId], load)
</script>

<template>
  <section>
    <RouterLink
      :to="{ name: 'CategoryCollections', params: { categoryId } }"
      class="back-link"
    >
      ← Go back to collections
    </RouterLink>

    <template v-if="isLoading">
      <p>Loading...</p>
    </template>

    <template v-else-if="collection">
      <CollectionHeader :collection="collection" />
      <CollectionGallery
        :photos="paginatedPhotos"
        :fallback-image="collection.image"
        :name="collection.name"
      />
      <div v-if="totalPages > 1" class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">
        ←
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: page === currentPage }"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>

      <button @click="nextPage" :disabled="currentPage === totalPages">
        →
      </button>
    </div>
    </template>
    

    <template v-else>
      <p>Collection not found.</p>
    </template>
  </section>
</template>
