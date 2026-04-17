<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon blue">
          <el-icon><Grid /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ pagination.total }}</div>
          <div class="stat-label">类型总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <el-icon><Sort /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ maxSort }}</div>
          <div class="stat-label">最大排序</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <el-icon><Picture /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ withIconCount }}</div>
          <div class="stat-label">有图标数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ currentPageCount }}</div>
          <div class="stat-label">当前页数量</div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-form">
        <div class="search-item">
          <span class="search-label">类型名称</span>
          <el-input
            v-model="searchForm.name"
            placeholder="请输入类型名称"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          />
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
          新增类型
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
        :row-key="(row: ShopType) => row.id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="80">
          <template #default="{ $index }">
            {{ (pagination.current - 1) * pagination.size + $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="类型名称" min-width="180">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 12px">
              <div 
                v-if="row.icon" 
                style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #409eff 0%, #667eea 100%); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0"
              >
                <img 
                  :src="row.icon" 
                  :alt="row.name"
                  style="width: 100%; height: 100%; object-fit: cover"
                  @error="(e: Event) => { (e.target as HTMLImageElement).style.display = 'none' }"
                />
              </div>
              <div 
                v-else
                style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #409eff 0%, #667eea 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0"
              >
                <el-icon style="color: #fff; font-size: 24px"><Grid /></el-icon>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px">
                <span style="font-weight: 600; color: #1e293b; font-size: 15px">{{ row.name }}</span>
                <span style="font-size: 12px; color: #94a3b8">
                  排序: {{ row.sort }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="120">
          <template #default="{ row }">
            <span v-if="row.icon" class="status-tag success">
              已设置
            </span>
            <span v-else class="status-tag warning">
              未设置
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100">
          <template #default="{ row }">
            <span style="font-weight: 600; color: #409eff">{{ row.sort }}</span>
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
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入类型名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入图标URL" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formData.sort"
            :min="0"
            placeholder="请输入排序值"
            style="width: 100%"
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
      title="商铺类型详情"
      width="400px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="类型名称">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="图标">
          <div v-if="detailData.icon" style="display: flex; align-items: center; gap: 10px">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: #f1f5f9; overflow: hidden">
              <img 
                :src="detailData.icon" 
                alt="图标"
                style="width: 100%; height: 100%; object-fit: cover"
              />
            </div>
            <span style="font-size: 12px; color: #64748b">{{ detailData.icon }}</span>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="排序">{{ detailData.sort }}</el-descriptions-item>
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
  Grid, 
  Sort, 
  Picture, 
  Document,
  View,
  Edit
} from '@element-plus/icons-vue'
import {
  getShopTypePage,
  addShopType,
  updateShopType,
  deleteShopTypeById,
  batchDeleteShopType,
  getShopTypeById
} from '@/api/shopType'
import type { ShopType } from '@/types'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const formRef = ref<FormInstance>()
const tableData = ref<ShopType[]>([])
const selectedIds = ref<number[]>([])
const detailData = ref<Partial<ShopType>>({})

const searchForm = reactive({
  name: ''
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 统计计算属性
const maxSort = computed(() => {
  if (tableData.value.length === 0) return 0
  return Math.max(...tableData.value.map(item => item.sort || 0))
})

const withIconCount = computed(() => {
  return tableData.value.filter(item => item.icon && item.icon.trim() !== '').length
})

const currentPageCount = computed(() => {
  return tableData.value.length
})

const isEdit = ref(false)
const dialogTitle = ref('')

const formData = reactive({
  id: undefined as number | undefined,
  name: '',
  icon: '',
  sort: 0
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入类型名称', trigger: 'blur' }
  ]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getShopTypePage({
      current: pagination.current,
      size: pagination.size,
      name: searchForm.name
    })
    if (res.success) {
      tableData.value = res.data || []
      pagination.total = res.total || 0
    }
  } catch (error) {
    console.error('获取商铺类型列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.name = ''
  handleSearch()
}

const handleSelectionChange = (selection: ShopType[]) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增商铺类型'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: ShopType) => {
  isEdit.value = true
  dialogTitle.value = '编辑商铺类型'
  resetForm()
  
  formData.id = row.id
  formData.name = row.name
  formData.icon = row.icon || ''
  formData.sort = row.sort
  
  dialogVisible.value = true
}

const handleView = async (row: ShopType) => {
  try {
    const res = await getShopTypeById(row.id)
    if (res.success) {
      detailData.value = res.data || {}
      detailVisible.value = true
    }
  } catch (error) {
    console.error('获取商铺类型详情失败:', error)
  }
}

const handleDelete = (row: ShopType) => {
  ElMessageBox.confirm(`确定要删除类型"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteShopTypeById(row.id)
      if (res.success) {
        ElMessage.success('删除成功')
        fetchData()
      }
    } catch (error) {
      console.error('删除商铺类型失败:', error)
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个类型吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await batchDeleteShopType(selectedIds.value)
      if (res.success) {
        ElMessage.success('删除成功')
        fetchData()
      }
    } catch (error) {
      console.error('批量删除商铺类型失败:', error)
    }
  }).catch(() => {})
}

const resetForm = () => {
  formData.id = undefined
  formData.name = ''
  formData.icon = ''
  formData.sort = 0
  
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
          res = await updateShopType(data)
        } else {
          res = await addShopType(data)
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
