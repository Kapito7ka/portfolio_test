<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const loginError = ref('')

const loginWithGoogle = async () => {
  loginError.value = ''
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/admin/portfolio'
    }
  })
  if (error) loginError.value = "Помилка зв'язку з Google"
  if (!error) {
    // Зберігаємо час входу (в мілісекундах)
    localStorage.setItem('login_time', Date.now().toString())
  }
}

// Перевірка після редиректу, якщо пошта не підійшла
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('error') === 'access_denied') {
    loginError.value = "На жаль, акаунту з такою поштою не знайдено в дозволених."
  }
})
</script>

<template>
  <div class="login-container">
    <div class="auth-box">
      <h1>Вхід в систему</h1>
      <p>Доступ лише для адміністратора</p>
      
      <button @click="loginWithGoogle" class="google-btn">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20">
        Увійти через Google
      </button>

      <p v-if="loginError" class="error-msg">{{ loginError }}</p>
    </div>
  </div>
</template>

<style scoped>
.error-msg { color: #d93025; margin-top: 15px; font-weight: 500; }
</style>