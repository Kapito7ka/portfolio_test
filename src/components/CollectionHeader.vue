<script setup>
const props = defineProps({
  collection: {
    type: Object,
    default: null
  }
})
</script>

<template>
  <header v-if="collection">
    <h1>{{ collection.name }}</h1>
    <p v-if="collection.location">{{ collection.location }}</p>
    <p v-if="collection.categoryName" class="category-label">
      Категорія: {{ collection.categoryName }}
    </p>
  </header>
</template>

