<script setup>
import { ref } from 'vue'
import { login } from '@/supabase'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase' 

const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/admin/portfolio'
    }
  })

  if (error) {
    console.error('Помилка:', error.message)
    return
  }
}

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    await login(email.value, password.value)

    router.push('/admin')

  } catch (e) {

    error.value = 'Невірний email або пароль'

  }

  loading.value = false
}
</script>

<template>
  <div class="login">
    <h1>Вхід в адмінку</h1>
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Пароль"/>
    <button @click="handleLogin"> Увійти </button>
    <p v-if="error"> {{ error }} </p>
  </div>
  <div class="login-wrap">
    <h1>Вхід до системи</h1>
    <button @click="loginWithGoogle" class="google-btn">
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20">
      Увійти через Google
    </button>
    
  </div>
</template>
<style scoped>
.login-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}

.google-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: white;
  color: #757575;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 4px;
  font-family: sans-serif;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.google-btn:hover {
  background-color: #f1f1f1;
}
</style>