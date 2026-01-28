<script setup>
import BaseImage from '@/components/BaseImage.vue'
defineProps({
  collectionsList: {
    type: Array,
    default: () => []
  }
})
</script>
<template>
   <div class="grid">
      <div class="card" v-for="item in collectionsList" :key="item.id">
        <BaseImage :src="item.image" :alt="item.name" />
        <h3>{{ item.name }}</h3>
        <p>{{ item.location }}</p>
        <p v-if="item.categoryName" class="category-label"> Категорія: {{ item.categoryName }} </p>
      </div>
    </div>
</template>