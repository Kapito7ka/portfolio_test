<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import ContactList from '@/components/ContactList.vue'

const bookings = ref([])
const isLoading = ref(true)

// Функція для отримання заявок
const fetchBookings = async () => {
  isLoading.value = true
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (!error) {
    bookings.value = data
  }
  isLoading.value = false
}

// Функція для видалення заявки
const deleteBooking = async (id) => {
  if (!confirm('Видалити цю заявку?')) return
  
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id)
  
  if (!error) {
    bookings.value = bookings.value.filter(b => b.id !== id)
  }
}

onMounted(fetchBookings)
</script>

<template>
  <section class="admin-contacts">
    <h1>Адмінка · Контакти</h1>
    
    <div class="block">
      <h3>Редагування ваших контактів</h3>
      <ContactList editable />
    </div>

    <hr />

    <div class="block">
      <h3>Заявки на бронювання</h3>
      
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
            <td>
              <button @click="deleteBooking(booking.id)" class="btn-delete">Видалити</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.block { margin-bottom: 40px; }
.bookings-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #fff; }
.bookings-table th, .bookings-table td { padding: 12px; border: 1px solid #eee; text-align: left; }
.bookings-table th { background: #f9f9f9; }
.btn-delete { color: white; background: #ff4d4d; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; }
.btn-delete:hover { background: #ff1a1a; }
hr { margin: 40px 0; border: 0; border-top: 1px solid #eee; }
</style>