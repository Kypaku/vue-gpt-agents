import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import Settings from '../views/Settings.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/settings',
        name: 'Settings',
        component: Settings
    },
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/agents/:id',
        name: 'Agents',
        component: Home
    },
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router
