import { request } from '@/utils/request'
import { Result, ShopType, PageParams, ShopTypeForm } from '@/types'

// 新增商铺类型
export const addShopType = (data: ShopTypeForm): Promise<Result<number>> => {
  return request.post('/shop-type', data)
}

// 更新商铺类型
export const updateShopType = (data: ShopTypeForm): Promise<Result<null>> => {
  return request.put('/shop-type', data)
}

// 根据ID查询商铺类型
export const getShopTypeById = (id: number): Promise<Result<ShopType>> => {
  return request.get(`/shop-type/${id}`)
}

// 查询所有商铺类型
export const getShopTypeList = (): Promise<Result<ShopType[]>> => {
  return request.get('/shop-type/list')
}

// 分页查询商铺类型
export const getShopTypePage = (params: PageParams): Promise<Result<ShopType[]>> => {
  const { current = 1, size = 10, name } = params
  let url = `/shop-type/page?current=${current}&size=${size}`
  if (name) {
    url += `&name=${encodeURIComponent(name)}`
  }
  return request.get(url)
}

// 根据ID删除商铺类型
export const deleteShopTypeById = (id: number): Promise<Result<null>> => {
  return request.delete(`/shop-type/${id}`)
}

// 批量删除商铺类型
export const batchDeleteShopType = (ids: number[]): Promise<Result<null>> => {
  return request.delete('/shop-type/batch', { data: ids })
}
