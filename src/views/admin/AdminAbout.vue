<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { uploadPhoto, deletePhoto } from '@/supabase'
import BaseButton from '@/components/BaseButton.vue'

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
// я додав
const handleUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  //  Якщо є старе фото — видаляємо
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
//кінець
const save = async () => {
  await setDoc(doc(db, 'about_us', 'main'), form.value)
  alert('Збережено')
}
</script>
<template>
  <section>
    <h1>Адмінка · Про нас</h1>
    <!-- перемикач мови -->
    <div>
      <BaseButton label="UA" @click="activeLang = 'ua'" />
      <BaseButton label="EN" @click="activeLang = 'en'" />
    </div>
    <!-- імʼя -->
    <input placeholder="Імʼя" v-model="form.full_name[activeLang]"/>
    <!-- опис -->
    <textarea placeholder="Опис" v-model="form.description[activeLang]"></textarea>
    <input type="file" @change="handleUpload" />
    <div v-if="form.image" style="margin-top:10px">
      <img :src="form.image" alt="Фото" style="width:150px" />
    </div>
    <BaseButton label="Зберегти" @click="save" />
  </section>
</template>