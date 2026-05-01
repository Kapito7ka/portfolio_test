<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { getContacts } from '@/services/contactsService'
import ContactList from '@/components/ContactList.vue'
import '@/styles/Contacts.css'
import { Instagram, Send, MessageCircle } from 'lucide-vue-next'
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
  <div class="contacts-page">
    <section class="contacts-info-section">
      <h1>Contacts</h1>
      
      <div class="contact-methods">
        <p class="email-text">photog@example.com</p>
        <p class="phone-text">+380 97 000 00 00</p>
      </div>
      <div class="social-grid">
        <a href="https://instagram.com/..." target="_blank" class="social-link-btn">
          <Instagram :size="16" stroke-width="1.5" />
          <span>Instagram</span>
        </a>
        <a href="https://t.me/..." target="_blank" class="social-link-btn">
          <Send :size="16" stroke-width="1.5" />
          <span>Telegram</span>
        </a>
        <a href="https://wa.me/..." target="_blank" class="social-link-btn">
          <MessageCircle :size="16" stroke-width="1.5" />
          <span>WhatsApp</span>
        </a>
      </div>
    </section>

    <section class="booking-section">
      <h2 class="form-title">Send a Booking Request</h2>
      
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
          <input v-model="formData.phone" type="tel" required placeholder="+380...">
        </div>

        <div class="form-group">
          <label>Additional Questions</label>
          <textarea v-model="formData.extra_questions" maxlength="300" placeholder="Ваш запит..."rows="4"></textarea>
          <small v-if="formData.extra_questions">{{ formData.extra_questions.length }}/300</small>
        </div>

        <button type="submit" :disabled="isSending" class="submit-btn">
          {{ isSending ? 'Sending...' : 'Book Now' }}
        </button>

        <p v-if="statusMsg.text" :class="statusMsg.type" class="status-message">
          {{ statusMsg.text }}
        </p>
      </form>
    </section>
  </div>
</template>