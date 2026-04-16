import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/views/Layout.vue'
import Login from '@/views/Login.vue'
import Shop from '@/views/Shop.vue'
import ShopType from '@/views/ShopType.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/shop',
    children: [
      {
        path: 'shop',
        name: 'Shop',
        component: Shop,
        meta: { title: '商铺管理', requiresAuth: true }
      },
      {
        path: 'shop-type',
        name: 'ShopType',
        component: ShopType,
        meta: { title: '商铺类型管理', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.meta.requiresAuth !== false

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 点评后台管理系统`
  }

  if (requiresAuth && !token) {
    // 需要登录但未登录，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录用户访问登录页，跳转到首页
    next('/')
  } else {
    next()
  }
})

export default router
