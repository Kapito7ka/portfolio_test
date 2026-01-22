<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import BaseImage from '@/components/BaseImage.vue'
import BaseButton from '@/components/BaseButton.vue'
const fullName = ref({ ua: '', en: '' })
const description = ref({ ua: '', en: '' })

const image = ref(null)
const language = ref('ua')

const name = computed(() => fullName.value[language.value] || '')
const desc = computed(() => description.value[language.value] || '')

onMounted(async () => {
  const aboutRef = doc(db, 'about_us', 'main')
  const snap = await getDoc(aboutRef)
  if (snap.exists()) {
    const data = snap.data()
    fullName.value = data.full_name || { ua: '', en: '' }
    description.value = data.description || { ua: '', en: '' }
    image.value = data.image || null
  }
})

const switchLanguage = (lang) => {
  language.value = lang
}
</script>
<template>
  <section>
    <h1>Про нас</h1>
    <div>
      <BaseButton label="UA" @click="switchLanguage('ua')"/>
      <BaseButton label="EN" @click="switchLanguage('en')"/>
    </div>
    <BaseImage v-if="image" :src="image" alt="Фото фотографа"/>
    <h2>{{ name || 'Завантаження...' }}</h2>
    <p>{{ desc }}</p>
  </section>
</template>
