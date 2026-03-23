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
    <RouterLink to="/" class="nav-item">Портфоліо</RouterLink>
    <RouterLink to="/about" class="nav-item">Про нас</RouterLink>
    <RouterLink to="/contacts" class="nav-item">Контакти</RouterLink>

    <template v-if="user">
      <span class="divider">|</span>
      <RouterLink to="/admin/portfolio" class="nav-item admin">Адмін портфоліо</RouterLink>
      <RouterLink to="/admin/about" class="nav-item admin">Адмін про нас</RouterLink>
      <RouterLink to="/admin/contacts" class="nav-item admin">Адмін контакти</RouterLink>
      <RouterLink to="/admin/slides" class="nav-item admin">Адмін слайди</RouterLink>
      
      <button @click="handleLogout" class="logout-btn">Вийти</button>
    </template>

    <RouterLink v-else to="/login" class="login-link">Увійти</RouterLink>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}
.nav-item { text-decoration: none; color: #333; font-weight: 500; }
.admin { color: #d9534f; }
.divider { color: #ccc; }

.logout-btn {
  margin-left: auto;
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.login-link {
  margin-left: auto;
  text-decoration: none;
  background: #28a745;
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
}
</style>