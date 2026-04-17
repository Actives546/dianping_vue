import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { Result } from '@/types'

const service: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    console.log('=== 请求拦截器 ===')
    console.log('URL:', config.url)
    console.log('localStorage中的token:', token)
    
    if (token && token.trim() !== '') {
      const cleanToken = token.trim()
      
      if (cleanToken.startsWith('Bearer ')) {
        config.headers['Authorization'] = cleanToken
        console.log('Token已包含Bearer前缀，直接使用')
      } else {
        config.headers['Authorization'] = `${cleanToken}`
        console.log('添加Bearer前缀:', `Bearer ${cleanToken}`)
      }
      
      console.log('最终Authorization头:', config.headers['Authorization'])
    } else {
      console.log('⚠️ 警告：没有找到有效的token！')
      console.log('检查localStorage是否正确保存了token...')
    }
    
    console.log('================')
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('=== 响应拦截器 - 成功 ===')
    console.log('URL:', response.config.url)
    console.log('响应数据:', response.data)
    console.log('================')
    
    const res = response.data as Result
    
    if (res.success) {
      return res
    } else {
      console.error('业务错误:', res.errorMsg)
      ElMessage.error(res.errorMsg || '请求失败')
      return Promise.reject(new Error(res.errorMsg || '请求失败'))
    }
  },
  (error) => {
    console.error('=== 响应拦截器 - 错误 ===')
    console.error('完整错误对象:', error)
    
    if (error.response) {
      const { status, data, config } = error.response
      
      console.error('❌ HTTP状态码:', status)
      console.error('❌ 请求URL:', config?.url)
      console.error('❌ 响应数据:', data)
      console.error('❌ 请求头:', config?.headers)
      
      const currentToken = localStorage.getItem('token')
      console.error('❌ 此时localStorage中的token:', currentToken)
      
      switch (status) {
        case 401:
          console.error('❌❌❌ 401未授权 - 这是核心问题！')
          console.error('可能的原因：')
          console.error('1. Token没有正确发送到后端')
          console.error('2. Token已过期或无效')
          console.error('3. 后端JWT验证配置有问题')
          
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          const errorMsg = typeof data === 'object' && data !== null 
            ? (data as any).errorMsg || `请求失败: ${status}`
            : `请求失败: ${status}`
          ElMessage.error(errorMsg)
      }
    } else if (error.request) {
      console.error('没有收到响应:', error.request)
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      console.error('请求配置错误:', error.message)
      ElMessage.error(`请求失败: ${error.message}`)
    }
    
    console.error('================')
    return Promise.reject(error)
  }
)

// 封装请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
    return service.get(url, config)
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
    return service.post(url, data, config)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
    return service.put(url, data, config)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
    return service.delete(url, config)
  }
}

export default service
