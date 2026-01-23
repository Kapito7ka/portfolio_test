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