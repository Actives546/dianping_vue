<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon><Ticket /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ pagination.total }}</div>
          <div class="stat-label">优惠券总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <el-icon><Coin /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ normalCount }}</div>
          <div class="stat-label">普通券数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon><Lightning /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ seckillCount }}</div>
          <div class="stat-label">秒杀券数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ totalStock }}</div>
          <div class="stat-label">总库存</div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-form">
        <div class="search-item">
          <span class="search-label">优惠券名称</span>
          <el-input
            v-model="searchForm.name"
            placeholder="请输入优惠券名称"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="search-item">
          <span class="search-label">关联商铺</span>
          <el-select
            v-model="searchForm.shopId"
            placeholder="请选择商铺"
            clearable
            style="width: 200px"
            filterable
          >
            <el-option
              v-for="item in shopList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="search-item">
          <span class="search-label">优惠券类型</span>
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
            style="width: 160px"
          >
            <el-option label="普通券" :value="0" />
            <el-option label="秒杀券" :value="1" />
          </el-select>
        </div>
        <div class="search-item">
          <el-button 
            class="search-btn primary" 
            @click="handleSearch"
          >
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button 
            class="search-btn" 
            @click="handleReset"
          >
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 操作区域 -->
    <div class="action-section">
      <div class="action-left">
        <el-button 
          class="action-btn primary" 
          @click="handleAdd"
        >
          <el-icon><Plus /></el-icon>
          新增优惠券
        </el-button>
        <el-button 
          class="action-btn danger"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedIds.length }})
        </el-button>
      </div>
      <div class="action-right">
        共 <span style="color: #409eff; font-weight: 600">{{ pagination.total }}</span> 条数据
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-key="(row: Voucher) => row.id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="80">
          <template #default="{ $index }">
            {{ (pagination.current - 1) * pagination.size + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="优惠券名称" min-width="200">
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; gap: 4px">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-tag :type="row.type === 1 ? 'danger' : 'primary'" effect="dark" size="small">
                  {{ row.type === 1 ? '秒杀券' : '普通券' }}
                </el-tag>
                <span style="font-weight: 500; color: #1e293b">{{ row.title }}</span>
              </div>
              <span v-if="row.subTitle" style="font-size: 12px; color: #94a3b8">
                {{ row.subTitle }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="shopId" label="关联商铺" min-width="150">
          <template #default="{ row }">
            <span style="color: #64748b">{{ getShopName(row.shopId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="160">
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; gap: 2px">
              <div style="display: flex; align-items: center; gap: 8px">
                <span style="font-size: 12px; color: #94a3b8">支付:</span>
                <span style="font-weight: 600; color: #f59e0b">¥{{ row.payValue }}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px">
                <span style="font-size: 12px; color: #94a3b8">抵扣:</span>
                <span style="font-weight: 600; color: #10b981">¥{{ row.actualValue }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '正常' : '过期' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100">
          <template #default="{ row }">
            <span v-if="row.type === 1" style="font-weight: 600; color: #3b82f6">
              {{ row.stock || 0 }}
            </span>
            <span v-else style="color: #94a3b8">-</span>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" min-width="200">
          <template #default="{ row }">
            <template v-if="row.type === 1 && row.beginTime && row.endTime">
              <div style="display: flex; flex-direction: column; gap: 2px">
                <div style="display: flex; align-items: center; gap: 4px">
                  <el-icon style="font-size: 12px; color: #10b981"><CircleCheck /></el-icon>
                  <span style="font-size: 12px; color: #64748b">
                    开始: {{ formatDateTime(row.beginTime) }}
                  </span>
                </div>
                <div style="display: flex; align-items: center; gap: 4px">
                  <el-icon style="font-size: 12px; color: #ef4444"><CircleClose /></el-icon>
                  <span style="font-size: 12px; color: #64748b">
                    结束: {{ formatDateTime(row.endTime) }}
                  </span>
                </div>
              </div>
            </template>
            <span v-else style="color: #94a3b8">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button 
                class="table-action-btn view"
                @click="handleView(row)"
              >
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button 
                class="table-action-btn edit"
                @click="handleEdit(row)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button 
                class="table-action-btn delete"
                @click="handleDelete(row)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="650px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="关联商铺" prop="shopId">
          <el-select
            v-model="formData.shopId"
            placeholder="请选择商铺"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in shopList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="优惠券标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入优惠券标题" />
        </el-form-item>
        <el-form-item label="副标题" prop="subTitle">
          <el-input v-model="formData.subTitle" placeholder="请输入副标题" />
        </el-form-item>
        <el-form-item label="使用规则" prop="rules">
          <el-input
            v-model="formData.rules"
            type="textarea"
            :rows="2"
            placeholder="请输入使用规则"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="支付金额" prop="payValue">
              <el-input-number
                v-model="formData.payValue"
                :min="0"
                :precision="0"
                placeholder="请输入支付金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="抵扣金额" prop="actualValue">
              <el-input-number
                v-model="formData.actualValue"
                :min="0"
                :precision="0"
                placeholder="请输入抵扣金额"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优惠券类型" prop="type">
              <el-radio-group v-model="formData.type">
                <el-radio :value="0">普通券</el-radio>
                <el-radio :value="1">秒杀券</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="formData.status">
                <el-radio :value="1">正常</el-radio>
                <el-radio :value="2">过期</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 秒杀券专用字段 -->
        <template v-if="formData.type === 1">
          <el-divider content-position="left">秒杀券配置</el-divider>
          <el-form-item label="库存" prop="stock">
            <el-input-number
              v-model="formData.stock"
              :min="0"
              :precision="0"
              placeholder="请输入库存数量"
              style="width: 100%"
            />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="开始时间" prop="beginTime">
                <el-date-picker
                  v-model="formData.beginTime"
                  type="datetime"
                  placeholder="请选择开始时间"
                  style="width: 100%"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结束时间" prop="endTime">
                <el-date-picker
                  v-model="formData.endTime"
                  type="datetime"
                  placeholder="请选择结束时间"
                  style="width: 100%"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button class="dialog-btn primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="优惠券详情"
      width="500px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="优惠券标题">{{ detailData.title }}</el-descriptions-item>
        <el-descriptions-item label="副标题">{{ detailData.subTitle || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关联商铺">{{ getShopName(detailData.shopId) }}</el-descriptions-item>
        <el-descriptions-item label="优惠券类型">
          <el-tag :type="detailData.type === 1 ? 'danger' : 'primary'" effect="dark" size="small">
            {{ detailData.type === 1 ? '秒杀券' : '普通券' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="支付金额">
          <span style="font-weight: 600; color: #f59e0b">¥{{ detailData.payValue }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="抵扣金额">
          <span style="font-weight: 600; color: #10b981">¥{{ detailData.actualValue }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="使用规则">{{ detailData.rules || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 1 ? 'success' : 'info'" size="small">
            {{ detailData.status === 1 ? '正常' : '过期' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.type === 1" label="库存">
          <span style="font-weight: 600; color: #3b82f6">{{ detailData.stock || 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.type === 1" label="开始时间">
          {{ formatDateTime(detailData.beginTime) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="detailData.type === 1" label="结束时间">
          {{ formatDateTime(detailData.endTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(detailData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDateTime(detailData.updateTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { 
  Plus, 
  Delete, 
  Search, 
  Refresh, 
  Ticket,
  Coin,
  Lightning,
  Money,
  View,
  Edit,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'
import {
  getVoucherPage,
  addVoucher,
  updateVoucher,
  deleteVoucherById,
  batchDeleteVoucher,
  getVoucherById
} from '@/api/voucher'
import { getShopPage } from '@/api/shop'
import type { Voucher, Shop } from '@/types'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<Voucher[]>([])
const shopList = ref<Shop[]>([])
const selectedIds = ref<number[]>([])
const detailData = ref<Partial<Voucher>>({})

const searchForm = reactive({
  name: '',
  shopId: undefined as number | undefined,
  type: undefined as number | undefined
})

// 统计计算属性
const normalCount = computed(() => {
  return tableData.value.filter(item => item.type === 0).length
})

const seckillCount = computed(() => {
  return tableData.value.filter(item => item.type === 1).length
})

const totalStock = computed(() => {
  return tableData.value.reduce((sum, item) => sum + (item.stock || 0), 0)
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const isEdit = ref(false)
const dialogTitle = ref('')

const formData = reactive({
  id: undefined as number | undefined,
  shopId: undefined as number | undefined,
  title: '',
  subTitle: '',
  rules: '',
  payValue: undefined as number | undefined,
  actualValue: undefined as number | undefined,
  type: 0,
  status: 1,
  stock: undefined as number | undefined,
  beginTime: undefined as string | undefined,
  endTime: undefined as string | undefined
})

const formRules = computed<FormRules>(() => ({
  shopId: [
    { required: true, message: '请选择关联商铺', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请输入优惠券标题', trigger: 'blur' }
  ],
  payValue: [
    { required: true, message: '请输入支付金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '支付金额必须大于0', trigger: 'blur' }
  ],
  actualValue: [
    { required: true, message: '请输入抵扣金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '抵扣金额必须大于0', trigger: 'blur' }
  ],
  stock: [
    { 
      required: formData.type === 1, 
      message: '请输入库存数量', 
      trigger: 'blur' 
    },
    { 
      type: 'number' as const, 
      min: 0, 
      message: '库存必须大于等于0', 
      trigger: 'blur' 
    }
  ],
  beginTime: [
    { 
      required: formData.type === 1, 
      message: '请选择开始时间', 
      trigger: 'change' 
    }
  ],
  endTime: [
    { 
      required: formData.type === 1, 
      message: '请选择结束时间', 
      trigger: 'change' 
    }
  ]
}))

const formatDateTime = (date: string | undefined) => {
  if (!date) return '-'
  return date.replace('T', ' ')
}

const getShopName = (shopId: number | undefined) => {
  if (!shopId) return '-'
  const shop = shopList.value.find(item => item.id === shopId)
  return shop ? shop.name : `商铺ID: ${shopId}`
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getVoucherPage({
      current: pagination.current,
      size: pagination.size,
      name: searchForm.name,
      shopId: searchForm.shopId,
      type: searchForm.type
    })
    if (res.success) {
      tableData.value = res.data || []
      pagination.total = res.total || 0
    }
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchShopList = async () => {
  try {
    const res = await getShopPage({
      current: 1,
      size: 1000
    })
    if (res.success) {
      shopList.value = res.data || []
    }
  } catch (error) {
    console.error('获取商铺列表失败:', error)
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.shopId = undefined
  searchForm.type = undefined
  handleSearch()
}

const handleSelectionChange = (selection: Voucher[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增优惠券'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Voucher) => {
  isEdit.value = true
  dialogTitle.value = '编辑优惠券'
  resetForm()
  
  formData.id = row.id
  formData.shopId = row.shopId
  formData.title = row.title
  formData.subTitle = row.subTitle || ''
  formData.rules = row.rules || ''
  formData.payValue = row.payValue
  formData.actualValue = row.actualValue
  formData.type = row.type
  formData.status = row.status
  formData.stock = row.stock
  formData.beginTime = row.beginTime
  formData.endTime = row.endTime
  
  dialogVisible.value = true
}

const handleView = async (row: Voucher) => {
  try {
    const res = await getVoucherById(row.id)
    if (res.success) {
      detailData.value = res.data || {}
      detailVisible.value = true
    }
  } catch (error) {
    console.error('获取优惠券详情失败:', error)
  }
}

const handleDelete = (row: Voucher) => {
  ElMessageBox.confirm(`确定要删除优惠券"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteVoucherById(row.id)
      if (res.success) {
        ElMessage.success('删除成功')
        fetchData()
      }
    } catch (error) {
      console.error('删除优惠券失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个优惠券吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await batchDeleteVoucher(selectedIds.value)
      if (res.success) {
        ElMessage.success('删除成功')
        fetchData()
      }
    } catch (error) {
      console.error('批量删除优惠券失败:', error)
    }
  }).catch(() => {})
}

const resetForm = () => {
  formData.id = undefined
  formData.shopId = undefined
  formData.title = ''
  formData.subTitle = ''
  formData.rules = ''
  formData.payValue = undefined
  formData.actualValue = undefined
  formData.type = 0
  formData.status = 1
  formData.stock = undefined
  formData.beginTime = undefined
  formData.endTime = undefined
  
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const data = {
          ...formData
        }
        
        // 秒杀券验证
        if (data.type === 1) {
          if (!data.stock || data.stock < 0) {
            ElMessage.warning('秒杀券库存必须大于等于0')
            submitLoading.value = false
            return
          }
          if (!data.beginTime || !data.endTime) {
            ElMessage.warning('请设置秒杀券的开始时间和结束时间')
            submitLoading.value = false
            return
          }
          if (new Date(data.beginTime) >= new Date(data.endTime)) {
            ElMessage.warning('结束时间必须晚于开始时间')
            submitLoading.value = false
            return
          }
        }
        
        let res
        if (isEdit.value) {
          res = await updateVoucher(data)
        } else {
          res = await addVoucher(data)
        }
        
        if (res.success) {
          ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
          dialogVisible.value = false
          fetchData()
        }
      } catch (error) {
        console.error('提交失败:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchData()
  fetchShopList()
})
</script>

<style scoped>
.page-container {
  background: transparent;
  min-height: 100%;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .el-icon {
  font-size: 28px;
  color: #fff;
}

.stat-icon.blue {
  background: #409eff;
}

.stat-icon.green {
  background: #67c23a;
}

.stat-icon.orange {
  background: #e6a23c;
}

.stat-icon.purple {
  background: #909399;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

/* 搜索区域 */
.search-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-item:last-child {
  flex-direction: row;
  align-items: flex-end;
}

.search-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e5e7eb;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.search-btn {
  height: 40px;
  border-radius: 8px;
  padding: 0 24px;
  font-weight: 500;
}

.search-btn.primary {
  background: #409eff;
  border: none;
  color: #fff;
  transition: all 0.2s ease;
}

.search-btn.primary:hover {
  background: #66b1ff;
}

/* 操作区域 */
.action-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.action-left {
  display: flex;
  gap: 12px;
}

.action-btn {
  height: 40px;
  border-radius: 8px;
  padding: 0 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #409eff;
  border: none;
  color: #fff;
  transition: all 0.2s ease;
}

.action-btn.primary:hover {
  background: #66b1ff;
}

.action-btn.danger {
  background: #fff;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.action-btn.danger:hover {
  background: #fef2f2;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-right {
  font-size: 13px;
  color: #64748b;
}

/* 表格区域 */
.table-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: #f8fafc;
}

:deep(.el-table th.el-table__cell) {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  padding: 14px 12px;
}

:deep(.el-table td.el-table__cell) {
  padding: 14px 12px;
  border-bottom: 1px solid #f1f5f9;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: #fafafa;
}

:deep(.el-table__row:hover > td.el-table__cell) {
  background: #f8fafc;
}

/* 表格操作按钮 */
.table-actions {
  display: flex;
  gap: 8px;
}

.table-action-btn {
  padding: 4px 12px;
  height: 32px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.table-action-btn.view {
  background: #eff6ff;
  border: none;
  color: #3b82f6;
}

.table-action-btn.view:hover {
  background: #dbeafe;
}

.table-action-btn.edit {
  background: #ecfdf5;
  border: none;
  color: #10b981;
}

.table-action-btn.edit:hover {
  background: #d1fae5;
}

.table-action-btn.delete {
  background: #fef2f2;
  border: none;
  color: #ef4444;
}

.table-action-btn.delete:hover {
  background: #fee2e2;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
}

:deep(.el-pagination) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-pagination button),
:deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  height: 36px;
  min-width: 36px;
  font-weight: 500;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: #409eff;
  color: #fff;
  border: none;
}

/* 对话框 */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
  margin-right: 0;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

:deep(.el-dialog__headerbtn) {
  top: 24px;
  right: 24px;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-btn {
  height: 40px;
  border-radius: 8px;
  padding: 0 24px;
  font-weight: 500;
}

.dialog-btn.primary {
  background: #409eff;
  border: none;
  color: #fff;
  transition: all 0.2s ease;
}

.dialog-btn.primary:hover {
  background: #66b1ff;
}

/* 详情对话框 */
:deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: #f8fafc;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #64748b;
}

:deep(.el-descriptions__content) {
  color: #1e293b;
}

/* 响应式 */
@media (max-width: 1024px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-item {
    width: 100%;
  }
  
  .action-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .action-left {
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .search-section,
  .action-section,
  .table-section {
    padding: 16px;
  }
}
</style>
