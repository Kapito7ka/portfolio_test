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
  <section class="about-page">
    <div class="language-bar">
      <button @click="setLanguage('ua')" :class="{ active: language === 'ua' }">
        <span class="flag-icon">UA</span>
      </button>
      <span class="divider">|</span>
      <button @click="setLanguage('en')" :class="{ active: language === 'en' }">
        <span class="flag-icon">EN</span>
      </button>
    </div>
    <div class="about-container">
      <div class="about-text-content">
        <p class="greeting">{{ language === 'ua' ? 'Привіт! Мене звати' : 'Hi! My name is' }}</p>
        <h2 class="photographer-name">{{ name || 'Loading...' }}</h2>
        <p class="main-description">{{ desc }}</p>
        <router-link to="/contacts" class="contact-link">GET IN TOUCH</router-link>
      </div>
      <div class="about-image-wrapper">
        <BaseImage v-if="image" :src="image" alt="Photographer" class="portrait-image" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-page {
  position: relative;
  max-width: 1240px;
  margin: 0 auto;
  padding: 70px 28px 90px;
  font-family: 'Georgia', serif;
}

.about-page h1 {
  text-transform: uppercase;
  letter-spacing: 5px;
  font-weight: 400;
  font-size: 24px;
  margin: 0 0 40px;
  color: #111;
  text-align: center;
}

.about-text-content {
  flex: 1;
  max-width: 560px;
  text-align: left;
  padding-top: 8px;
}

.greeting {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 11px;
  color: #666;
}

.photographer-name {
  margin: 0 0 28px;
  font-size: 38px;
  line-height: 1.1;
  color: #1a1a1a;
  font-weight: 400;
}

.main-description {
  margin: 0;
  max-width: 540px;
  font-size: 16px;
  line-height: 1.75;
  color: #333;
  white-space: pre-line;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 38px;
  padding: 12px 30px;
  border: 1px solid #000;
  text-decoration: none;
  color: #000;
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 11px;
  transition: all 0.3s ease;
  background: transparent;
}

.contact-link:hover {
  background: #000;
  color: #fff;
}

.about-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 72px;
}

.about-image-wrapper {
  width: min(43vw, 520px);
  min-width: 360px;
  flex-shrink: 0;
}

.portrait-image {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid #ddd;
}

@media (max-width: 900px) {
  .about-page {
    padding: 56px 20px;
  }

  .about-page h1 {
    margin-bottom: 38px;
  }

  .photographer-name {
    font-size: 32px;
  }

  .main-description {
    font-size: 15px;
  }

  .about-container {
    flex-direction: column;
    gap: 36px;
  }

  .about-text-content {
    max-width: none;
    text-align: left;
  }

  .about-image-wrapper {
    width: 100%;
    min-width: 0;
    max-width: 560px;
  }
}

@media (max-width: 640px) {
  .about-page {
    padding: 40px 18px 48px;
  }

  .about-page h1 {
    letter-spacing: 3px;
    font-size: 20px;
    margin-bottom: 28px;
  }

  .photographer-name {
    font-size: 26px;
    margin-bottom: 20px;
  }

  .main-description {
    font-size: 14px;
    line-height: 1.65;
  }

  .contact-link {
    margin-top: 30px;
  }
}
</style>
