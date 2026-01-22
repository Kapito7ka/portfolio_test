<script setup>
defineProps({
  contacts: {
    type: Object,
    default: null
  }
})
</script>

<template>
  <ul v-if="contacts">
    <li>Телефон: {{ contacts.phone }}</li>
    <li v-if="contacts.instagram">Instagram: <a :href="contacts.instagram" target="_blank">{{ contacts.instagram }}</a></li>
    <li v-if="contacts.facebook">Facebook: <a :href="contacts.facebook" target="_blank">{{ contacts.facebook }}</a></li>
    <li v-if="contacts.tiktok"> TikTok: <a :href="contacts.tiktok" target="_blank">{{ contacts.tiktok }}</a></li>
  </ul>
</template>