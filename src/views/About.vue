<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'
import BaseImage from '@/components/BaseImage.vue'
// Якщо у файлі About.css є старі стилі, які все ламають, 
// тимчасово закоментуй рядок нижче для перевірки:
//import '@/styles/About.css'

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

<style scoped>
/* Повністю новий ізольований клас, щоб старі стилі не заважали */
.about-page-clean {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  box-sizing: border-box;
  font-family: 'Georgia', serif;
  background-color: #ffffff; /* Робимо фон білим, як контент */
  color: #000000;
}

.lang-switcher {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 30px;
  font-family: Arial, sans-serif;
  font-size: 14px;
}

.lang-switcher button {
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  font-weight: bold;
  padding: 2px 6px;
}

.lang-switcher button.active {
  color: #000;
}

.slash {
  color: #ccc;
}

.about-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
}

.about-info {
  flex: 1;
  max-width: 500px;
}

.intro-tag {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #666;
  margin: 0 0 10px 0;
}

.profile-title {
  font-size: 36px;
  font-weight: 400;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

.profile-text {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin: 0 0 30px 0;
  white-space: pre-line;
}

.btn-contact {
  display: inline-block;
  padding: 12px 28px;
  border: 1px solid #000;
  background: transparent;
  color: #000;
  text-decoration: none;
  font-size: 11px;
  letter-spacing: 2px;
  transition: background 0.3s, color 0.3s;
}

.btn-contact:hover {
  background: #000;
  color: #fff;
}

.about-photo-box {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 500px;
}

/* Обмеження картинки, щоб вона не розтягувала сторінку */
.img-responsive {
  width: 100%;
  height: auto;
  max-height: 400px; 
  object-fit: contain;
}

/* Мобільна адаптивність */
@media (max-width: 768px) {
  .about-grid {
    flex-direction: column-reverse;
    gap: 30px;
  }
  .about-info {
    text-align: center;
    max-width: 100%;
  }
  .profile-title {
    font-size: 28px;
  }
}
</style>