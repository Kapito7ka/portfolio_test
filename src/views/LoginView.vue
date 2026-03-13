<script setup>
import { ref } from 'vue'
import { login } from '@/supabase'
import { useRouter } from 'vue-router'

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

    <input
      v-model="email"
      type="email"
      placeholder="Email"
    />

    <input
      v-model="password"
      type="password"
      placeholder="Пароль"
    />

    <button @click="handleLogin">
      Увійти
    </button>

    <p v-if="error">
      {{ error }}
    </p>

  </div>
</template>