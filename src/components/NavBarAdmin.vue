<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { supabase } from '@/supabase'
import logoDefault from '@/logo/image 2.svg'
import logoHome from '@/logo/image 1.svg'

const router = useRouter()
const route = useRoute()
const user = ref(null)

const isHome = computed(() => String(route.name || '').toLowerCase() === 'home')
const logoUrl = computed(() => (isHome.value ? logoHome : logoDefault))

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  user.value = data.user

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null
  })
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  user.value = null
  router.push('/')
}
</script>

<template>
  <div :class="['site-header', { home: isHome }]">
    <div class="top-row">
      <nav class="public-nav public-nav-left">
        <RouterLink to="/" class="nav-link">home</RouterLink>
        <RouterLink to="/portfolio" class="nav-link">portfolio</RouterLink>
      </nav>

      <RouterLink to="/" class="logo-link" aria-label="Головна">
        <img :src="logoUrl" alt="" class="logo-image" />
      </RouterLink>

      <nav class="public-nav public-nav-right">
        <RouterLink to="/about" class="nav-link">about me</RouterLink>
        <RouterLink to="/contacts" class="nav-link">contacts</RouterLink>
        <RouterLink v-if="!user" to="/login" class="nav-link">login</RouterLink>
      </nav>
    </div>

    <nav v-if="user" class="admin-nav">
      <RouterLink to="/admin/portfolio" class="admin-link">Адмін портфоліо</RouterLink>
      <RouterLink to="/admin/about" class="admin-link">Адмін про нас</RouterLink>
      <RouterLink to="/admin/contacts" class="admin-link">Адмін контакти</RouterLink>
      <RouterLink to="/admin/slides" class="admin-link">Адмін слайди</RouterLink>
      <RouterLink to="/admin/bookings" class="admin-link">Заявки</RouterLink>
      <button type="button" @click="handleLogout" class="admin-link logout-btn">Вийти</button>
    </nav>
  </div>
</template>

<style scoped>
.site-header {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.top-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  column-gap: 48px;
  min-height: 48px;
  align-items: center;
  padding: 0 15px;
}

.logo-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 220px;
  height: auto;
  display: block;
}

.public-nav {
  display: flex;
  gap: 28px;
  align-items: center;
  min-width: 0;
}

.public-nav-left {
  justify-content: flex-end;
}

.public-nav-right {
  justify-content: flex-start;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
  text-transform: lowercase;
}

.site-header.home .nav-link {
  color: #fff;
}

.nav-link:hover {
  color: #ff6b6b;
}

.nav-link.router-link-active {
  color: #ff6b6b;
}

.admin-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 22px;
}

.admin-link {
  text-decoration: none;
  color: #3c3c3c;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

.admin-link:hover,
.admin-link.router-link-active {
  color: #ff6b6b;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
}

@media (max-width: 1100px) {
  .logo-image {
    width: 180px;
  }

  .public-nav {
    gap: 24px;
  }

  .nav-link {
    font-size: 18px;
  }

  .admin-link {
    font-size: 14px;
  }
}

@media (max-width: 760px) {
  .top-row {
    grid-template-columns: 1fr;
    gap: 14px;
    padding: 0;
  }

  .logo-link {
    order: -1;
  }

  .public-nav {
    justify-content: center;
    flex-wrap: wrap;
    row-gap: 8px;
  }

  .admin-nav {
    flex-wrap: wrap;
    row-gap: 8px;
  }
}
</style>
