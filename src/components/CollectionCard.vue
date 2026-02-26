<script setup>
import BaseImage from '@/components/BaseImage.vue'
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
        class="card"
        :to="{ name: 'Collection', params: { categoryId: item.categoryId, collectionId: item.collectionId } }"
      >
        <BaseImage :src="item.image" :alt="item.name" />
        <h3>{{ item.name }}</h3>
        <p>{{ item.location }}</p>
        <p v-if="item.categoryName" class="category-label"> Категорія: {{ item.categoryName }} </p>
      </RouterLink>
    </div>
</template>

<style scoped>
.card {
  display: block;
  color: inherit;
  text-decoration: none;
}
</style>