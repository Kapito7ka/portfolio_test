<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  category: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <RouterLink
    :to="{ name: 'CategoryCollections', params: { categoryId: category.id } }"
    class="collection-card category-card"
  >
    <div class="collection-card__image-wrap">
      <img
        v-if="category.image"
        :src="category.image"
        :alt="category.name || category.id"
        class="collection-card__image"
      />
      <div v-else class="collection-card__placeholder" />
    </div>
    <h3 class="collection-card__title">{{ category.name || category.id }}</h3>
    <p v-if="category.description" class="collection-card__location">
      {{ category.description }}
    </p>
    <span class="collection-card__arrow">→</span>
  </RouterLink>
</template>
