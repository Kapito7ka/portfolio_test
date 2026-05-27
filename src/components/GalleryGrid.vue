<template>
  <div class="gallery-grid">
    <div v-for="slide in slides" :key="slide.id" class="slide-card">
      <img :src="slide.image_url" alt="Slide" />
      <button @click="$emit('remove', slide)">Видалити</button>
    </div>
  </div>
</template>

<script setup>
defineProps(['slides']);
defineEmits(['remove']);
</script>

<style scoped>
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
.slide-card img { width: 100%; border-radius: 8px; }
</style>