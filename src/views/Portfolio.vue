<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/services/firebase'
import { collection, getDocs } from 'firebase/firestore'

const collectionsList = ref([])

onMounted(async () => {
  const querySnapshot = await getDocs(collection(db, 'collections'))
  collectionsList.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
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
      </div>
    </div>
  </section>
</template>
