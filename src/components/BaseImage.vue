<script setup>
defineProps({
  src: { type: String, required: true},
  alt: {type: String,default: 'Зображення'}
})
</script>

<template>
  <img :src="src" :alt="alt" class="base-image" />
</template>