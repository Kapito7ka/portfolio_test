<template>
  <NavBarAdmin />
  
  <main class="container">
    <RouterView />
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router'
// Імпортуємо  адмінський натбар
import NavBarAdmin from '@/components/NavBarAdmin.vue'
</script>

<style>
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #fafafa;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>