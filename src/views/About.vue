<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import BaseImage from '@/components/BaseImage.vue'
import '@/styles/About.css'

const fullName = ref({ ua: '', en: '' })
const description = ref({ ua: '', en: '' })
const image = ref(null)
const language = ref('ua')

const setLanguage = (lang) => {
  language.value = lang
}

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
</script>

<template>
  <section class="about-page-clean">
    <div class="lang-switcher">
      <button @click="setLanguage('ua')" :class="{ active: language === 'ua' }">UA</button>
      <span class="slash">|</span>
      <button @click="setLanguage('en')" :class="{ active: language === 'en' }">EN</button>
    </div>

    <div class="about-grid">
      <div class="about-info">
        <p class="intro-tag">{{ language === 'ua' ? 'Привіт! Мене звати' : 'Hi! My name is' }}</p>
        <h2 class="profile-title">{{ name || 'Loading...' }}</h2>
        <p class="profile-text">{{ desc }}</p>
        <router-link to="/contacts" class="btn-contact">ЗВ'ЯЖІТЬСЯ З НАМИ</router-link>
      </div>
      
      <div class="about-photo-box">
        <BaseImage v-if="image" :src="image" alt="Photographer" class="img-responsive" />
      </div>
    </div>
  </section>
</template>