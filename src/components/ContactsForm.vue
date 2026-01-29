<script setup>
import { ref } from 'vue'
defineProps({
  title: String
})
const emit = defineEmits(['submit'])
const key = ref('')
const value = ref('')

const submitform = () => {
  if ( !key.value || !value.value )
  emit('submit', {
    key: key.value,
    value: value.value
})
    key.value=''
    value.value=''
}
</script>

<template>
  <form @submit.prevent="submitForm">
    <h3>{{ title }}</h3>
    <input v-model = "key" placeholder="Social network name" />
    <input v-model = "value" placeholder="Social network link or numder" />
    <button type="submit">Save</button>
  </form>
</template> 