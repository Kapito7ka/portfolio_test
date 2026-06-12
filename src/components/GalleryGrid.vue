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
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  padding-left: 50px;
  padding-right: 50px;
  box-sizing: border-box;
}
.slide-card {
  padding-left: 0;
  padding-right: 0;
}
.slide-card img { width: 100%; border-radius: 8px; display: block; }
</style>