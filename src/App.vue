<template>
  <nav class="nav">
    <RouterLink to="/">Портфоліо</RouterLink>
    <RouterLink to="/about">Про нас</RouterLink>
    <RouterLink to="/contacts">Контакти</RouterLink>
  </nav>

  <main class="container">
    <RouterView />
  </main>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
.nav {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f3f3f3;
}

.nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

.nav a.router-link-active {
  color: #42b883;
}

.container {
  padding: 20px;
}
</style>
