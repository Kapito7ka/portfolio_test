<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const router = useRouter()
const user = ref(null)

onMounted(async () => {
  // 1. Перевіряємо статус при завантаженні
  const { data } = await supabase.auth.getUser()
  user.value = data.user

  // 2. Слухаємо зміни стану в реальному часі
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null
  })
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  user.value = null
  router.push('/') // Повертаємо на головну після виходу
}
</script>

<template>
  <nav class="nav">
    <RouterLink to="/slides">home</RouterLink>
    <RouterLink to="/">portfolio</RouterLink>
    <RouterLink to="/about">about me</RouterLink>
    <RouterLink to="/contacts">contacts</RouterLink>

    <template v-if="user">
      <span class="divider">|</span>
      <RouterLink to="/admin/portfolio" class="nav-item admin">Адмін портфоліо</RouterLink>
      <RouterLink to="/admin/about" class="nav-item admin">Адмін про нас</RouterLink>
      <RouterLink to="/admin/contacts" class="nav-item admin">Адмін контакти</RouterLink>
      <RouterLink to="/admin/home" class="nav-item admin">Адмін слайди</RouterLink>
      <RouterLink to="/admin/bookings" class="nav-item admin">Заявки</RouterLink>
      <button @click="handleLogout" class="logout-btn">Вийти</button>
    </template>

    <RouterLink v-else to="/login" class="login-link">Login</RouterLink>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  gap: 40px;
  justify-content: center;
  background: transparent;
  padding: 0;
  align-items: center;
}

.nav-item {
  text-decoration: none;
  color: #333;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.nav-item:hover {
  color: #ff6b6b;
}

.nav-item.router-link-active {
  color: #ff6b6b;
}

.nav-item.admin {
  color: #333;
}

.nav-item.admin:hover {
  color: #ff6b6b;
}

.divider {
  color: #ccc;
}

.logout-btn {
  text-decoration: none;
  color: #333;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.5px;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
}

.logout-btn:hover {
  color: #ff6b6b;
}

a.login-link {
  text-decoration: none;
  color: #333;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

a.login-link:hover {
  color: #ff6b6b;
}
</style>