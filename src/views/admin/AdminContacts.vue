<script setup>
import ContactList from '@/components/ContactList.vue'
</script>

<template>
  <section class="admin-contacts">
    <h1>Адмінка · Контакти</h1>
    
    <div class="block">
      <h3>Редагування ваших контактів</h3>
      <ContactList editable />
    </div>    
  </section>
</template>

<style scoped>
.block { margin-bottom: 40px; }
</style>