<script setup>
const props = defineProps({
  newKey: {
    type: String,
    default: ''
  },
  newValue: {
    type: String,
    default: ''
  },
  isSaving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:newKey', 'update:newValue', 'submit'])

const onSubmit = () => {
  emit('submit')
}
</script>

<template>
  <form @submit.prevent="onSubmit" style="margin-top: 16px;">
    <h3>Додати контакт</h3>
    <input
      :value="newKey"
      placeholder="Назва (наприклад: instagram)"
      @input="emit('update:newKey', $event.target.value)"
    />
    <input
      :value="newValue"
      placeholder="посилання або телефон"
      @input="emit('update:newValue', $event.target.value)"
    />
    <button type="submit" :disabled="isSaving"> Зберегти </button>
  </form>
</template>

