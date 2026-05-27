<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
// Імпортуємо правильну функцію саме для цієї сторінки
import { uploadAboutPhoto, deletePhoto } from '@/supabase'
import '@/styles/AdminAbout.css'

const activeLang = ref('ua')

const form = ref({
  full_name: { ua: '', en: '' },
  description: { ua: '', en: '' },
  image: ''
})
const currentFileName = ref(null)

// Функція для правильного отримання повного шляху файлу з URL (враховуючи папки)
const extractStoragePath = (url) => {
  if (!url) return null
  try {
    const decodedUrl = decodeURIComponent(url)
    // Шукаємо місце, де закінчується назва бакета 'photos/'
    const bucketMarker = '/Opacity/photos/' // Або просто '/photos/' залежно від URL
    
    if (decodedUrl.includes('/photos/')) {
      const parts = decodedUrl.split('/photos/')
      return parts[parts.length - 1].split('?')[0]
    }
    
    const parts = decodedUrl.split('/')
    return parts[parts.length - 1].split('?')[0]
  } catch (e) {
    console.error("Не вдалося розпарсити шлях файлу:", e)
    return null
  }
}

onMounted(async () => {
  try {
    const snap = await getDoc(doc(db, 'about_us', 'main'))
    if (snap.exists()) {
      form.value = snap.data()
      if (form.value.image) {
        currentFileName.value = extractStoragePath(form.value.image)
        console.log("Поточний шлях до файлу в Supabase:", currentFileName.value)
      }
    }
  } catch (error) {
    console.error("Помилка завантаження з Firestore:", error)
  }
})

const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 1. Спочатку видаляємо попереднє фото, якщо воно є
  if (currentFileName.value) {
    try {
      await deletePhoto(currentFileName.value)
      console.log("Старе фото успішно видалено зі сховища:", currentFileName.value)
    } catch (err) {
      console.warn("Пропущено видалення старого фото:", err)
    }
  }

  // 2. Завантажуємо нове за допомогою ізольованої функції
  try {
    const result = await uploadAboutPhoto(file)
    console.log("Результат завантаження фото:", result)

    if (result && result.publicUrl) {
      form.value.image = result.publicUrl
      currentFileName.value = result.fileName
      alert('Фото завантажено у сховище! Натисніть "Зберегти зміни", щоб оновити сайт.')
    } else {
      alert('Помилка: Не вдалося отримати дані завантаженого файлу.')
    }
  } catch (error) {
    console.error("Критичний збій при handleUpload:", error)
    alert('Помилка виконання скрипта завантаження.')
  }
}

const save = async () => {
  try {
    await setDoc(doc(db, 'about_us', 'main'), form.value)
    alert('Дані успішно збережено в базі!')
  } catch (error) {
    console.error("Помилка збереження у Firestore:", error)
    alert('Не вдалося зберегти зміни.')
  }
}
</script>

<template>
  <div class="admin-about-container">
    <h1>Адмінка · Про нас</h1>
    
    <div class="admin-card">
      <div class="lang-selector">
        <button 
          type="button" 
          class="lang-btn" 
          :class="{ active: activeLang === 'ua' }" 
          @click="activeLang = 'ua'"
        >
          UA
        </button>
        <button 
          type="button" 
          class="lang-btn" 
          :class="{ active: activeLang === 'en' }" 
          @click="activeLang = 'en'"
        >
          EN
        </button>
      </div>

      <div class="input-group">
        <label>Імʼя фотографа ({{ activeLang.toUpperCase() }})</label>
        <input 
          type="text"
          class="input-field" 
          placeholder="Введіть ім'я та прізвище" 
          v-model="form.full_name[activeLang]"
        />
      </div>

      <div class="input-group">
        <label>Опис діяльності ({{ activeLang.toUpperCase() }})</label>
        <textarea 
          class="input-field" 
          placeholder="Текст на сторінці Про нас..." 
          v-model="form.description[activeLang]"
        ></textarea>
      </div>

      <div class="input-group">
        <label>Портретне фото</label>
        <div class="file-upload-block">
          <input type="file" class="file-input" @change="handleUpload" accept="image/*" />
          
          <div v-if="form.image" class="preview-box">
            <img :src="form.image" alt="Прев'ю портрета" />
          </div>
        </div>
      </div>

      <button type="button" class="save-btn" @click="save">Зберегти зміни</button>
    </div>
  </div>
</template>