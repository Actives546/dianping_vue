import { request } from '@/utils/request'
import { Result, LoginParams } from '@/types'

// 发送手机验证码
export const sendCode = (phone: string): Promise<Result<null>> => {
  return request.post(`/user/code?phone=${phone}`)
}

// 用户登录
export const login = (params: LoginParams): Promise<Result<string>> => {
  return request.post('/user/login', params)
}
