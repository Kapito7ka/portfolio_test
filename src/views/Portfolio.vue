<script setup>
import { ref, onMounted } from 'vue'
import { getCollections } from '@/services/portfolioService'
const collections = ref([])
onMounted(async () => {
  collections.value = await getCollections()
})
</script>
<template>
  <section>
    <h1>Портфоліо</h1>
    <p>Нижче представлені колекції.</p>

    <div class="grid">
      <div class="card" v-for="item in collections" :key="item.id">
        <img :src="item.image" />
        <h3>{{ item.name }}</h3>
      </div>
    </div>
  </section>
</template>
