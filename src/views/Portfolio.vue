<script setup>
import { onMounted, ref } from 'vue'
import { getCategories } from '@/services/portfolioService'
import CategoryCard from '@/components/CategoryCard.vue'

const categories = ref([])

onMounted(async () => {
  categories.value = await getCategories()
})
</script>

<template>
  <section class="portfolio-section">
    <p class="portfolio-welcome">
      Welcome to view warm and sincere photos in my portfolio
    </p>
    <div class="grid category-grid">
      <CategoryCard
        v-for="cat in categories"
        :key="cat.id"
        :category="cat"
      />
    </div>
  </section>
</template>
