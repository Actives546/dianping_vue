// 通用响应结构
export interface Result<T = any> {
  success: boolean
  errorMsg: string | null
  data: T
  total: number | null
}

// 商铺类型
export interface ShopType {
  id: number
  name: string
  icon?: string
  sort: number
  createTime?: string
  updateTime?: string
}

// 商铺
export interface Shop {
  id: number
  name: string
  typeId: number
  images?: string
  area?: string
  address?: string
  x?: number
  y?: number
  avgPrice?: number
  sold?: number
  comments?: number
  score?: number
  openHours?: string
  createTime?: string
  updateTime?: string
  distance?: number
  shopType?: ShopType
}

// 登录请求参数
export interface LoginParams {
  phone: string
  code?: string
  password?: string
}

// 分页参数
export interface PageParams {
  current?: number
  size?: number
  name?: string
}

// 商铺表单
export interface ShopForm {
  id?: number
  name: string
  typeId?: number
  images?: string
  area?: string
  address?: string
  x?: number
  y?: number
  avgPrice?: number
  openHours?: string
}

// 商铺类型表单
export interface ShopTypeForm {
  id?: number
  name: string
  icon?: string
  sort?: number
}

// 用户信息
export interface UserInfo {
  id: number
  phone: string
  nickName?: string
  icon?: string
  createTime?: string
  updateTime?: string
}

// 用户表单
export interface UserForm {
  id?: number
  phone: string
  password?: string
  nickName?: string
  icon?: string
}

// 登录响应的用户信息
export interface LoginUserInfo {
  phone: string
  token: string
}
