<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'
const collectionsList = ref([])
onMounted(async () => {
  const categoriesSnapshot = await getDocs(collection(db, 'categories'))
  const allCollections = []
  categoriesSnapshot.forEach(catDoc => {
    const catId = catDoc.id
    const catData = catDoc.data() || {}
    const catName = catData.name
    const collections = catData.collections || {}
    Object.entries(collections).forEach(([colId, colValue]) => {
      if (!colValue) return
      allCollections.push({
        id: `${catId}_${colId}`,
        categoryId: catId,
        categoryName: catName,
        ...colValue,
      })
    })
  })
  collectionsList.value = allCollections
})
</script>

<template>
  <section>
    <h1>Портфоліо</h1>
    <p>Нижче представлені фотоколекції.</p>

    <div class="grid">
      <div
        class="card"
        v-for="item in collectionsList"
        :key="item.id"
      >
        <img :src="item.image" :alt="item.name" />
        <h3>{{ item.name }}</h3>
        <p>{{ item.location }}</p>
        <p v-if="item.categoryName" class="category-label"> Категорія: {{ item.categoryName }} </p>
      </div>
    </div>
  </section>
</template>
