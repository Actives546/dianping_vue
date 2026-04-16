<template>
  <div class="login-container">
    <div class="login-box">
      <h2 class="login-title">点评后台管理系统</h2>
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="loginForm.phone" placeholder="请输入手机号" prefix-icon="Phone" />
        </el-form-item>
        
        <el-form-item label="登录方式">
          <el-radio-group v-model="loginType">
            <el-radio value="password">密码登录</el-radio>
            <el-radio value="code">验证码登录</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="loginType === 'password'" label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item v-if="loginType === 'code'" label="验证码" prop="code">
          <el-row :gutter="10">
            <el-col :span="16">
              <el-input
                v-model="loginForm.code"
                placeholder="请输入验证码"
                prefix-icon="Key"
              />
            </el-col>
            <el-col :span="8">
              <el-button
                type="primary"
                :disabled="countdown > 0 || !loginForm.phone"
                @click="handleSendCode"
                style="width: 100%"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { sendCode, login } from '@/api/user'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const countdown = ref(0)

const loginType = ref<'password' | 'code'>('password')

const loginForm = reactive({
  phone: '',
  password: '',
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

const loginRules: FormRules = {
  phone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位', trigger: 'blur' }
  ]
}

const handleSendCode = async () => {
  if (!loginForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(loginForm.phone)) {
    ElMessage.warning('手机号格式不正确')
    return
  }
  
  try {
    await sendCode(loginForm.phone)
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

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const params = {
          phone: loginForm.phone,
          ...(loginType.value === 'password' 
            ? { password: loginForm.password } 
            : { code: loginForm.code }
          )
        }
        
        const res = await login(params)
        
        if (res.success && res.data) {
          localStorage.setItem('token', res.data)
          ElMessage.success('登录成功')
          router.push('/')
        }
      } catch (error) {
        console.error('登录失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>
