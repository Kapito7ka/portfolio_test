<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  collectionsList: {
    type: Array,
    default: () => []
  }
})
</script>
<template>
  <div class="grid">
    <RouterLink
      v-for="item in collectionsList"
      :key="item.id"
      class="collection-card"
      :to="{ name: 'Collection', params: { categoryId: item.categoryId, collectionId: item.collectionId } }"
    >
      <div class="collection-card__image-wrap">
        <img
          v-if="item.image"
          :src="item.image"
          :alt="item.name"
          class="collection-card__image"
        />
        <div v-else class="collection-card__placeholder" />
      </div>
      <h3 class="collection-card__title">{{ item.name }}</h3>
      <p v-if="item.location" class="collection-card__location">{{ item.location }}</p>
      <span class="collection-card__arrow">→</span>
    </RouterLink>
  </div>
</template>