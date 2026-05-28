import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './styles/styles.css'
import './styles/header.css'
import './styles/footer.css'
import './styles/collection-card.css'
import './styles/portfolio-slider.css'
import './styles/category-slider.css'
import './styles/portfolio.css'
createApp(App).use(router).mount('#app')