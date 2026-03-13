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
    { path: '/admin', component: AdminPortfolio, meta: { requiresAuth: true }}
  ]
})
router.beforeEach(async (to) => {
  // Якщо шлях починається на /admin — перевіряємо авторизацію
  if (to.path.startsWith('/admin')) {
    const { data } = await supabase.auth.getUser()

    if (!data.user) {
      return '/login' // Якщо юзера немає — на вихід до сторінки логіна
    }
  }
})
export default router
