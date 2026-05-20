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
  color: #111;
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.08em;
  transition: color 0.25s ease, transform 0.2s ease;
}

a:hover {
  color: #000;
  font-weight: 700;
  transform: scale(1.04);
}

a.router-link-active {
  color: #000;
  font-weight: 700;
}
</style>
