import { request } from '@/utils/request'
import { Result, Shop, PageParams, ShopForm } from '@/types'

// 新增商铺
export const addShop = (data: ShopForm): Promise<Result<number>> => {
  return request.post('/shop', data)
}

// 更新商铺信息
export const updateShop = (data: ShopForm): Promise<Result<null>> => {
  return request.put('/shop', data)
}

// 根据ID查询商铺信息
export const getShopById = (id: number): Promise<Result<Shop>> => {
  return request.get(`/shop/${id}`)
}

// 分页查询商铺信息
export const getShopPage = (params: PageParams): Promise<Result<Shop[]>> => {
  const { current = 1, size = 10, name } = params
  let url = `/shop/page?current=${current}&size=${size}`
  if (name) {
    url += `&name=${encodeURIComponent(name)}`
  }
  return request.get(url)
}

// 根据ID删除商铺
export const deleteShopById = (id: number): Promise<Result<null>> => {
  return request.delete(`/shop/${id}`)
}

// 批量删除商铺
export const batchDeleteShop = (ids: number[]): Promise<Result<null>> => {
  return request.delete('/shop/batch', { data: ids })
}
