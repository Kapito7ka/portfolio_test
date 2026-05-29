<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { uploadInstagramSpotlightPhoto, deletePhoto } from '@/supabase'
import '@/styles/AdminAbout.css'

const activeLang = ref('ua')
const loading = ref(false)
const imageKey = ref(0)

const form = ref({
  full_name: { ua: '', en: '' },
  description: { ua: '', en: '' },
  image: '', 
  fileName: '' 
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
    if (form.value.fileName) {
      await deletePhoto(form.value.fileName)
    }

    const result = await uploadInstagramSpotlightPhoto(file)
    
    if (result) {
      form.value.image = result.publicUrl
      form.value.fileName = result.fileName 
      imageKey.value++ 
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
