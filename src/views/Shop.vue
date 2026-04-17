<template>
  <div class="page-container">
    <!-- 搜索区域 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="商铺名称">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入商铺名称"
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
        新增商铺
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
      <el-table-column type="index" label="序号" width="80">
        <template #default="{ $index }">
          {{ (pagination.current - 1) * pagination.size + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商铺名称" min-width="150" />
      <el-table-column prop="shopType.name" label="商铺类型" width="100">
        <template #default="{ row }">
          {{ row.shopType?.name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="area" label="商圈" width="120">
        <template #default="{ row }">
          {{ row.area || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.address || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="avgPrice" label="均价" width="100">
        <template #default="{ row }">
          {{ row.avgPrice ? `¥${row.avgPrice}` : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="score" label="评分" width="100">
        <template #default="{ row }">
          {{ row.score ? (row.score / 10).toFixed(1) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="openHours" label="营业时间" width="150">
        <template #default="{ row }">
          {{ row.openHours || '-' }}
        </template>
      </el-table-column>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
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
