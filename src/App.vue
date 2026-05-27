<template>
  <header :class="['header', { 'header--home': isHome }]">
    <div class="header-inner">
      <NavBar />
    </div>
  </header>
  
  <main :class="['container', { 'container--home': isHome }]">
    <RouterView />
    <footer :class="['footer-strip', { 'footer-strip--home': isHome }]">
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
import '@/styles/header.css'

const route = useRoute()
const isHome = computed(() => route.name === 'Home')
</script>

<style>
body {
  margin: 0;
  font-family: 'Arial', sans-serif;
  background-color: #ffffff;
  color: #333333;
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
  padding: 0;
}

.container--home {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  padding: 0;
}

</style>