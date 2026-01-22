<script setup>
defineProps({
  src: { type: String, required: true},
  alt: {type: String,default: 'Зображення'}
})
</script>

<template>
  <div class="base-image-container">
    <img :src="src" :alt="alt" class="base-image" />
  </div>
</template>
<style scoped>
.base-image-container {
  margin: 12px 0;
}
.base-image {
  max-width: 300px;
  border-radius: 12px;
  display: block;
}
</style>