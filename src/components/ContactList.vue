<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  deleteContactField,
  getContacts,
  setContactField,
  normalizeContactEntries,
  isContactUrl
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

onMounted(async () => {
  if (!contactsState.value) {
    contactsState.value = await getContacts()
  }
})

const entries = computed(() => normalizeContactEntries(contactsState.value))

const isUrl = (v) => isContactUrl(v)

const addField = async () => {
  const key = newKey.value.trim()
  const value = newValue.value.trim()
  if (!key || !value) return

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
  const value = editingValue.value.trim()
  if (!key || !value) return

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
  <div>
    <ul v-if="contactsState">
      <li v-for="item in entries" :key="item.key">
        <strong>{{ item.key }}:</strong>
        
        <template v-if="editingKey === item.key">
          <input v-model="editingValue" :disabled="isSaving" style="margin-left: 8px;" />
          <button type="button" :disabled="isSaving" @click="saveEdit" style="margin-left: 8px;"> Зберегти </button>
          <button type="button" :disabled="isSaving" @click="cancelEdit" style="margin-left: 8px;"> Скасувати </button>
        </template>
        
        <template v-else>
          <template v-if="isUrl(item.value)">
            <a :href="item.value" target="_blank" rel="noopener noreferrer"> {{ item.value }}</a>
          </template>
          <template v-else> {{ item.value }} </template>
          
          <template v-if="editable">
            <button type="button" :disabled="isSaving" @click="startEdit(item.key, item.value)" style="margin-left: 10px;"> Редагувати </button>
            <button type="button" :disabled="isSaving" @click="removeField(item.key)" style="margin-left: 10px;"> Видалити </button>
          </template>
        </template>
      </li>
    </ul>

    <p v-else>Контакти не знайдено.</p>

    <form v-if="editable" @submit.prevent="addField" style="margin-top: 16px;">
      <h3>Додати контакт</h3>
      <input v-model="newKey" placeholder="Ключ (наприклад: instagram)" />
      <input v-model="newValue" placeholder="Значення (посилання або телефон)" />
      <button type="submit" :disabled="isSaving"> Зберегти </button>
    </form>
  </div>
</template>