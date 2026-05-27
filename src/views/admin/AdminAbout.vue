<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { uploadPhoto, deletePhoto } from '@/supabase'

const activeLang = ref('ua')

const form = ref({
  full_name: { ua: '', en: '' },
  description: { ua: '', en: '' },
  image: ''
})
const currentFileName = ref(null)

onMounted(async () => {
  const snap = await getDoc(doc(db, 'about_us', 'main'))
  if (snap.exists()) {
    form.value = snap.data()

    if (form.value.image) {
      const parts = form.value.image.split('/')
      currentFileName.value = parts[parts.length - 1]
    }
  }
})

const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (currentFileName.value) {
    await deletePhoto(currentFileName.value)
  }

  const result = await uploadPhoto(file)

  if (result) {
    form.value.image = result.publicUrl
    currentFileName.value = result.fileName
    alert('Фото оновлено!')
  } else {
    alert('Помилка завантаження')
  }
}

const save = async () => {
  await setDoc(doc(db, 'about_us', 'main'), form.value)
  alert('Збережено')
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
          <input type="file" class="file-input" @change="handleUpload" />
          
          <div v-if="form.image" class="preview-box">
            <img :src="form.image" alt="Прев'ю" />
          </div>
        </div>
      </div>

      <button type="button" class="save-btn" @click="save">Зберегти зміни</button>
    </div>
  </div>
</template>

<style scoped>
.admin-about-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: system-ui, -apple-system, sans-serif;
  color: #222;
}

h1 {
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 30px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 15px;
  color: #111;
  text-align: left;
}

.admin-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: block;
}

.lang-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

.lang-btn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s;
  color: #333;
}

.lang-btn.active {
  background: #1e293b;
  color: #fff;
  border-color: #1e293b;
}

.input-group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: left;
}

.input-field {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #64748b;
}

textarea.input-field {
  min-height: 140px;
  resize: vertical;
  font-family: inherit;
}

.file-upload-block {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 5px;
}

.file-input {
  font-size: 14px;
}

.preview-box {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.preview-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.save-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 28px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: background 0.2s;
  margin-top: 10px;
  width: auto;
}

.save-btn:hover {
  background: #059669;
}
</style>