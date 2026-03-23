<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { getContacts } from '@/services/contactsService'
import ContactList from '@/components/ContactList.vue'
const contacts = ref(null)
onMounted(async () => {
  contacts.value = await getContacts()
})
const formData = ref({
  full_name: '',
  booking_date: '',
  location: '',
  phone: '',
  extra_questions: ''
})

const isSending = ref(false)
const statusMsg = ref({ text: '', type: '' })

const sendBooking = async () => {
  const cleanPhone = formData.value.phone.replace(/\D/g, '')
  if (cleanPhone.length < 10 || cleanPhone.length > 13) {
    statusMsg.value = { 
      text: 'Введіть коректний номер телефону (мінімум 10 цифр)', 
      type: 'error' 
    }
    return
  }
  const selectedDate = new Date(formData.value.booking_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (!formData.value.booking_date || selectedDate < today) {
    statusMsg.value = { 
      text: 'Не можна обрати минулу дату. Оберіть сьогоднішній або майбутній день.', 
      type: 'error' 
    }
    return
  }
  isSending.value = true
  statusMsg.value = { text: '', type: '' }

  const { error } = await supabase
    .from('bookings')
    .insert([formData.value])

  if (error) {
    statusMsg.value = { text: 'Помилка: ' + error.message, type: 'error' }
  } else {
    statusMsg.value = { text: 'Заявку успішно надіслано!', type: 'success' }
    formData.value = { full_name: '', booking_date: '', location: '', phone: '', extra_questions: '' }
  }
  isSending.value = false
}
</script>

<template>
  <section>
    <h1>Контакти</h1>
    <ContactList :contacts="contacts" />
  </section>
  <div class="contacts-page">
    <h2>Залишити заявку на зйомку</h2>
    
    <form @submit.prevent="sendBooking" class="booking-form">
      <div class="form-group">
        <label>Ваше ім'я</label>
        <input v-model="formData.full_name" type="text" required placeholder="Ім'я та Прізвище">
      </div>

      <div class="form-group">
        <label>Бажана дата</label>
        <input v-model="formData.booking_date" type="date" required>
      </div>

      <div class="form-group">
        <label>Локація</label>
        <input v-model="formData.location" type="text" required placeholder="Місто або конкретна локація">
      </div>

      <div class="form-group">
        <label>Телефон</label>
        <input v-model="formData.phone" type="tel" required placeholder="+380...">
      </div>

      <div class="form-group">
        <label>Додаткові питання</label>
        <textarea v-model="formData.extra_questions" rows="4"></textarea>
      </div>

      <button type="submit" :disabled="isSending">
        {{ isSending ? 'Відправка...' : 'Забронювати' }}
      </button>

      <p v-if="statusMsg.text" :class="statusMsg.type">{{ statusMsg.text }}</p>
    </form>
  </div>
</template>
<style scoped>
.booking-form { max-width: 500px; margin: 0 auto; display: flex; flex-direction: column; gap: 15px; }
.form-group { display: flex; flex-direction: column; text-align: left; }
.success { color: green; }
.error { color: red; }
button { background: #333; color: white; padding: 10px; border: none; cursor: pointer; }
button:disabled { background: #ccc; }
</style>