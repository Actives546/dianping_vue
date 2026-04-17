import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Layout from '@/views/Layout.vue'
import Login from '@/views/Login.vue'
import Shop from '@/views/Shop.vue'
import ShopType from '@/views/ShopType.vue'
import User from '@/views/User.vue'

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
    meta: { requiresAuth: true },
    children: [
      {
        path: 'shop',
        name: 'Shop',
        component: Shop,
        meta: { title: '商铺列表', requiresAuth: true }
      },
      {
        path: 'shop-type',
        name: 'ShopType',
        component: ShopType,
        meta: { title: '商铺类型', requiresAuth: true }
      },
      {
        path: 'user',
        name: 'User',
        component: User,
        meta: { title: '用户列表', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 检查是否有有效的token
const hasValidToken = (): boolean => {
  const token = localStorage.getItem('token')
  console.log('路由守卫检查token:', token)
  
  // 检查token是否存在且非空
  if (!token || token.trim() === '') {
    console.log('token为空或不存在')
    return false
  }
  
  console.log('token有效')
  return true
}

// 路由守卫
router.beforeEach((to, _from, next) => {
  console.log('====================')
  console.log('路由守卫开始')
  console.log('目标路径:', to.path)
  console.log('目标路由meta:', to.meta)
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 点评后台管理系统`
  }
  
  // 检查是否需要认证
  // requiresAuth 默认为 true，除非显式设置为 false
  const requiresAuth = to.meta.requiresAuth !== false
  console.log('是否需要认证:', requiresAuth)
  
  const hasToken = hasValidToken()
  console.log('是否有有效token:', hasToken)
  
  if (requiresAuth && !hasToken) {
    // 需要登录但未登录，跳转到登录页
    console.log('需要登录但未登录，跳转到登录页')
    next('/login')
  } else if (to.path === '/login' && hasToken) {
    // 已登录用户访问登录页，跳转到首页
    console.log('已登录用户访问登录页，跳转到首页')
    next('/shop')
  } else {
    console.log('路由守卫通过，继续导航')
    next()
  }
})

// 路由跳转后的钩子
router.afterEach((to) => {
  console.log('路由跳转完成，当前路径:', to.path)
  console.log('====================')
})

export default router
