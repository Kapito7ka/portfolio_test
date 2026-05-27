<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import '@/styles/AdminBookings.css'

const bookings = ref([])
const isLoading = ref(true)

const fetchBookings = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      // Сортуємо за РЕАЛЬНИМ стовпчиком із бази — booking_date
      .order('booking_date', { ascending: true }) 
    
    if (!error) {
      bookings.value = data
      console.log("Успішно завантажено заявки:", data)
    } else {
      console.error("Помилка Supabase:", error.message)
    }
  } catch (err) {
    console.error("Критична помилка запиту:", err)
  } finally {
    isLoading.value = false
  }
}

const toggleStatus = async (booking) => {
  const nextStatus = booking.status === 'pending' ? 'approved' : 'pending'
  
  const { error } = await supabase
    .from('bookings')
    .update({ status: nextStatus })
    .eq('id', booking.id)

  if (!error) {
    booking.status = nextStatus
  } else {
    alert('Не вдалося змінити статус')
  }
}

const deleteBooking = async (id) => {
  if (!confirm('Видалити цю заявку безповоротно?')) return
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (!error) {
    bookings.value = bookings.value.filter(b => b.id !== id)
  }
}

// Форматуємо дату (РРРР-ММ-ДД -> ДД.ММ.РРРР)
const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`
    }
    return dateStr
  } catch (e) {
    return dateStr
  }
}

onMounted(fetchBookings)
</script>

<template>
  <section class="admin-bookings">
    <h1>Заявки на бронювання</h1>
    
    <div v-if="isLoading" class="loading-state">Завантаження заявок...</div>
    <div v-else-if="bookings.length === 0" class="empty-state">Заявок поки немає</div>
    
    <div v-else class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Клієнт</th>
            <th>Телефон</th>
            <th>Дата зйомки</th>
            <th>Локація</th>
            <th>Статус</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="booking in bookings" :key="booking.id" :class="`status-${booking.status || 'pending'}`">
            <td class="client-name">{{ booking.full_name || 'Без імені' }}</td>
            
            <td class="client-phone">
              <a v-if="booking.phone" :href="`tel:${booking.phone}`">{{ booking.phone }}</a>
              <span v-else>—</span>
            </td>
            
            <td class="booking-date">
              <span class="date-badge">{{ formatDate(booking.booking_date) }}</span>
            </td>

            <td class="booking-location">
              {{ booking.location || '—' }}
            </td>
            
            <td class="booking-status">
              <button 
                type="button" 
                class="status-badge" 
                :class="booking.status || 'pending'"
                @click="toggleStatus(booking)"
                title="Змінити статус"
              >
                {{ booking.status === 'approved' ? 'Підтверджено' : 'В очікуванні' }}
              </button>
            </td>
            
            <td class="actions">
              <button @click="deleteBooking(booking.id)" class="delete-btn">
                Видалити
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>