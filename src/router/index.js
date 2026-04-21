import { createRouter, createWebHistory } from 'vue-router'

import Portfolio from '../views/Portfolio.vue'
import About from '../views/About.vue'
import Contacts from '../views/Contacts.vue'
import AdminAbout from '../views/admin/AdminAbout.vue'
import AdminContacts from '../views/admin/AdminContacts.vue'
import AdminPortfolio from '../views/admin/AdminPortfolio.vue'
import { getUser } from '@/supabase'
import { supabase } from '@/supabase'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Portfolio', component: Portfolio },
    { path: '/portfolio/:categoryId', name: 'CategoryCollections', component: () => import('../views/CategoryCollections.vue') },
    { path: '/collections/:categoryId/:collectionId', name: 'Collection', component: () => import('../views/Collection.vue') },
    { path: '/about', name: 'About', component: About },
    { path: '/contacts', name: 'Contacts', component: Contacts },
    { path: '/login', name: 'Login', component: LoginView },
    { path: '/admin/portfolio', name: 'AdminPortfolio', component: AdminPortfolio },
    { path: '/admin/about', name: 'AdminAbout', component: () => import('@/views/admin/AdminAbout.vue')},
    { path: '/admin/contacts', name: 'AdminContacts', component: AdminContacts },
    { path: '/admin', component: AdminPortfolio, meta: { requiresAuth: true }},
    {path: '/admin/slides',name: 'AdminSlides',component: () => import('@/views/admin/AdminSlides.vue'),meta: { requiresAuth: true }},
    {path: '/admin/bookings', name: 'AdminBookings', component: () => import('@/views/admin/AdminBookings.vue'), meta: { requiresAuth: true }}
  ]
})
router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()
  const loginTime = localStorage.getItem('login_time')
  const oneDay = 24 * 60 * 60 * 1000 

  // Якщо минуло більше доби з моменту запису часу входу
  if (loginTime && (Date.now() - parseInt(loginTime) > oneDay)) {
    localStorage.removeItem('login_time')
    await supabase.auth.signOut()
    return next('/login')
  }
  // перевірка email...
  const allowedEmail = import.meta.env.VITE_ALLOWED_EMAIL
  if (to.path.startsWith('/admin')) {
    if (user && user.email === allowedEmail) {
      next()
    } else {
      if (user) await supabase.auth.signOut()
      next({ path: '/login', query: { error: 'access_denied' } })
    }
  } else {
    next()
  }
})
export default router