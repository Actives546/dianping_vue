<template>
  <el-container style="height: 100vh">
    <el-aside :width="isCollapse ? '64px' : '200px'">
      <div class="logo">
        <span v-if="!isCollapse">点评管理系统</span>
        <span v-else>DP</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-sub-menu index="shop-management">
          <template #title>
            <el-icon><Shop /></el-icon>
            <span>商铺管理</span>
          </template>
          <el-menu-item index="/shop">
            <el-icon><Shop /></el-icon>
            <template #title>商铺列表</template>
          </el-menu-item>
          <el-menu-item index="/shop-type">
            <el-icon><Grid /></el-icon>
            <template #title>商铺类型</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>
        <div style="display: flex; align-items: center; gap: 10px">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <span style="color: #333; font-size: 16px">{{ pageTitle }}</span>
        </div>
        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link" style="cursor: pointer">
              <el-icon><User /></el-icon>
              <span>管理员</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
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
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/shop': '商铺列表',
    '/shop-type': '商铺类型',
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
.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.collapse-btn:hover {
  color: #409EFF;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #333;
}
</style>
