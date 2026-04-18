import { request } from '@/utils/request'
import { Result, Voucher, VoucherForm, VoucherPageParams } from '@/types'

// 新增优惠券
export const addVoucher = (data: VoucherForm): Promise<Result<number>> => {
  return request.post('/voucher', data)
}

// 更新优惠券信息
export const updateVoucher = (data: VoucherForm): Promise<Result<null>> => {
  return request.put('/voucher', data)
}

// 根据ID查询优惠券信息
export const getVoucherById = (id: number): Promise<Result<Voucher>> => {
  return request.get(`/voucher/${id}`)
}

// 分页查询优惠券信息
export const getVoucherPage = (params: VoucherPageParams): Promise<Result<Voucher[]>> => {
  const { current = 1, size = 10, name, shopId, type } = params
  let url = `/voucher/page?current=${current}&size=${size}`
  if (name) {
    url += `&name=${encodeURIComponent(name)}`
  }
  if (shopId) {
    url += `&shopId=${shopId}`
  }
  if (type !== undefined && type !== null) {
    url += `&type=${type}`
  }
  return request.get(url)
}

// 根据商铺ID查询优惠券列表
export const getVoucherListByShopId = (shopId: number): Promise<Result<Voucher[]>> => {
  return request.get(`/voucher/shop/${shopId}`)
}

// 根据ID删除优惠券
export const deleteVoucherById = (id: number): Promise<Result<null>> => {
  return request.delete(`/voucher/${id}`)
}

// 批量删除优惠券
export const batchDeleteVoucher = (ids: number[]): Promise<Result<null>> => {
  return request.delete('/voucher/batch', { data: ids })
}
