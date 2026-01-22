<script setup>
import { ref, onMounted } from 'vue'
import { getContacts } from '@/services/contactsService'
import ContactList from '@/components/ContactList.vue'
const contacts = ref(null)
onMounted(async () => {
  contacts.value = await getContacts()
})
</script>

<template>
  <section>
    <h1>Контакти</h1>
    <ContactList :contacts="contacts" />
  </section>
</template>
