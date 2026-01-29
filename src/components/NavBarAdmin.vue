<script setup>
import { RouterLink } from 'vue-router'
</script>
<template>
  <nav class="nav">
    <RouterLink to="/">Портфоліо</RouterLink>
    <RouterLink to="/about">Про нас</RouterLink>
    <RouterLink to="/contacts">Контакти</RouterLink>
    <RouterLink to="/admin/about">Адмін про нас</RouterLink>
    <RouterLink to="/admin/contacts">Адмін контакти</RouterLink>
  </nav>
</template>
