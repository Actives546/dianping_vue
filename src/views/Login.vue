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
  }
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
    
    const res = await login(params)
    
    if (res.success && res.data) {
      localStorage.setItem('token', res.data)
      ElMessage.success('登录成功')
      router.push('/')
    }
  } catch (error: any) {
    // 处理表单验证错误
    if (error?.fields) {
      console.log('表单验证失败:', error.fields)
    } else {
      console.error('登录失败:', error)
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
    
    if (res.success && res.data) {
      localStorage.setItem('token', res.data)
      ElMessage.success('登录成功')
      router.push('/')
    }
  } catch (error: any) {
    // 处理表单验证错误
    if (error?.fields) {
      console.log('表单验证失败:', error.fields)
      // 提取验证错误信息并显示
      const firstError = Object.values(error.fields)[0]
      if (firstError && Array.isArray(firstError) && firstError.length > 0) {
        ElMessage.error(firstError[0].message || '表单验证失败')
      }
    } else {
      console.error('登录失败:', error)
    }
  } finally {
    loading.value = false
  }
}
</script>
