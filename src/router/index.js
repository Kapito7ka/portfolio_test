import { createRouter, createWebHistory } from 'vue-router'

import Portfolio from '../views/Portfolio.vue'
import About from '../views/About.vue'
import Contacts from '../views/Contacts.vue'
import AdminAbout from '../views/admin/AdminAbout.vue'
import AdminContacts from '../views/admin/AdminContacts.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Portfolio', component: Portfolio },
    { path: '/about', name: 'About', component: About },
    { path: '/contacts', name: 'Contacts', component: Contacts },
    { path: '/admin/about', name: 'AdminAbout', component: () => import('@/views/admin/AdminAbout.vue')},
    { path: '/admin/contacts', name: 'AdminContacts', component: AdminContacts }
  ]
})

export default router
