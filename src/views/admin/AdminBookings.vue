<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import '@/styles/AdminBookings.css'

const bookings = ref([])
const isLoading = ref(true)

const fetchBookings = async () => {
  isLoading.value = true
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (!error) {
    bookings.value = data.map(item => ({
      ...item,
      isExpanded: false
    }))
  }
  isLoading.value = false
}

const deleteBooking = async (id) => {
  if (!confirm('Видалити цю заявку?')) return
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (!error) {
    bookings.value = bookings.value.filter(b => b.id !== id)
  }
}

onMounted(fetchBookings)
</script>

<template>
  <section class="admin-bookings">
    <h1>Заявки на бронювання</h1>
    
    <div v-if="isLoading">Завантаження заявок...</div>
    <div v-else-if="bookings.length === 0">Заявок поки немає</div>
    
    <table v-else class="bookings-table">
      <thead>
        <tr>
          <th>Дата створення</th>
          <th>Клієнт</th>
          <th>Дата зйомки</th>
          <th>Локація</th>
          <th>Телефон</th>
          <th>Коментар</th>
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in bookings" :key="booking.id">
          <td>{{ new Date(booking.created_at).toLocaleDateString() }}</td>
          <td>{{ booking.full_name }}</td>
          <td>{{ booking.booking_date }}</td>
          <td>{{ booking.location }}</td>
          <td><a :href="`tel:${booking.phone}`">{{ booking.phone }}</a></td>
          <td class="comment-cell">
            <div :class="{ 'expanded': booking.isExpanded }">
              {{ booking.extra_questions || '—' }}
            </div>
            <button v-if="booking.extra_questions && booking.extra_questions.length > 50" 
              @click="booking.isExpanded = !booking.isExpanded" class="btn-toggle">
              {{ booking.isExpanded ? 'Згорнути' : 'Читати далі' }}
            </button>
          </td>
          <td>
            <button @click="deleteBooking(booking.id)" class="btn-delete">Видалити</button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
