<script setup>
import BaseImage from '@/components/BaseImage.vue'

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  },
  fallbackImage: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div v-if="photos.length" class="grid">
    <BaseImage
      v-for="(p, idx) in photos"
      :key="p.fileName || p.url || idx"
      :src="p.url"
      :alt="name"
    />
  </div>

  <div v-else>
    <BaseImage v-if="fallbackImage" :src="fallbackImage" :alt="name" />
    <p v-else>Фото ще не додані.</p>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 16px;
}
</style>

