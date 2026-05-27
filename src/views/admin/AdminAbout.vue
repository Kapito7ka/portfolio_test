<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { uploadInstagramSpotlightPhoto, deletePhoto } from '@/supabase'

const activeLang = ref('ua')
const loading = ref(false)
const imageKey = ref(0)

const form = ref({
  full_name: { ua: '', en: '' },
  description: { ua: '', en: '' },
  image: '', // Тут URL
  fileName: '' // Тут шлях для видалення (зберігаємо в Firestore)
})

onMounted(async () => {
  const snap = await getDoc(doc(db, 'about_us', 'main'))
  if (snap.exists()) {
    form.value = snap.data()
  }
})

const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  loading.value = true
  try {
    // 1. Видаляємо старе фото, якщо шлях існує
    if (form.value.fileName) {
      await deletePhoto(form.value.fileName)
    }

    // 2. Завантажуємо нове
    const result = await uploadInstagramSpotlightPhoto(file)
    
    if (result) {
      form.value.image = result.publicUrl
      form.value.fileName = result.fileName // Зберігаємо шлях для майбутнього видалення
      imageKey.value++ // Оновлюємо картинку
      alert('Фото успішно оновлено!')
    }
  } catch (error) {
    console.error('Помилка завантаження:', error)
    alert('Помилка при оновленні фото')
  } finally {
    loading.value = false
  }
}

const save = async () => {
  try {
    // Зберігаємо в Firestore і посилання, і шлях до файлу
    await setDoc(doc(db, 'about_us', 'main'), {
      full_name: form.value.full_name,
      description: form.value.description,
      image: form.value.image,
      fileName: form.value.fileName
    })
    alert('Зміни успішно збережено!')
  } catch (error) {
    console.error(error)
    alert('Помилка збереження')
  }
}
</script>

<template>
  <div class="admin-about-container">
    <h1>Адмінка · Про нас</h1>
    
    <div class="admin-card">
      <div class="lang-selector">
        <button type="button" class="lang-btn" :class="{ active: activeLang === 'ua' }" @click="activeLang = 'ua'">UA</button>
        <button type="button" class="lang-btn" :class="{ active: activeLang === 'en' }" @click="activeLang = 'en'">EN</button>
      </div>

      <div class="input-group">
        <label>Імʼя фотографа</label>
        <input type="text" class="input-field" v-model="form.full_name[activeLang]" />
      </div>

      <div class="input-group">
        <label>Опис діяльності</label>
        <textarea class="input-field" v-model="form.description[activeLang]"></textarea>
      </div>

      <div class="input-group">
        <label>Портретне фото</label>
        <div class="file-upload-wrapper">
          <label class="custom-file-upload">
            <input type="file" @change="handleUpload" accept="image/*" />
            <span>{{ loading ? 'Завантаження...' : 'Вибрати нове фото' }}</span>
          </label>
          <div v-if="form.image" class="preview-box">
            <img :src="form.image" :key="imageKey" alt="Прев'ю" />
          </div>
        </div>
      </div>

      <button type="button" class="save-btn" @click="save">Зберегти зміни</button>
    </div>
  </div>
</template>

<style scoped>
.admin-about-container { max-width: 700px; margin: 40px auto; padding: 0 20px; font-family: sans-serif; }
h1 { font-size: 24px; font-weight: 500; text-transform: uppercase; margin-bottom: 30px; color: #111; }
.admin-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }

.lang-selector { display: flex; gap: 10px; margin-bottom: 24px; }
.lang-btn { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 6px; cursor: pointer; color: #333; font-weight: 600; }
.lang-btn.active { background: #1e293b; color: #fff; }

.input-group { margin-bottom: 24px; }
.input-group label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 8px; text-transform: uppercase; }

.input-field { width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 15px; color: #222; box-sizing: border-box; }
.file-upload-wrapper { display: flex; align-items: center; gap: 20px; }
.custom-file-upload { display: inline-block; padding: 12px 20px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; cursor: pointer; color: #333; }
.custom-file-upload input { display: none; }
.preview-box { width: 100px; height: 100px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
.preview-box img { width: 100%; height: 100%; object-fit: cover; }
.save-btn { background: #10b981; color: white; border: none; padding: 12px 28px; border-radius: 8px; cursor: pointer; font-weight: 600; }
</style>