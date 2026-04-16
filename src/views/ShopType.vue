<template>
  <div class="page-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="类型名称">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入类型名称"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="mb-20">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增类型
      </el-button>
      <el-button
        type="danger"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="类型名称" min-width="150" />
      <el-table-column prop="icon" label="图标" width="150">
        <template #default="{ row }">
          {{ row.icon || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <div class="table-actions">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.size"
      :page-sizes="[10, 20, 50, 100]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="fetchData"
      @current-change="fetchData"
      class="mt-20"
    />

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
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确定
          </el-button>
        </span>
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
        <el-descriptions-item label="图标">{{ detailData.icon || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ detailData.sort }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailData.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
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
