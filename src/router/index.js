import { createRouter, createWebHistory } from 'vue-router'

import Portfolio from '../views/Portfolio.vue'
import About from '../views/About.vue'
import Contacts from '../views/Contacts.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Portfolio', component: Portfolio },
    { path: '/about', name: 'About', component: About },
    { path: '/contacts', name: 'Contacts', component: Contacts }
  ]
})

export default router
