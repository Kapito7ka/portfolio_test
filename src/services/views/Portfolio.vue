<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

const collectionsList = ref([])

onMounted(async () => {
  const querySnapshot = await getDocs(collection(db, 'collections'))
  collectionsList.value = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
})
</script>git add README.md
GIT_EDITOR=true git rebase --continue
git push -u origin maingit add README.md
GIT_EDITOR=true git rebase --continue
git push -u origin mainps -p 92551 -o pid,comm,cmdps -p 92551 -o pid,comm,cmd

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
