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
  </main>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
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