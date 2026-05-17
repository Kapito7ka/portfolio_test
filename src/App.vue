<template>
  <header :class="['header', { 'header--home': isHome }]">
    <div class="header-inner">
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
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import NavBar from '@/components/NavBarAdmin.vue'

const route = useRoute()
const isHome = computed(() => route.name === 'Home')
</script>

<style>
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: #000000;
  color: #ffffff;
  overflow-x: hidden;
}

html, body, #app {
  width: 100%;
  min-width: 100%;
}

.container {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 96px 0 0;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #ffffff;
  border-bottom: 1px solid rgba(0,0,0,0.06);
  backdrop-filter: none;
}

.header .nav-link,
.header .nav-link.router-link-active {
  color: #222;
}

.header--home {
  background: transparent;
}

.header--home .nav-link,
.header--home .nav-link.router-link-active {
  color: #fff;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px 20px 14px;
}
</style>