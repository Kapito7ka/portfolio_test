<script setup>
import { ref, onMounted } from 'vue'
import { getContacts } from '@/services/contactsService.js'
const contacts = ref(null)
onMounted(async () => {
  contacts.value = await getContacts()
  }
)
</script>
<template>
  <section>
    <h1>Контакти</h1>
    <ul v-if="contacts">
      <li>Телефон: {{ contacts.phone }}</li>
      <li v-if="contacts.instagram"> Instagram: <a :href="contacts.instagram" target="_blank"> {{ contacts.instagram }} </a></li>
      <li v-if="contacts.facebook"> Facebook: <a :href="contacts.facebook" target="_blank"> {{ contacts.facebook }} </a></li>
    </ul>
  </section>
</template>
