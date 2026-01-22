<script setup>
defineProps({ label: String })
defineEmits(['click'])
</script>

<template>
  <button @click="$emit('click')">
    {{ label }}
  </button>
</template>