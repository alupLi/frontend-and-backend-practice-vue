import { createRouter, createWebHistory } from 'vue-router'

// Импортируем компоненты
import HomePage from '../pages/HomePage.vue'
import AdvancedPage from '../pages/AdvancedPage.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage
    },
    {
        path: '/advanced',
        name: 'Advanced',
        component: AdvancedPage
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router