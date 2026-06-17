import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/phone-lookup',
        name: 'PhoneLookup',
        component: () => import('../views/PhoneLookup.vue'),
        meta: { requiresAuth: true }
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
        path: '/class/:id',
        name: 'ClassDetail',
        component: () => import('../views/ClassDetail.vue'),
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
    },
    {
        path: '/card',
        name: 'MyCard',
        component: () => import('../views/MemberCardView.vue')
    },
    {
        path: '/card/:id',
        name: 'MemberCardView',
        component: () => import('../views/MemberCardView.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // phone-lookup และ profile-setup: ผ่านได้ถ้า login แล้ว
    if (to.path === '/phone-lookup' || to.path === '/profile-setup') {
        if (authStore.isAuthenticated) {
            next()
            return
        }
        next('/')
        return
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/')
        return
    }

    // ถ้ายังไม่ setup profile ให้ไปหน้า phone-lookup ก่อนเสมอ
    if (to.meta.requiresProfile && authStore.needsProfileSetup) {
        next('/phone-lookup')
        return
    }

    if (to.meta.requiresAdmin && !authStore.canAccessAdmin) {
        next('/')
        return
    }

    next()
})

export default router