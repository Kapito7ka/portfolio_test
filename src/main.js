import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './services/styles/styles.css'


createApp(App).use(router).mount('#app')