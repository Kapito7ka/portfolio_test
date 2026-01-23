<script setup>
import { ref, onMounted } from 'vue'
import { getCollections } from '@/services/portfolioService'
import CollectionCard from '@/components/CollectionCard.vue'

const collectionsList = ref([])

onMounted(async () => {
  collectionsList.value = await getCollections()
})
</script>

<template>
  <section>
    <h1>Портфоліо</h1>
    <p>Нижче представлені фотоколекції.</p>
    <CollectionCard :collectionsList="collectionsList" />
  </section>
</template>
