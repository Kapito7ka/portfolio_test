<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import BaseButton from '@/components/BaseButton.vue'

const activeLang = ref('ua')

const form = ref({
  full_name: { ua: '', en: '' },
  description: { ua: '', en: '' },
  image: ''
})

onMounted(async () => {
  const snap = await getDoc(doc(db, 'about_us', 'main'))
  if (snap.exists()) {
    form.value = snap.data()
  }
})

const save = async () => {
  await setDoc(doc(db, 'about_us', 'main'), form.value)
  alert('Збережено')
}
</script>
<template>
  <section>
    <h1>Адмінка · Про нас</h1>
    <!-- перемикач мови -->
    <div>
      <BaseButton label="UA" @click="activeLang = 'ua'" />
      <BaseButton label="EN" @click="activeLang = 'en'" />
    </div>
    <!-- імʼя -->
    <input placeholder="Імʼя" v-model="form.full_name[activeLang]"/>
    <!-- опис -->
    <textarea placeholder="Опис" v-model="form.description[activeLang]"></textarea>
    <!-- фото -->
    <input placeholder="Image URL" v-model="form.image"/>
    <BaseButton label="Зберегти" @click="save" />
  </section>
</template>