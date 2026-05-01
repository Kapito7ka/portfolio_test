<template>
  <header class="header">
    <div class="header-inner">
      <div class="logo">PARLBOCHYI</div>
      <div class="logo-subtitle">P  O  R  T  O  G  R  A  P  H  Y</div>
      <NavBar />
    </div>
  </header>
  
  <main class="container">
    <RouterView />
  <footer class="footer-strip">
    <div class="footer-container">
      <div class="footer-contacts">
        <a href="tel:+380970000000">+380 97 000 00 00</a>
        <span class="dot">•</span>
        <a href="mailto:contact@rybinskyi.com">contact@google.com</a>
      </div>
      <div class="footer-socials">
        <router-link to="/contacts">Контакти</router-link>
      </div>
    </div>
  </footer>
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBarAdmin.vue'
</script>

<style>
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: #ffffff;
  color: #1a1a1a;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}
</style>