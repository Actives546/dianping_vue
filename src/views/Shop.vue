<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon><OfficeBuilding /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ pagination.total }}</div>
          <div class="stat-label">商铺总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <el-icon><Star /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ avgScore }}</div>
          <div class="stat-label">平均评分</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ totalSold }}</div>
          <div class="stat-label">总销量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">
          <el-icon><ChatDotRound /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ totalComments }}</div>
          <div class="stat-label">总评论数</div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-form">
        <div class="search-item">
          <span class="search-label">商铺名称</span>
          <el-input
            v-model="searchForm.name"
            placeholder="请输入商铺名称"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="search-item">
          <span class="search-label">商铺类型</span>
          <el-select
            v-model="searchForm.typeId"
            placeholder="请选择商铺类型"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in shopTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
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
          新增商铺
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
        :row-key="(row: Shop) => row.id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="80">
          <template #default="{ $index }">
            {{ (pagination.current - 1) * pagination.size + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商铺名称" min-width="180">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 10px">
              <div 
                v-if="row.images" 
                style="width: 40px; height: 40px; border-radius: 8px; background: #f1f5f9; overflow: hidden; flex-shrink: 0"
              >
                <img 
                  :src="row.images.split(',')[0]" 
                  :alt="row.name"
                  style="width: 100%; height: 100%; object-fit: cover"
                  @error="(e: Event) => { (e.target as HTMLImageElement).style.display = 'none' }"
                />
              </div>
              <div 
                v-else
                style="width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg, #409eff 0%, #667eea 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0"
              >
                <el-icon style="color: #fff; font-size: 20px"><OfficeBuilding /></el-icon>
              </div>
              <div style="display: flex; flex-direction: column; gap: 2px">
                <span style="font-weight: 500; color: #1e293b">{{ row.name }}</span>
                <span style="font-size: 12px; color: #94a3b8">{{ row.shopType?.name || '-' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="area" label="商圈" width="120">
          <template #default="{ row }">
            <span style="color: #64748b">{{ row.area || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="color: #64748b">{{ row.address || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="avgPrice" label="均价" width="100">
          <template #default="{ row }">
            <span style="font-weight: 600; color: #f59e0b">{{ row.avgPrice ? `¥${row.avgPrice}` : '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="score" label="评分" width="120">
          <template #default="{ row }">
            <div v-if="row.score" style="display: flex; align-items: center; gap: 4px">
              <el-icon style="color: #fbbf24"><Star /></el-icon>
              <span style="font-weight: 600; color: #f59e0b">{{ (row.score / 10).toFixed(1) }}</span>
            </div>
            <span v-else style="color: #94a3b8">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="openHours" label="营业时间" width="140">
          <template #default="{ row }">
            <span style="color: #64748b">{{ row.openHours || '-' }}</span>
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
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="商铺名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商铺名称" />
        </el-form-item>
        <el-form-item label="商铺类型" prop="typeId">
          <el-select
            v-model="formData.typeId"
            placeholder="请选择商铺类型"
            style="width: 100%"
          >
            <el-option
              v-for="item in shopTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商圈" prop="area">
          <el-input v-model="formData.area" placeholder="请输入商圈，如：陆家嘴" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="均价" prop="avgPrice">
          <el-input-number
            v-model="formData.avgPrice"
            :min="0"
            placeholder="请输入均价"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="营业时间" prop="openHours">
          <el-input v-model="formData.openHours" placeholder="请输入营业时间，如：10:00-22:00" />
        </el-form-item>
        <el-form-item label="经度" prop="x">
          <el-input-number
            v-model="formData.x"
            :precision="6"
            placeholder="请输入经度"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="纬度" prop="y">
          <el-input-number
            v-model="formData.y"
            :precision="6"
            placeholder="请输入纬度"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="图片" prop="images">
          <el-input
            v-model="formData.images"
            type="textarea"
            :rows="2"
            placeholder="请输入图片URL，多个图片以逗号分隔"
          />
        </el-form-item>
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
      title="商铺详情"
      width="500px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="商铺名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="商铺类型">
          {{ detailData.shopType?.name || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="商圈">{{ detailData.area || '-' }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ detailData.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="均价">
          {{ detailData.avgPrice ? `¥${detailData.avgPrice}` : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="评分">
          {{ detailData.score ? (detailData.score / 10).toFixed(1) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="销量">{{ detailData.sold || 0 }}</el-descriptions-item>
        <el-descriptions-item label="评论数">{{ detailData.comments || 0 }}</el-descriptions-item>
        <el-descriptions-item label="营业时间">{{ detailData.openHours || '-' }}</el-descriptions-item>
        <el-descriptions-item label="经度">{{ detailData.x || '-' }}</el-descriptions-item>
        <el-descriptions-item label="纬度">{{ detailData.y || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailData.updateTime || '-' }}</el-descriptions-item>
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
  Star, 
  OfficeBuilding, 
  TrendCharts, 
  ChatDotRound,
  View,
  Edit
} from '@element-plus/icons-vue'
import {
  getShopPage,
  addShop,
  updateShop,
  deleteShopById,
  batchDeleteShop,
  getShopById
} from '@/api/shop'
import { getShopTypeList } from '@/api/shopType'
import type { Shop, ShopType } from '@/types'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<Shop[]>([])
const shopTypeList = ref<ShopType[]>([])
const selectedIds = ref<number[]>([])
const detailData = ref<Partial<Shop>>({})

const searchForm = reactive({
  name: '',
  typeId: undefined as number | undefined
})

// 统计计算属性
const avgScore = computed(() => {
  if (tableData.value.length === 0) return '0.0'
  const totalScore = tableData.value.reduce((sum, item) => sum + (item.score || 0), 0)
  const countWithScore = tableData.value.filter(item => item.score > 0).length
  if (countWithScore === 0) return '0.0'
  return (totalScore / countWithScore / 10).toFixed(1)
})

const totalSold = computed(() => {
  return tableData.value.reduce((sum, item) => sum + (item.sold || 0), 0)
})

const totalComments = computed(() => {
  return tableData.value.reduce((sum, item) => sum + (item.comments || 0), 0)
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
  name: '',
  typeId: undefined as number | undefined,
  images: '',
  area: '',
  address: '',
  x: undefined as number | undefined,
  y: undefined as number | undefined,
  avgPrice: undefined as number | undefined,
  openHours: ''
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入商铺名称', trigger: 'blur' }
  ]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getShopPage({
      current: pagination.current,
      size: pagination.size,
      name: searchForm.name
    })
    if (res.success) {
      tableData.value = res.data || []
      pagination.total = res.total || 0
    }
  } catch (error) {
    console.error('获取商铺列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchShopTypeList = async () => {
  try {
    const res = await getShopTypeList()
    if (res.success) {
      shopTypeList.value = res.data || []
    }
  } catch (error) {
    console.error('获取商铺类型列表失败:', error)
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.typeId = undefined
  handleSearch()
}

const handleSelectionChange = (selection: Shop[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增商铺'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Shop) => {
  isEdit.value = true
  dialogTitle.value = '编辑商铺'
  resetForm()
  
  formData.id = row.id
  formData.name = row.name
  formData.typeId = row.typeId
  formData.images = row.images || ''
  formData.area = row.area || ''
  formData.address = row.address || ''
  formData.x = row.x
  formData.y = row.y
  formData.avgPrice = row.avgPrice
  formData.openHours = row.openHours || ''
  
  dialogVisible.value = true
}

const handleView = async (row: Shop) => {
  try {
    const res = await getShopById(row.id)
    if (res.success) {
      detailData.value = res.data || {}
      detailVisible.value = true
    }
  } catch (error) {
    console.error('获取商铺详情失败:', error)
  }
}

const handleDelete = (row: Shop) => {
  ElMessageBox.confirm(`确定要删除商铺"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteShopById(row.id)
      if (res.success) {
        ElMessage.success('删除成功')
        fetchData()
      }
    } catch (error) {
      console.error('删除商铺失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个商铺吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await batchDeleteShop(selectedIds.value)
      if (res.success) {
        ElMessage.success('删除成功')
        fetchData()
      }
    } catch (error) {
      console.error('批量删除商铺失败:', error)
    }
  }).catch(() => {})
}

const resetForm = () => {
  formData.id = undefined
  formData.name = ''
  formData.typeId = undefined
  formData.images = ''
  formData.area = ''
  formData.address = ''
  formData.x = undefined
  formData.y = undefined
  formData.avgPrice = undefined
  formData.openHours = ''
  
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
        
        let res
        if (isEdit.value) {
          res = await updateShop(data)
        } else {
          res = await addShop(data)
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
  fetchShopTypeList()
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
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #67c23a 0%, #42b883 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #e6a23c 0%, #f59e0b 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #909399 0%, #7c3aed 100%);
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
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
  transition: all 0.2s ease;
}

.search-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
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
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
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
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
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
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.dialog-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
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

/* 状态标签 */
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.success {
  background: #dcfce7;
  color: #166534;
}

.status-tag.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-tag.danger {
  background: #fee2e2;
  color: #991b1b;
}

/* 加载动画 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
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
