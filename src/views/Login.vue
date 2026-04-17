<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">点评后台管理系统</h2>
      
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
                type="primary" 
                :loading="loading" 
                @click="handlePasswordLogin" 
                style="width: 100%"
              >
                登录
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
                    type="primary"
                    :disabled="countdown > 0 || !codeForm.phone"
                    @click="handleSendCode"
                    style="width: 100%"
                  >
                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                  </el-button>
                </el-col>
              </el-row>
            </el-form-item>
            
            <el-form-item>
              <el-button 
                type="primary" 
                :loading="loading" 
                @click="handleCodeLogin" 
                style="width: 100%"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
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
