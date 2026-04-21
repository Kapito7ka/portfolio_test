<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCategory } from '@/services/portfolioService'
import CollectionCard from '@/components/CollectionCard.vue'

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

const load = async () => {
  if (!categoryId.value) {
    category.value = null
    return
  }
  isLoading.value = true
  category.value = await getCategory(categoryId.value)
  isLoading.value = false
}

onMounted(load)
watch(categoryId, load)
</script>

<template>
  <section>
    <RouterLink
      :to="{ name: 'Portfolio' }"
      class="back-link"
    >
      ← Go back to categories
    </RouterLink>

    <template v-if="isLoading">
      <p>Loading...</p>
    </template>

    <template v-else-if="category">
      <h1>{{ category.name || category.id }}</h1>
      <CollectionCard :collections-list="collectionsList" />
    </template>

    <template v-else>
      <p>Category not found.</p>
    </template>
  </section>
</template>
