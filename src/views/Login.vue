<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="logo-icon">
          <el-icon><OfficeBuilding /></el-icon>
        </div>
        <h1 class="login-title">点评后台管理系统</h1>
        <p class="login-subtitle">欢迎回来，请登录您的账户</p>
      </div>
      
      <div class="login-form-wrapper">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <!-- 密码登录tab -->
          <el-tab-pane label="密码登录" name="password">
            <el-form 
              ref="passwordFormRef" 
              :model="passwordForm" 
              :rules="passwordRules" 
              label-width="80px"
            >
              <el-form-item label="手机号" prop="phone">
                <el-input 
                  v-model="passwordForm.phone" 
                  placeholder="请输入手机号" 
                  prefix-icon="Phone" 
                />
              </el-form-item>
              
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="passwordForm.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="Lock"
                  show-password
                />
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  class="login-btn"
                  :loading="loading" 
                  @click="handlePasswordLogin"
                >
                  <span v-if="!loading">登录</span>
                  <span v-else>登录中...</span>
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <!-- 验证码登录tab -->
          <el-tab-pane label="验证码登录" name="code">
            <el-form 
              ref="codeFormRef" 
              :model="codeForm" 
              :rules="codeRules" 
              label-width="80px"
            >
              <el-form-item label="手机号" prop="phone">
                <el-input 
                  v-model="codeForm.phone" 
                  placeholder="请输入手机号" 
                  prefix-icon="Phone" 
                />
              </el-form-item>
              
              <el-form-item label="验证码" prop="code">
                <el-row :gutter="10">
                  <el-col :span="16">
                    <el-input
                      v-model="codeForm.code"
                      placeholder="请输入验证码"
                      prefix-icon="Key"
                    />
                  </el-col>
                  <el-col :span="8">
                    <el-button
                      class="code-btn"
                      :disabled="countdown > 0 || !codeForm.phone"
                      @click="handleSendCode"
                    >
                      {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                    </el-button>
                  </el-col>
                </el-row>
              </el-form-item>
              
              <el-form-item>
                <el-button 
                  class="login-btn"
                  :loading="loading" 
                  @click="handleCodeLogin"
                >
                  <span v-if="!loading">登录</span>
                  <span v-else>登录中...</span>
                </el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div class="login-footer">
        <p>© 2024 点评后台管理系统 · 安全登录</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { OfficeBuilding, Phone, Lock, Key } from '@element-plus/icons-vue'
import { sendCode, login } from '@/api/user'

const router = useRouter()
const passwordFormRef = ref<FormInstance>()
const codeFormRef = ref<FormInstance>()
const loading = ref(false)
const countdown = ref(0)

const activeTab = ref<'password' | 'code'>('password')

// 密码登录表单
const passwordForm = reactive({
  phone: '',
  password: ''
})

// 验证码登录表单
const codeForm = reactive({
  phone: '',
  code: ''
})

const validatePhone = (rule: any, value: string, callback: any) => {
  const phoneReg = /^1[3-9]\d{9}$/
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!phoneReg.test(value)) {
    callback(new Error('手机号格式不正确'))
  } else {
    callback()
  }
}

// 密码登录验证规则
const passwordRules: FormRules = {
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 验证码登录验证规则
const codeRules: FormRules = {
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位', trigger: 'blur' }
  ]
}

// tab切换时重置表单
const handleTabChange = (tabName: string | number) => {
  if (tabName === 'password') {
    passwordFormRef.value?.resetFields()
  } else {
    codeFormRef.value?.resetFields()
  }
}

// 发送验证码
const handleSendCode = async () => {
  if (!codeForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(codeForm.phone)) {
    ElMessage.warning('手机号格式不正确')
    return
  }
  
  try {
    await sendCode(codeForm.phone)
    ElMessage.success('验证码发送成功')
    
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error('发送验证码失败，请稍后重试')
  }
}

// 处理登录成功后的跳转
const handleLoginSuccess = (token: any) => {
  console.log('handleLoginSuccess 接收到的token参数:', token)
  console.log('token类型:', typeof token)
  
  // 处理各种可能的token格式
  let tokenValue = ''
  
  if (typeof token === 'string' && token.trim() !== '') {
    tokenValue = token.trim()
    console.log('token是字符串，直接使用:', tokenValue)
  } else if (typeof token === 'object' && token !== null) {
    console.log('token是对象，尝试提取字段...')
    console.log('对象属性:', Object.keys(token))
    
    // 如果token是对象，尝试提取可能的token字段
    tokenValue = token.token || token.accessToken || token.data || ''
    
    // 如果还是空，尝试更全面的提取
    if (!tokenValue) {
      // 检查对象中是否有包含token的字段
      for (const key in token) {
        if (key.toLowerCase().includes('token') && typeof token[key] === 'string') {
          tokenValue = token[key]
          console.log(`从字段 ${key} 提取到token:`, tokenValue)
          break
        }
      }
    }
    
    console.log('从对象中提取的tokenValue:', tokenValue)
  }
  
  // 调试：如果token是数字（比如用户ID），也转换为字符串
  if (typeof token === 'number') {
    tokenValue = String(token)
    console.log('token是数字，转换为字符串:', tokenValue)
  }
  
  // 清理token，移除可能的Bearer前缀
  if (tokenValue && tokenValue.startsWith('Bearer ')) {
    console.log('移除token中的Bearer前缀')
    tokenValue = tokenValue.slice(7).trim()
  }
  
  console.log('最终处理后的tokenValue:', tokenValue)
  
  if (!tokenValue || tokenValue.trim() === '') {
    console.error('获取到的token为空:', token)
    ElMessage.error('登录失败：未获取到有效令牌')
    return
  }
  
  console.log('登录成功，保存token:', tokenValue)
  localStorage.setItem('token', tokenValue)
  
  // 验证token是否保存成功
  const savedToken = localStorage.getItem('token')
  console.log('localStorage中保存的token:', savedToken)
  
  if (!savedToken) {
    ElMessage.error('令牌保存失败，请检查浏览器设置')
    return
  }
  
  ElMessage.success('登录成功')
  
  // 跳转到后台管理页面
  console.log('准备跳转到后台管理页面...')
  
  // 使用 setTimeout 确保 localStorage 保存完成后再跳转
  setTimeout(() => {
    // 使用 replace 而不是 push，这样用户按返回按钮不会回到登录页
    router.replace('/shop').then(() => {
      console.log('跳转到后台管理页面成功')
    }).catch((err) => {
      console.error('跳转失败:', err)
      ElMessage.error('页面跳转失败，请手动刷新页面')
    })
  }, 100)
}

// 密码登录
const handlePasswordLogin = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    loading.value = true
    
    const params = {
      phone: passwordForm.phone,
      password: passwordForm.password
    }
    
    console.log('密码登录参数:', params)
    
    const res = await login(params)
    
    console.log('登录响应:', res)
    
    if (res.success) {
      handleLoginSuccess(res.data)
    } else {
      ElMessage.error(res.errorMsg || '登录失败')
    }
  } catch (error: any) {
    console.error('密码登录失败:', error)
    
    // 处理表单验证错误
    if (error?.fields) {
      console.log('表单验证失败:', error.fields)
      // 提取验证错误信息并显示
      const firstError = Object.values(error.fields)[0]
      if (firstError && Array.isArray(firstError) && firstError.length > 0) {
        ElMessage.error(firstError[0].message || '表单验证失败')
      }
    } else if (error?.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 验证码登录
const handleCodeLogin = async () => {
  if (!codeFormRef.value) return
  
  try {
    await codeFormRef.value.validate()
    loading.value = true
    
    const params = {
      phone: codeForm.phone,
      code: codeForm.code
    }
    
    console.log('验证码登录参数:', params)
    
    const res = await login(params)
    
    console.log('登录响应:', res)
    
    if (res.success) {
      handleLoginSuccess(res.data)
    } else {
      ElMessage.error(res.errorMsg || '登录失败')
    }
  } catch (error: any) {
    console.error('验证码登录失败:', error)
    
    // 处理表单验证错误
    if (error?.fields) {
      console.log('表单验证失败:', error.fields)
      // 提取验证错误信息并显示
      const firstError = Object.values(error.fields)[0]
      if (firstError && Array.isArray(firstError) && firstError.length > 0) {
        ElMessage.error(firstError[0].message || '表单验证失败')
      }
    } else if (error?.message) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.05) 0%, transparent 70%);
  animation: float 20s ease-in-out infinite;
}

.login-container::after {
  content: '';
  position: absolute;
  bottom: -50%;
  left: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%);
  animation: float 25s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(30px, 30px);
  }
}

.login-box {
  position: relative;
  z-index: 1;
  width: 420px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  padding: 40px 40px 30px;
  text-align: center;
  position: relative;
}

.login-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #409eff, #667eea);
  border-radius: 2px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
  }
  50% {
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
  }
}

.logo-icon .el-icon {
  font-size: 32px;
  color: #fff;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-weight: 400;
}

.login-form-wrapper {
  padding: 30px 40px 40px;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__nav) {
  background: #f3f4f6;
  border-radius: 8px;
  padding: 4px;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  height: 36px;
  line-height: 36px;
  padding: 0 24px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.el-tabs__item:hover) {
  color: #409eff;
}

:deep(.el-tabs__active-bar) {
  display: none;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 0 0 1px #e5e7eb;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  border-color: #409eff;
}

:deep(.el-input__inner) {
  font-size: 14px;
  color: #1f2937;
}

:deep(.el-input__prefix) {
  margin-right: 8px;
}

:deep(.el-input__prefix .el-icon) {
  color: #9ca3af;
  font-size: 18px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
  transition: all 0.2s ease;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.code-btn {
  height: 40px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.code-btn:not(.is-disabled) {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  border: none;
}

.code-btn:not(.is-disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

:deep(.el-form-item) {
  margin-bottom: 22px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-button--primary.is-loading) {
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
}

.login-footer {
  padding: 0 40px 40px;
  text-align: center;
}

.login-footer p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

@media (max-width: 480px) {
  .login-box {
    width: 90%;
    margin: 0 auto;
  }
  
  .login-header,
  .login-form-wrapper,
  .login-footer {
    padding-left: 24px;
    padding-right: 24px;
  }
}
</style>
