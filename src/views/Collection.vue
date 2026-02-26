<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCollection } from '@/services/portfolioService'
import CollectionHeader from '@/components/CollectionHeader.vue'
import CollectionGallery from '@/components/CollectionGallery.vue'

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
    <template v-if="isLoading">
      <p>Завантаження...</p>
    </template>

    <template v-else-if="collection">
      <CollectionHeader :collection="collection" />
      <CollectionGallery
        :photos="photos"
        :fallback-image="collection.image"
        :name="collection.name"
      />
    </template>

    <template v-else>
      <p>Колекцію не знайдено.</p>
    </template>
  </section>
</template>

