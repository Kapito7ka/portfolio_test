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
        <router-link to="/contacts" class="contact-link">CONTACT ME</router-link>
      </div>
      <div class="about-image-wrapper">
        <BaseImage v-if="image" :src="image" alt="Photographer" class="portrait-image" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-page {
  max-width: 1240px;
  margin: 0 auto;
  padding: 56px 28px 90px;
}

.about-container {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 84px;
}

.about-text-content {
  flex: 1;
  max-width: 530px;
  padding-top: 24px;
}

.greeting {
  margin: 0 0 6px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 24px;
  line-height: 1.15;
  color: #868a95;
  font-weight: 300;
}

.photographer-name {
  margin: 0 0 78px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 40px;
  line-height: 1.06;
  color: #616674;
  font-weight: 400;
}

.main-description {
  margin: 0;
  max-width: 520px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 16px;
  line-height: 1.45;
  color: #8a8f9b;
  white-space: pre-line;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 54px;
  padding: 14px 24px;
  border: 1px solid #b3b7c0;
  text-decoration: none;
  color: #767b87;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 14px;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.contact-link:hover {
  background-color: #6f7482;
  color: #fff;
  border-color: #6f7482;
}

.about-image-wrapper {
  width: min(44vw, 620px);
  min-width: 360px;
  flex-shrink: 0;
}

.portrait-image {
  display: block;
  width: 100%;
  height: auto;
  border: 2px solid #8c909b;
}

@media (max-width: 1200px) {
  .about-page {
    padding-top: 40px;
  }

  .about-container {
    gap: 48px;
  }

  .greeting {
    font-size: 22px;
  }

  .photographer-name {
    font-size: 34px;
    margin-bottom: 52px;
  }

  .main-description {
    font-size: 15px;
  }

  .contact-link {
    font-size: 13px;
  }
}

@media (max-width: 900px) {
  .about-container {
    flex-direction: column;
    align-items: stretch;
  }

  .about-text-content {
    max-width: none;
    padding-top: 0;
  }

  .about-image-wrapper {
    width: 100%;
    min-width: 0;
    max-width: 560px;
    margin: 0 auto;
  }
}

@media (max-width: 640px) {
  .about-page {
    padding: 24px 18px 48px;
  }

  .greeting {
    font-size: 20px;
  }

  .photographer-name {
    font-size: 30px;
    margin-bottom: 30px;
  }

  .main-description {
    font-size: 14px;
  }

  .contact-link {
    margin-top: 36px;
    font-size: 14px;
    padding: 12px 18px;
  }
}
</style>
