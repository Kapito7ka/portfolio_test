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
<style scoped>
.portfolio-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;
}

@media (max-width: 640px) {
  .portfolio-section {
    padding: 0 20px 40px;
  }
}
</style>