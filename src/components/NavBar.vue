<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <nav class="nav">
    <RouterLink to="/">home</RouterLink> 
    <RouterLink to="/portfolio">portfolio</RouterLink>
    <RouterLink to="/about">about me</RouterLink>
    <RouterLink to="/contacts">contacts</RouterLink>
  </nav>
</template>

<style scoped>
.nav {
  display: flex;
  gap: 40px;
  justify-content: center;
  background: transparent;
  padding: 0;
}

a {
  text-decoration: none;
  color: #333;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

a:hover {
  color: #ff6b6b;
}

a.router-link-active {
  color: #ff6b6b;
}
</style>
