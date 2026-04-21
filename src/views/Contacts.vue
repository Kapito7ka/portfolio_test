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
      text: 'Please enter a valid phone number (minimum 10 digits)', 
      type: 'error' 
    }
    return
  }
  const selectedDate = new Date(formData.value.booking_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (!formData.value.booking_date || selectedDate < today) {
    statusMsg.value = { 
      text: 'Please select today or a future date', 
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
    statusMsg.value = { text: 'Error: ' + error.message, type: 'error' }
  } else {
    statusMsg.value = { text: 'Booking request sent successfully!', type: 'success' }
    formData.value = { full_name: '', booking_date: '', location: '', phone: '', extra_questions: '' }
  }
  isSending.value = false
}
</script>

<template>
  <section>
    <h1>Contacts</h1>
    <ContactList :contacts="contacts" />
  </section>
  <div class="contacts-page">
    <h2>Send a Booking Request</h2>
    
    <form @submit.prevent="sendBooking" class="booking-form">
      <div class="form-group">
        <label>Your Name</label>
        <input v-model="formData.full_name" type="text" required placeholder="Full Name">
      </div>

      <div class="form-group">
        <label>Preferred Date</label>
        <input v-model="formData.booking_date" type="date" required>
      </div>

      <div class="form-group">
        <label>Location</label>
        <input v-model="formData.location" type="text" required placeholder="City or specific location">
      </div>

      <div class="form-group">
        <label>Phone</label>
        <input v-model="formData.phone" type="tel" required placeholder="+1...">
      </div>

      <div class="form-group">
        <label>Additional Questions</label>
        <textarea v-model="formData.extra_questions" rows="4"></textarea>
      </div>

      <button type="submit" :disabled="isSending">
        {{ isSending ? 'Sending...' : 'Book Now' }}
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