<script setup>
import { isContactUrl } from '@/services/contactsService'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: false
  },
  isSaving: {
    type: Boolean,
    default: false
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  editingValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['start-edit', 'update:editingValue', 'save-edit', 'cancel-edit', 'remove'])

const isUrl = (v) => isContactUrl(v)

const onInputChange = (event) => {
  emit('update:editingValue', event.target.value)
}
</script>

<template>
  <li>
    <strong>{{ item.key }}:</strong>

    <template v-if="isEditing">
      <input :value="editingValue" :disabled="isSaving" @input="onInputChange" style="margin-left: 8px;" />
      <button type="button" :disabled="isSaving" @click="$emit('save-edit')" style="margin-left: 8px;"> Зберегти </button>
      <button type="button" :disabled="isSaving" @click="$emit('cancel-edit')" style="margin-left: 8px;"> Скасувати </button>
    </template>

    <template v-else>
      <template v-if="isUrl(item.value)">
        <a :href="item.value" target="_blank" rel="noopener noreferrer">
          {{ item.value }}
        </a>
      </template>
      <template v-else>
        {{ item.value }}
      </template>

      <template v-if="editable">
        <button type="button" :disabled="isSaving" @click="$emit('start-edit', item)" style="margin-left: 10px;"> Редагувати </button>
        <button type="button" :disabled="isSaving" @click="$emit('remove', item)" style="margin-left: 10px;"> Видалити </button>
      </template>
    </template>
  </li>
</template>

