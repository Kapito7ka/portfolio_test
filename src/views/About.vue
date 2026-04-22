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
  <section class="about-page">
    <h1 class="page-title">About Me</h1>

    <div class="language-toggle">
      <BaseButton label="UA" @click="switchLanguage('ua')"/>
      <BaseButton label="EN" @click="switchLanguage('en')"/>
    </div>

    <div class="about-container">
      <div class="about-text-content">
        <p class="greeting">Привіт! Мене звати</p>
        <h2 class="photographer-name">{{ name || 'Loading...' }}</h2>
        <p class="main-description">{{ desc }}</p>
        <router-link to="/contacts" class="contact-link">CONTACT ME</router-link>
      </div>
      <div class="about-image-wrapper">
        <BaseImage v-if="image" :src="image" alt="Photographer" class="base-image"/>
      </div>
    </div>
  </section>
</template>
