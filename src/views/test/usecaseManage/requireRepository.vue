<template>
  <div class="require-repository-container">
    <!-- 左侧目录树 -->
    <div class="left-panel">
      <div class="panel-header">
        <h3>目录结构</h3>
      </div>
      <div class="tree-container">
        <DirectoryTreeSelect
          ref="directoryTreeSelect"
          :show-actions="false"
          @node-select="handleNodeSelect"
        />
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="right-panel">
      <!-- 查询条件 -->
      <div class="search-section">
        <el-form :model="searchForm" :inline="true" class="search-form">
          <!-- 第一排：需求点概述、设计人、查询按钮和重置按钮 -->
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item label="需求点概述">
                <el-input
                  v-model="searchForm.requirePointDesc"
                  placeholder="请输入需求点概述"
                  clearable
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="设计人">
                <el-input
                  v-model="searchForm.designer"
                  placeholder="请输入设计人"
                  clearable
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button type="primary" @click="handleSearch" :loading="loading">
                  <i class="el-icon-search"></i> 查询
                </el-button>
                <el-button @click="handleReset">
                  <i class="el-icon-refresh"></i> 重置
                </el-button>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <!-- 预留空间 -->
            </el-col>
          </el-row>
          <!-- 第二排：其他查询条件 -->
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item label="需求点类型">
                <el-select
                  v-model="searchForm.requirePointType"
                  placeholder="请选择需求点类型"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in requirePointTypeOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                    :value="item.dataValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="评审状态">
                <el-select
                  v-model="searchForm.reviewStatus"
                  placeholder="请选择评审状态"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in reviewStatusOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                    :value="item.dataValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="需求状态">
                <el-select
                  v-model="searchForm.requireStatus"
                  placeholder="请选择需求状态"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in requireStatusOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                    :value="item.dataValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <!-- 预留空间，保持布局平衡 -->
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button type="primary" @click="handleAdd" :disabled="!selectedDirectory">
          <i class="el-icon-plus"></i> 新增需求点
        </el-button>
        <el-button type="success" @click="handleBatchReview" :disabled="selectedRows.length === 0">
          <i class="el-icon-check"></i> 批量评审
        </el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <i class="el-icon-delete"></i> 批量删除
        </el-button>
        <el-button type="warning" @click="handleImport">
          <i class="el-icon-upload2"></i> 导入
        </el-button>
        <el-button type="info" @click="handleExport" :disabled="tableData.length === 0">
          <i class="el-icon-download"></i> 导出
        </el-button>
        <el-button type="default" @click="handleDownloadTemplate">
          <i class="el-icon-document"></i> 下载导入模板
        </el-button>
      </div>


      <!-- 结果列表 -->
      <div class="table-section">
        <el-table
          :data="tableData"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          stripe
          border
          style="width: 100%"
          :max-height="600"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="requirePointDesc" label="需求点概述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="requirePointType" label="需求点类型" width="120">
            <template slot-scope="scope">
              <el-tag :type="getRequirePointTypeTag(scope.row.requirePointType)">
                {{ getRequirePointTypeText(scope.row.requirePointType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reviewStatus" label="评审状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getReviewStatusTag(scope.row.reviewStatus)">
                {{ getReviewStatusText(scope.row.reviewStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="requireStatus" label="需求状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getRequireStatusTag(scope.row.requireStatus)">
                {{ getRequireStatusText(scope.row.requireStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="analysisMethod" label="分析方法" width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ getAnalysisMethodText(scope.row.analysisMethod) }}
            </template>
          </el-table-column>
          <el-table-column prop="designer" label="设计人" width="100" />
          <el-table-column prop="createTime" label="创建时间" width="160">
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="modifyTime" label="修改时间" width="160">
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.modifyTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleView(scope.row)">
                查看
              </el-button>
              <el-button size="mini" type="success" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.currentPage"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="需求点概述" prop="requirePointDesc">
          <el-input
            v-model="formData.requirePointDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入需求点概述"
          />
        </el-form-item>
        <el-form-item label="需求点类型" prop="requirePointType">
          <el-select v-model="formData.requirePointType" placeholder="请选择需求点类型" style="width: 100%">
            <el-option
              v-for="item in requirePointTypeOptions"
              :key="item.dataValue"
              :label="item.dataName"
              :value="item.dataValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分析方法" prop="analysisMethod">
          <el-select v-model="formData.analysisMethod" placeholder="请选择分析方法" style="width: 100%">
            <el-option
              v-for="item in analysisMethodOptions"
              :key="item.dataValue"
              :label="item.dataName"
              :value="item.dataValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </el-dialog>

    <!-- 导入对话框 -->
    <FileUploadDialog
      title="导入需求点"
      :visible.sync="importDialogVisible"
      tips="请先下载导入模板，按照模板格式填写数据后上传"
      accept=".xlsx,.xls"
      accept-text="Excel"
      :max-size="10"
      confirm-text="确定导入"
      :loading="importLoading"
      @confirm="handleImportConfirm"
      @cancel="importDialogVisible = false"
    />
  </div>
</template>

<script>
import DirectoryTreeSelect from '../baseManage/components/DirectoryTreeSelect.vue'
import FileUploadDialog from '@/views/sys/common/FileUploadDialog.vue'
import dictionaryApi from '@/api/framework/dictionary'
import requireRepositoryApi from '@/api/test/usecaseManage/requireRepository'

    export default {
  name: 'RequireRepository',
  components: {
    DirectoryTreeSelect,
    FileUploadDialog
  },
  data() {
    return {
      // 查询表单
      searchForm: {
        requirePointDesc: '',
        requirePointType: '',
        reviewStatus: '',
        requireStatus: '',
        designer: '',
        directoryId: ''
      },
      // 数据字典选项
      requirePointTypeOptions: [],
      reviewStatusOptions: [],
      requireStatusOptions: [],
      analysisMethodOptions: [],

      // 导入相关
      importDialogVisible: false,
      importLoading: false,

      // 表格数据
      tableData: [],
      selectedRows: [],
      loading: false,

      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },

      // 选中的目录
      selectedDirectory: null,

      // 对话框
      dialogVisible: false,
      dialogTitle: '',
      submitLoading: false,
      formData: {
        requirePointId: '',
        requirePointDesc: '',
        requirePointType: '',
        analysisMethod: '',
        remark: '',
        directoryId: '',
        systemId: ''
      },

      // 表单验证规则
      formRules: {
        requirePointDesc: [
          { required: true, message: '请输入需求点概述', trigger: 'blur' }
        ],
        requirePointType: [
          { required: true, message: '请选择需求点类型', trigger: 'change' }
        ],
        analysisMethod: [
          { required: true, message: '请输入分析方法', trigger: 'blur' }
        ]
      }
    }
  },

  async created() {
    await this.loadDictionaryData()
    // 只加载数据字典，不自动查询数据
  },

  mounted() {
    // 页面加载时不自动查询数据
  },

  methods: {

    // 加载数据字典
    async loadDictionaryData() {
      try {
        const [requirePointTypeRes, reviewStatusRes, requireStatusRes, analysisMethodRes] = await Promise.all([
          dictionaryApi.getDictionaryList('requirePointType'),
          dictionaryApi.getDictionaryList('reviewStatus'),
          dictionaryApi.getDictionaryList('requireStatus'),
          dictionaryApi.getDictionaryList('analysisMethod')
        ])

        this.requirePointTypeOptions = requirePointTypeRes.data || []
        this.reviewStatusOptions = reviewStatusRes.data || []
        this.requireStatusOptions = requireStatusRes.data || []
        this.analysisMethodOptions = analysisMethodRes.data || []
      } catch (error) {
        console.error('加载数据字典失败:', error)
        this.$message.error('加载数据字典失败')
      }
    },

    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          pageNum: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }

        // 如果directoryId可能有问题，可以临时移除或重命名
        if (params.directoryId) {
          // 临时使用不同的参数名
          params.directoryId = params.directoryId
          delete params.directoryId
        }

        const response = await requireRepositoryApi.getRequirePointList(params)

        // 检查API响应结构，支持两种格式
        let responseData = null
        if (response.data && response.data.code === 20000) {
          // 标准格式：{code: 20000, message: "success", data: {rows: [], total: 0}}
          responseData = response.data.data
        } else if (response.data && response.data.rows) {
          // 直接格式：{rows: [], total: 0, pageNo: 1, ...}
          responseData = response.data
        }

        if (responseData) {
          // 强制清空并重新设置数据
          this.tableData = []
          this.$nextTick(() => {
            this.tableData = responseData.rows || []
            this.pagination.total = responseData.total || 0
            // 强制更新视图
            this.$forceUpdate()
          })
        } else {
          console.log('API响应数据格式不正确:', response.data)
          this.$message.error('API响应数据格式不正确')
        }
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败: ' + (error.response?.data?.message || error.message))
      } finally {
        this.loading = false
      }
    },

    // 查询
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 重置
    handleReset() {
      this.searchForm = {
        requirePointDesc: '',
        requirePointType: '',
        reviewStatus: '',
        requireStatus: '',
        designer: '',
        directoryId: ''
      }
      this.pagination.currentPage = 1
      // 重置时清空表格数据，不自动查询
      this.tableData = []
      this.pagination.total = 0
    },

    // 目录选择
    handleNodeSelect(data) {
      this.selectedDirectory = data
      this.searchForm.directoryId = data.directoryId
      this.loadData()
    },

    // 新增
    handleAdd() {
      if (!this.selectedDirectory) {
        this.$message.warning('请先选择目录')
        return
      }

      this.dialogTitle = '新增需求点'
      this.dialogVisible = true
      this.formData = {
        requirePointId: '',
        requirePointDesc: '',
        requirePointType: '',
        analysisMethod: '',
        remark: '',
        directoryId: this.selectedDirectory.directoryId,
        systemId: this.selectedDirectory.systemId
      }
    },

    // 编辑
    handleEdit(row) {
      this.dialogTitle = '编辑需求点'
      this.dialogVisible = true
      this.formData = { ...row }
    },

    // 查看
    handleView(row) {
      // 实现查看详情逻辑
      this.$message.info('查看功能待实现')
    },

    // 删除
    handleDelete(row) {
      this.$confirm('确定要删除该需求点吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // 这里替换为实际的API调用
          await this.$http.delete(`/api/require-points/${row.requirePointId}`)
          this.$message.success('删除成功')
          this.loadData()
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      })
    },

    // 批量评审
    handleBatchReview() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要评审的需求点')
        return
      }

      this.$prompt('请输入评审意见', '批量评审', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator: (value) => {
          if (!value || value.trim() === '') {
            return '请输入评审意见'
          }
          return true
        }
      }).then(async ({ value: reviewComment }) => {
        try {
          const requirePointIds = this.selectedRows.map(row => row.requirePointId)
          await requireRepositoryApi.batchReviewRequirePoints({
            requirePointIds: requirePointIds,
            reviewStatus: 'PASSED', // 默认通过，可以根据需要调整
            reviewComment: reviewComment.trim()
          })

          this.$message.success('批量评审成功')
          this.selectedRows = []
          this.loadData()
        } catch (error) {
          console.error('批量评审失败:', error)
          this.$message.error('批量评审失败')
        }
      }).catch(() => {
        // 用户取消
      })
    },

    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的需求点')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个需求点吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const requirePointIds = this.selectedRows.map(row => row.requirePointId)
          await requireRepositoryApi.batchDeleteRequirePoints(requirePointIds)
          this.$message.success('删除成功')
          this.loadData()
        } catch (error) {
          console.error('批量删除失败:', error)
          this.$message.error('批量删除失败')
        }
      })
    },

    // 提交表单
    handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            let response
            if (this.formData.requirePointId) {
              // 更新需求点
              response = await requireRepositoryApi.updateRequirePoint(this.formData.requirePointId, this.formData)
            } else {
              // 新增需求点
              response = await requireRepositoryApi.createRequirePoint(this.formData)
            }

            this.$message.success(this.formData.requirePointId ? '修改成功' : '新增成功')
            this.dialogVisible = false
            this.loadData()
          } catch (error) {
            console.error('提交失败:', error)
            this.$message.error('提交失败')
          } finally {
            this.submitLoading = false
          }
        }
      })
    },

    // 表格选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadData()
    },

    // 获取需求点类型标签样式
    getRequirePointTypeTag(type) {
      const typeMap = {
        '1': 'primary',
        '2': 'success',
        '3': 'danger',
        '4': 'warning'
      }
      return typeMap[type] || 'info'
    },

    // 获取需求点类型文本
    getRequirePointTypeText(type) {
      const item = this.requirePointTypeOptions.find(option => option.dataValue === type)
      return item ? item.dataName : type
    },

    // 获取评审状态标签样式
    getReviewStatusTag(status) {
      const statusMap = {
        '0': 'warning',
        '1': 'success',
        '2': 'danger'
      }
      return statusMap[status] || 'info'
    },

    // 获取评审状态文本
    getReviewStatusText(status) {
      const item = this.reviewStatusOptions.find(option => option.dataValue === status)
      return item ? item.dataName : status
    },

    // 获取需求状态标签样式
    getRequireStatusTag(status) {
      const statusMap = {
        '0': 'warning',
        '1': 'primary',
        '2': 'success',
        '3': 'info'
      }
      return statusMap[status] || 'info'
    },

    // 获取需求状态文本
    getRequireStatusText(status) {
      const item = this.requireStatusOptions.find(option => option.dataValue === status)
      return item ? item.dataName : status
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN')
    },

    // 获取需求点类型文本
    getRequirePointTypeText(type) {
      const item = this.requirePointTypeOptions.find(option => option.dataValue === type)
      return item ? item.dataName : type
    },

    // 获取分析方法文本
    getAnalysisMethodText(method) {
      const item = this.analysisMethodOptions.find(option => option.dataValue === method)
      return item ? item.dataName : method
    },

    // 导入相关方法
    handleImport() {
      this.importDialogVisible = true
    },

    async handleImportConfirm(file) {
      this.importLoading = true
      try {
        const formData = new FormData()
        formData.append('file', file.raw)

        // 添加额外参数
        if (this.selectedDirectory?.directoryId) {
          formData.append('directoryId', this.selectedDirectory.directoryId)
        }

        const response = await requireRepositoryApi.importRequirePoints(formData)

        this.$message.success('导入成功')
        this.importDialogVisible = false
        this.loadData() // 重新加载数据
      } catch (error) {
        console.error('导入失败:', error)
        this.$message.error('导入失败: ' + (error.message || '未知错误'))
      } finally {
        this.importLoading = false
      }
    },

    // 导出
    async handleExport() {
      if (this.tableData.length === 0) {
        this.$message.warning('没有数据可导出')
        return
      }

      try {
        const response = await requireRepositoryApi.exportRequirePoints(this.searchForm)

        // 创建下载链接
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url

        // 从响应头获取文件名，如果没有则使用默认名称
        const contentDisposition = response.headers['content-disposition']
        let fileName = '需求点数据.xlsx'
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, ''))
          }
        }

        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        this.$message.success('导出成功')
      } catch (error) {
        console.error('导出失败:', error)
        this.$message.error('导出失败: ' + (error.message || '未知错误'))
      }
    },

    // 下载导入模板
    async handleDownloadTemplate() {
      try {
        this.$message.info('正在下载模板...')
        
        const response = await requireRepositoryApi.downloadImportTemplate()
        console.log('下载模板响应:', response)

        // 检查响应数据
        if (!response.data) {
          throw new Error('服务器返回空数据')
        }

        // 创建下载链接
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = '需求点导入模板.xlsx'
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 清理URL对象
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 100)

        this.$message.success('模板下载成功')
      } catch (error) {
        console.error('下载模板失败:', error)
        console.error('错误详情:', {
          message: error.message,
          response: error.response,
          status: error.response?.status,
          data: error.response?.data
        })
        
        let errorMessage = '下载模板失败'
        if (error.response?.status === 404) {
          errorMessage = '模板文件不存在，请联系管理员'
        } else if (error.response?.status === 500) {
          errorMessage = '服务器错误，请稍后重试'
        } else if (error.response?.status === 403) {
          errorMessage = '没有权限下载模板文件'
        } else if (error.message) {
          errorMessage = error.message
        }
        
        this.$message.error(errorMessage)
      }
    }
  }
    }
</script>

<style scoped>
.require-repository-container {
  display: flex;
  height: calc(100vh - 84px);
  background: #f5f5f5;
}

.left-panel {
  width: 280px;
  background: white;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.tree-container {
  flex: 1;
  padding: 8px;
  overflow: auto;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-section {
  padding: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.search-form {
  margin: 0;
}

.search-form .el-form-item {
  margin-bottom: 12px;
  display: inline-block !important;
  vertical-align: top;
  margin-right: 16px;
}

/* 统一的label和content样式 */
.search-form .el-form-item__label {
  font-size: 14px;
  color: #606266;
  line-height: 32px;
  white-space: nowrap;
  width: 70px;
  display: inline-block !important;
  float: none !important;
  text-align: left;
  margin-right: 8px;
}

.search-form .el-form-item__content {
  width: calc(100% - 78px);
  display: inline-block !important;
  vertical-align: top;
}

.search-form .el-row {
  margin-bottom: 8px;
}

.search-form .el-row:last-child {
  margin-bottom: 0;
}

.action-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
}

.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.pagination-container {
  padding: 16px 20px;
  text-align: right;
  border-top: 1px solid #e6e6e6;
  background: #fafafa;
}

.dialog-footer {
  text-align: right;
}

/* 导入对话框样式 */

/* 响应式布局 */
@media (max-width: 1400px) {
  .left-panel {
    width: 260px;
  }
}

@media (max-width: 1200px) {
  .left-panel {
    width: 240px;
  }

  .search-form .el-row .el-col {
    margin-bottom: 10px;
  }
}

@media (max-width: 992px) {
  .left-panel {
    width: 220px;
  }

  .search-section {
    padding: 16px;
  }

  .search-form .el-row .el-col {
    margin-bottom: 8px;
  }
}

@media (max-width: 768px) {
  .require-repository-container {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    height: 200px;
  }

  .right-panel {
    margin: 8px;
  }

  .search-section {
    padding: 12px;
  }

  .search-form .el-row .el-col {
    margin-bottom: 12px;
  }

  /* 小屏幕下调整列宽 */
  .search-form .el-row:first-child .el-col:first-child {
    span: 12;
  }

  .search-form .el-row:first-child .el-col:last-child {
    span: 12;
  }
}

@media (max-width: 576px) {
  /* 超小屏幕下垂直布局 */
  .search-form .el-row .el-col {
    span: 24;
    margin-bottom: 12px;
  }

  .search-form .el-row:first-child .el-col:last-child {
    text-align: left;
  }
}
</style>
