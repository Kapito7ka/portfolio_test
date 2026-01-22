<script setup>
defineProps({
  title: String
})
defineEmits(['submit'])
</script>

<template>
  <form @submit.prevent="$emit('submit')">
    <h3>{{ title }}</h3>
    <input placeholder="Name" />
    <input placeholder="Email" />
    <button type="submit">Send</button>
  </form>
</template>