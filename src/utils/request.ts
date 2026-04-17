import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { Result } from '@/types'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('请求拦截器 - 获取到的token:', token)
    console.log('请求拦截器 - 请求URL:', config.url)
    
    if (token && token.trim() !== '') {
      const cleanToken = token.trim()
      
      if (cleanToken.startsWith('Bearer ')) {
        config.headers['Authorization'] = cleanToken
        console.log('请求拦截器 - token已包含Bearer前缀，直接使用:', cleanToken)
      } else {
        config.headers['Authorization'] = `Bearer ${cleanToken}`
        console.log('请求拦截器 - 添加Bearer前缀:', `Bearer ${cleanToken}`)
      }
      
      console.log('请求拦截器 - 最终Authorization头:', config.headers['Authorization'])
    } else {
      console.log('请求拦截器 - 没有找到有效的token')
    }
    
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    console.log('响应拦截器 - 成功响应:', response.config.url)
    console.log('响应拦截器 - 响应数据:', response.data)
    
    const res = response.data
    
    if (res.success) {
      return res
    } else {
      console.error('响应拦截器 - 业务错误:', res.errorMsg)
      ElMessage.error(res.errorMsg || '请求失败')
      return Promise.reject(new Error(res.errorMsg || '请求失败'))
    }
  },
  (error) => {
    console.error('响应拦截器 - HTTP错误:', error)
    
    if (error.response) {
      const { status, data, config } = error.response
      
      console.error('响应拦截器 - 错误状态码:', status)
      console.error('响应拦截器 - 错误URL:', config?.url)
      console.error('响应拦截器 - 错误响应数据:', data)
      console.error('响应拦截器 - 请求头:', config?.headers)
      
      switch (status) {
        case 401:
          console.error('响应拦截器 - 401未授权，准备清除token并跳转登录页')
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
          ElMessage.error(data?.errorMsg || `请求失败: ${status}`)
      }
    } else if (error.request) {
      console.error('响应拦截器 - 没有收到响应:', error.request)
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      console.error('响应拦截器 - 请求配置错误:', error.message)
      ElMessage.error(`请求失败: ${error.message}`)
    }
    
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
