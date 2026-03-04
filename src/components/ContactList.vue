<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  deleteContactField,
  getContacts,
  setContactField,
  normalizeContactEntries,
  isContactUrl,
  isValidContactKey,
  isValidContactValue,
  normalizeContactKey,
  normalizeContactValue
} from '@/services/contactsService'

const props = defineProps({
  contacts: {
    type: Object,
    default: null
  },
  editable: {
    type: Boolean,
    default: false
  }
})

const contactsState = ref(props.contacts)

watch(
  () => props.contacts,
  (v) => {
    contactsState.value = v
  }
)

const newKey = ref('')
const newValue = ref('')
const isSaving = ref(false)
const editingKey = ref(null)
const editingValue = ref('')
const errorText = ref('')

onMounted(async () => {
  if (!contactsState.value) {
    contactsState.value = await getContacts()
  }
})

const entries = computed(() => normalizeContactEntries(contactsState.value))

const isUrl = (v) => isContactUrl(v)

const displayKey = (key) => {
  const k = normalizeContactKey(key)
  const lower = k.toLowerCase()
  if (lower === 'phone' || lower === 'tel' || lower === 'telephone') return 'Телефон'
  if (lower === 'instagram') return 'Instagram'
  if (lower === 'facebook') return 'Facebook'
  if (lower === 'tiktok') return 'TikTok'
  if (lower === 'threads' || lower === 'treads') return 'Threads'
  if (!k) return ''
  return k.charAt(0).toUpperCase() + k.slice(1)
}

const addField = async () => {
  errorText.value = ''
  const key = normalizeContactKey(newKey.value)
  const value = normalizeContactValue(newValue.value)
  if (!isValidContactKey(key) || !isValidContactValue(value)) {
    errorText.value = 'Некоректний контакт: перевір назву та значення (не можна null/None/-1/порожнє).'
    return
  }

  isSaving.value = true
  const ok = await setContactField(key, value)
  if (ok) {
    contactsState.value = { ...(contactsState.value || {}), [key]: value }
    newKey.value = ''
    newValue.value = ''
  }
  isSaving.value = false
}

const removeField = async (key) => {
  if (!key) return
  isSaving.value = true
  const ok = await deleteContactField(key)
  if (ok && contactsState.value) {
    const next = { ...contactsState.value }
    delete next[key]
    contactsState.value = next
  }
  isSaving.value = false
}

const startEdit = (key, value) => {
  editingKey.value = key
  editingValue.value = value
}

const cancelEdit = () => {
  editingKey.value = null
  editingValue.value = ''
}

const saveEdit = async () => {
  const key = editingKey.value
  errorText.value = ''
  const value = normalizeContactValue(editingValue.value)
  if (!isValidContactKey(key) || !isValidContactValue(value)) {
    errorText.value = 'Некоректне значення контакту (не можна null/None/-1/порожнє).'
    return
  }

  isSaving.value = true
  const ok = await setContactField(key, value)
  if (ok && contactsState.value) {
    contactsState.value = { ...contactsState.value, [key]: value }
    cancelEdit()
  }
  isSaving.value = false
}
</script>

<template>
  <div class="contact-list">
    <ul v-if="contactsState">
      <li v-for="item in entries" :key="item.key" class="contactRow">
        <strong class="contactKey">{{ displayKey(item.key) }}:</strong>
        
        <template v-if="editingKey === item.key">
          <input v-model="editingValue" :disabled="isSaving" class="contactInput" />
          <button type="button" :disabled="isSaving" @click="saveEdit">Зберегти</button>
          <button type="button" :disabled="isSaving" @click="cancelEdit">Скасувати</button>
        </template>
        
        <template v-else>
          <template v-if="isUrl(item.value.trim())">
            <a :href="item.value" target="_blank" rel="noopener noreferrer" class="contactValue">
              {{ item.value }}
            </a>
          </template>
          <template v-else>
            <span class="contactValue">{{ item.value }}</span>
          </template>
          
          <template v-if="editable">
            <span class="contactActions">
              <button type="button" :disabled="isSaving" @click="startEdit(item.key, item.value)">Редагувати</button>
              <button type="button" :disabled="isSaving" @click="removeField(item.key)">Видалити</button>
            </span>
          </template>
        </template>
      </li>
    </ul>

    <p v-else>Контакти не знайдено.</p>

    <form v-if="editable" @submit.prevent="addField" style="margin-top: 16px;">
      <h3>Додати контакт</h3>
      <input v-model="newKey" placeholder="Ключ (наприклад: instagram)" />
      <input v-model="newValue" placeholder="Значення (посилання або телефон)" />
      <!-- multiple -->
      <button type="submit" :disabled="isSaving"> Зберегти </button>
      <p v-if="errorText" class="contactError">{{ errorText }}</p>
    </form>
  </div>
</template>