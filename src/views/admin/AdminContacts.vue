<script setup>
import { onMounted, ref } from 'vue'
import ContactList from '@/components/ContactList.vue'
import { deletePhoto, uploadInstagramSpotlightPhoto } from '@/supabase'
import { getInstagramSpotlights, saveInstagramSpotlights } from '@/services/portfolioService'
import '@/styles/AdminContacts.css'

const isSaving = ref(false)
const errorText = ref('')
const successText = ref('')

const emptyInstagramSlot = () => ({ imageUrl: '', postUrl: '', fileName: '' })
const instagramSlots = ref([
  emptyInstagramSlot(),
  emptyInstagramSlot(),
  emptyInstagramSlot()
])

const hydrateInstagramSlots = async () => {
  const items = await getInstagramSpotlights()
  for (let i = 0; i < 3; i++) {
    const it = items[i]
    instagramSlots.value[i] = it
      ? {
          imageUrl: String(it.imageUrl || '').trim(),
          postUrl: String(it.postUrl || '').trim(),
          fileName: String(it.fileName || '').trim()
        }
      : emptyInstagramSlot()
  }
}

const handleInstagramSpotlightUpload = async (event, index) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file || index < 0 || index > 2) return

  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  try {
    const oldFileName = instagramSlots.value[index]?.fileName || ''
    const result = await uploadInstagramSpotlightPhoto(file)
    if (!result?.publicUrl) {
      throw new Error('Не вдалося завантажити фото')
    }
    if (oldFileName && oldFileName !== result.fileName) {
      try {
        await deletePhoto(oldFileName)
      } catch (err) {
        console.warn('Не вдалося видалити попереднє фото Instagram:', err)
      }
    }

    instagramSlots.value[index] = {
      ...instagramSlots.value[index],
      imageUrl: result.publicUrl,
      fileName: result.fileName || ''
    }

    const ok = await saveInstagramSpotlights(instagramSlots.value.map((s) => ({ ...s })))
    if (!ok) throw new Error('Не вдалося зберегти дані Instagram')

    successText.value = 'Фото для Instagram оновлено.'
  } catch (e) {
    errorText.value = e?.message || 'Помилка завантаження'
  } finally {
    isSaving.value = false
  }
}

const clearInstagramSlot = async (index) => {
  if (index < 0 || index > 2) return

  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  try {
    const fn = instagramSlots.value[index]?.fileName
    if (fn) {
      try {
        await deletePhoto(fn)
      } catch (err) {
        console.warn('Видалення файлу Instagram:', err)
      }
    }

    instagramSlots.value[index] = emptyInstagramSlot()

    const ok = await saveInstagramSpotlights(instagramSlots.value.map((s) => ({ ...s })))
    if (!ok) throw new Error('Не вдалося зберегти')

    successText.value = 'Слот Instagram очищено.'
  } catch (e) {
    errorText.value = e?.message || 'Помилка'
  } finally {
    isSaving.value = false
  }
}

const saveInstagramSlotsForm = async () => {
  errorText.value = ''
  successText.value = ''
  isSaving.value = true
  try {
    const ok = await saveInstagramSpotlights(instagramSlots.value.map((s) => ({ ...s })))
    if (!ok) throw new Error('Не вдалося зберегти блок Instagram')
    successText.value = 'Посилання Instagram збережено.'
  } catch (e) {
    errorText.value = e?.message || 'Помилка збереження'
  } finally {
    isSaving.value = false
  }
}

onMounted(hydrateInstagramSlots)
</script>

<template>
  <section class="admin-contacts">
    <h1>Адмінка · Контакти</h1>

    <div class="block">
      <h3>Редагування ваших контактів</h3>
      <ContactList editable />
    </div>

    <div class="block instagram-spotlights-admin">
      <h2>Instagram під категоріями (3 фото)</h2>
      <p class="instagram-spotlights-hint">
        Превʼю та посилання на пост (reel / фото). На головній показуються плитки лише з заповненим посиланням.
      </p>
      <div class="instagram-spotlights-grid">
        <div
          v-for="(slot, idx) in instagramSlots"
          :key="idx"
          class="instagram-spotlight-card"
        >
          <p class="instagram-spotlight-num">Фото {{ idx + 1 }}</p>
          <div v-if="slot.imageUrl" class="instagram-spotlight-preview">
            <img :src="slot.imageUrl" alt="" />
          </div>
          <div v-else class="instagram-spotlight-preview instagram-spotlight-preview--empty">
            Немає фото
          </div>
          <label class="instagram-file-label">
            <input
              type="file"
              accept="image/*"
              class="instagram-file-input"
              :disabled="isSaving"
              @change="handleInstagramSpotlightUpload($event, idx)"
            />
            Завантажити зображення
          </label>
          <input
            v-model="slot.postUrl"
            type="url"
            class="instagram-post-url"
            placeholder="https://www.instagram.com/p/… або reel"
            :disabled="isSaving"
          />
          <button
            type="button"
            class="instagram-clear-btn"
            :disabled="isSaving || (!slot.imageUrl && !slot.postUrl)"
            @click="clearInstagramSlot(idx)"
          >
            Очистити слот
          </button>
        </div>
      </div>
      <button type="button" class="instagram-save-btn" :disabled="isSaving" @click="saveInstagramSlotsForm">
        Зберегти посилання
      </button>
      <p class="instagram-spotlights-hint instagram-spotlights-hint--secondary">
        Після збереження фото та посилання зʼявляться на головній під категоріями (онови сторінку сайту, якщо не бачиш змін).
      </p>
      <p v-if="successText" class="admin-contacts-success">{{ successText }}</p>
      <p v-if="errorText" class="admin-contacts-error">{{ errorText }}</p>
    </div>
  </section>
</template>
