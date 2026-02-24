import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/profile-setup',
        name: 'ProfileSetup',
        component: () => import('../views/ProfileSetup.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/booking',
        name: 'Booking',
        component: () => import('../views/Booking.vue'),
        meta: { requiresAuth: true, requiresProfile: true }
    },
    {
        path: '/history',
        name: 'History',
        component: () => import('../views/History.vue'),
        meta: { requiresAuth: true, requiresProfile: true }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('../views/Admin.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, requiresProfile: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/')
        return
    }

    if (to.meta.requiresProfile && authStore.needsProfileSetup) {
        next('/profile-setup')
        return
    }

    if (to.meta.requiresAdmin && !authStore.isAdmin) {
        next('/')
        return
    }

    next()
})

export default router