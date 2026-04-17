import { request } from '@/utils/request'
import { Result, LoginParams, UserInfo, PageParams } from '@/types'

// 用户接口类型定义
export interface User {
  id: number
  phone: string
  password?: string
  nickName?: string
  icon?: string
  createTime?: string
  updateTime?: string
}

export interface UserForm {
  id?: number
  phone: string
  password?: string
  nickName?: string
  icon?: string
}

// 发送手机验证码
export const sendCode = (phone: string): Promise<Result<null>> => {
  return request.post(`/user/code?phone=${phone}`)
}

// 用户登录
export const login = (params: LoginParams): Promise<Result<string>> => {
  return request.post('/user/login', params)
}

// 用户退出登录
export const logout = (): Promise<Result<null>> => {
  return request.post('/user/logout')
}

// 获取当前登录用户信息
export const getCurrentUser = (): Promise<Result<UserInfo>> => {
  return request.get('/user/me')
}

// 新增用户
export const addUser = (data: UserForm): Promise<Result<number>> => {
  return request.post('/user', data)
}

// 更新用户信息
export const updateUser = (data: UserForm): Promise<Result<null>> => {
  return request.put('/user', data)
}

// 根据ID查询用户信息
export const getUserById = (id: number): Promise<Result<User>> => {
  return request.get(`/user/${id}`)
}

// 分页查询用户列表
export const getUserPage = (params: PageParams & { phone?: string; nickName?: string }): Promise<Result<User[]>> => {
  const { current = 1, size = 10, phone, nickName } = params
  let url = `/user/page?current=${current}&size=${size}`
  if (phone) {
    url += `&phone=${encodeURIComponent(phone)}`
  }
  if (nickName) {
    url += `&nickName=${encodeURIComponent(nickName)}`
  }
  return request.get(url)
}

// 根据ID删除用户
export const deleteUserById = (id: number): Promise<Result<null>> => {
  return request.delete(`/user/${id}`)
}

// 批量删除用户
export const batchDeleteUser = (ids: number[]): Promise<Result<null>> => {
  return request.delete('/user/batch', { data: ids })
}
