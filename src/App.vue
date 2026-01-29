<template>
  <NavBar />
  <main class="container">
    <RouterView />
  </main>
</template>
<script setup>
import { RouterView } from 'vue-router'
//import NavBar from '@/components/NavBar.vue'
import NavBar from '@/components/NavBarAdmin.vue'
</script>
