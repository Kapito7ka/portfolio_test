<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'

const bookings = ref([])
const isLoading = ref(true)

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
  </section>
</template>

<style scoped>
.admin-bookings {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #000;
  margin-bottom: 20px;
}

.bookings-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: #ffffff;
  /* Чорні рамки */
  border: 1px solid #000000;
}

.bookings-table th, 
.bookings-table td {
  padding: 12px;
  /* Чорні рамки для клітинок */
  border: 1px solid #000000;
  text-align: left;
  color: #000000; /* Весь текст чорний */
}

.bookings-table th {
  background: #f0f0f0; /* Світло-сірий фон заголовків для контрасту */
  font-weight: bold;
}

/* Стиль для кнопки видалити */
.btn-delete {
  color: #ffffff;
  background: #000000; /* Чорна кнопка */
  border: 1px solid #000000;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 0; /* Прямі кути */
  font-weight: bold;
}

.btn-delete:hover {
  background: #333333;
}

/* Колір посилань телефону */
.bookings-table a {
  color: #000000;
  text-decoration: underline;
}

.btn-delete {
  color: #ffffff;
  background-color: #d32f2f; /* Приглушений, професійний червоний */
  border: none;             /* Прибираємо рамку для мінімалістичного вигляду */
  padding: 8px 16px;        /* Додаємо більше простору всередині */
  cursor: pointer;
  border-radius: 4px;       /* Легке заокруглення робить кнопку сучаснішою */
  font-weight: 500;         /* Менш жирний текст виглядає акуратніше */
  transition: background-color 0.2s ease;
}

.btn-delete:hover {
  background-color: #b71c1c; /* Темніший відтінок при наведенні */
}
</style>