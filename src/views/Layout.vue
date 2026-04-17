<template>
  <el-container class="main-container">
    <el-aside 
      class="sidebar" 
      :width="isCollapse ? '64px' : '240px'"
      :class="{ 'sidebar-collapsed': isCollapse }"
    >
      <div class="sidebar-logo">
        <div class="logo-icon">
          <el-icon><OfficeBuilding /></el-icon>
        </div>
        <transition name="fade">
          <span v-if="!isCollapse" class="logo-text">点评管理系统</span>
        </transition>
      </div>
      
      <div class="sidebar-menu-wrapper">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          class="sidebar-menu"
          router
        >
          <el-sub-menu index="shop-management">
            <template #title>
              <el-icon><Shop /></el-icon>
              <span>商铺管理</span>
            </template>
            <el-menu-item index="/shop">
              <el-icon><Document /></el-icon>
              <template #title>商铺列表</template>
            </el-menu-item>
            <el-menu-item index="/shop-type">
              <el-icon><Grid /></el-icon>
              <template #title>商铺类型</template>
            </el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="user-management">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/user">
              <el-icon><User /></el-icon>
              <template #title>用户列表</template>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
      
      <div class="sidebar-footer">
        <div class="version-info" v-if="!isCollapse">
          <span>版本 v1.0.0</span>
        </div>
      </div>
    </el-aside>
    
    <el-container class="content-container">
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <div class="breadcrumb-wrapper">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ pageTitle }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </div>
        
        <div class="header-right">
          <div class="header-actions">
            <el-tooltip content="消息通知" placement="bottom">
              <el-icon class="action-icon"><Bell /></el-icon>
            </el-tooltip>
            <el-tooltip content="全屏" placement="bottom">
              <el-icon class="action-icon"><FullScreen /></el-icon>
            </el-tooltip>
          </div>
          
          <div class="user-profile">
            <el-dropdown @command="handleCommand" placement="bottom-end">
              <div class="user-info">
                <div class="user-avatar">
                  <el-icon><User /></el-icon>
                </div>
                <div class="user-details" v-if="!isCollapse">
                  <span class="user-name">管理员</span>
                  <span class="user-role">超级管理员</span>
                </div>
                <el-icon class="arrow-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="user-dropdown">
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    <span>个人中心</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="settings">
                    <el-icon><Setting /></el-icon>
                    <span>系统设置</span>
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    <span>退出登录</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Shop,
  Grid,
  Fold,
  Expand,
  User,
  ArrowDown,
  OfficeBuilding,
  Document,
  Bell,
  FullScreen,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/shop': '商铺列表',
    '/shop-type': '商铺类型',
    '/user': '用户列表',
    '/': '首页'
  }
  return titles[route.path] || '页面'
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      localStorage.removeItem('token')
      ElMessage.success('退出成功')
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.main-container {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(64, 158, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.sidebar-collapsed {
  width: 64px !important;
}

.sidebar-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 1;
}

.logo-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.logo-icon .el-icon {
  font-size: 24px;
  color: #fff;
}

.logo-text {
  margin-left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.sidebar-menu-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 12px 8px;
  position: relative;
  z-index: 1;
}

.sidebar-menu-wrapper::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.sidebar-menu {
  border-right: none;
  background: transparent !important;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
  margin: 4px 0;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85) !important;
  transition: all 0.2s ease;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background: rgba(64, 158, 255, 0.15) !important;
  color: #fff !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.3) 0%, rgba(64, 158, 255, 0.1) 100%) !important;
  color: #409eff !important;
  border-right: 3px solid #409eff;
}

:deep(.el-sub-menu .el-menu) {
  background: rgba(0, 0, 0, 0.2) !important;
}

:deep(.el-sub-menu .el-menu-item) {
  padding-left: 52px !important;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75) !important;
}

:deep(.el-sub-menu .el-menu-item:hover) {
  color: #fff !important;
  background: rgba(64, 158, 255, 0.2) !important;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  color: #409eff !important;
  background: rgba(64, 158, 255, 0.25) !important;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 1;
}

.version-info {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.content-container {
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  flex-shrink: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-icon {
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 8px;
}

.collapse-icon:hover {
  color: #409eff;
  background: #f1f5f9;
}

.breadcrumb-wrapper {
  margin-left: 8px;
}

:deep(.el-breadcrumb__inner) {
  color: #64748b;
  font-size: 14px;
}

:deep(.el-breadcrumb__inner.is-link) {
  color: #409eff;
}

:deep(.el-breadcrumb__separator) {
  color: #cbd5e1;
  margin: 0 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-icon {
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-icon:hover {
  color: #409eff;
  background: #f1f5f9;
}

.user-profile {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.user-info:hover {
  background: #f1f5f9;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar .el-icon {
  font-size: 20px;
  color: #fff;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.user-role {
  font-size: 12px;
  color: #64748b;
}

.arrow-icon {
  font-size: 12px;
  color: #94a3b8;
  transition: transform 0.2s ease;
}

:deep(.el-dropdown-menu) {
  border: none;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: 8px;
}

.user-dropdown :deep(.el-dropdown-item) {
  padding: 10px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
}

.user-dropdown :deep(.el-dropdown-item:hover) {
  background: #f1f5f9;
  color: #409eff;
}

.user-dropdown :deep(.el-dropdown-item .el-icon) {
  font-size: 16px;
}

.main-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  background: #f5f7fa;
}

.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
