<template>
  <div class="usecase-repository-container">
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
      <!-- 搜索栏 - 查询条件输入框区域 -->
      <el-card id="search">
        <el-row>
          <el-col :span="24">
            <!-- 第一排查询条件 -->
            <el-row style="margin-bottom: 0px;">
            <el-col :span="6">
                <el-input v-model="searchForm.usecaseName" placeholder="用例名称" class="search-input-small"></el-input>
            </el-col>
            <el-col :span="6">
                <el-select v-model="searchForm.usecaseType" placeholder="用例类型" clearable class="search-select-small">
                  <el-option
                    v-for="item in usecaseTypeOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                    :value="item.dataValue">
                  </el-option>
                </el-select>
            </el-col>
            <el-col :span="6">
                <el-select v-model="searchForm.testPoint" placeholder="测试要点" clearable class="search-select-small">
                  <el-option
                    v-for="item in testPointOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                    :value="item.dataValue">
                  </el-option>
                </el-select>
            </el-col>
            <el-col :span="6">
                <!-- 展开/收起按钮 -->
                <el-button
                  @click="toggleMoreSearch"
                  type="text"
                  :icon="showMoreSearch ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
                  class="search-button-small">
                  {{ showMoreSearch ? '收起' : '展开' }}
                </el-button>
                <!-- 查询和重置按钮 -->
                <el-button @click="handleSearch" type="primary" round icon="el-icon-search" class="search-button-small">查询</el-button>
                <el-button @click="handleReset" type="info" round icon="el-icon-refresh" class="search-button-small">重置</el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

        <!-- 第二排查询条件 -->
        <el-row style="margin-top: 0px;">
          <el-col :span="6">
            <el-select v-model="searchForm.usecaseNature" placeholder="用例性质" clearable class="search-select-small">
                  <el-option
                    v-for="item in usecaseNatureOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                :value="item.dataValue">
              </el-option>
                </el-select>
            </el-col>
            <el-col :span="6">
            <el-select v-model="searchForm.prority" placeholder="优先级" clearable class="search-select-small">
              <el-option
                v-for="item in prorityOptions"
                :key="item.dataValue"
                :label="item.dataName"
                :value="item.dataValue">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <!-- 预留空间 -->
            </el-col>
          </el-row>

        <!-- 展开的搜索条件 -->
        <el-row v-show="showMoreSearch" style="margin-top: 0px;">
          <el-col :span="6">
            <el-select v-model="searchForm.isSmokeTest" placeholder="冒烟测试" clearable class="search-select-small">
              <el-option label="是" value="1"></el-option>
              <el-option label="否" value="0"></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input v-model="searchForm.creator" placeholder="创建人" class="search-input-small"></el-input>
          </el-col>
          <el-col :span="6">
            <!-- 可以添加更多查询条件 -->
          </el-col>
          <el-col :span="6">
            <!-- 预留空间 -->
          </el-col>
        </el-row>
      </el-card>

      <!-- 操作栏 -->
      <el-card id="operation">
        <el-row>
          <el-col :span="12">
            <el-button @click="handleAdd" type="primary" icon="el-icon-plus" class="search-button-small">新建用例</el-button>
            <el-button @click="handleBatchDelete" type="danger" icon="el-icon-delete" class="search-button-small" :disabled="!hasSelection">批量删除</el-button>
            <el-button @click="handleExport" type="success" icon="el-icon-download" class="search-button-small">导出</el-button>
            <el-button @click="handleImport" type="warning" icon="el-icon-upload2" class="search-button-small">导入</el-button>
          </el-col>
          <el-col :span="12" style="text-align: right;">
            <el-button @click="handleRefresh" type="info" icon="el-icon-refresh" class="search-button-small">刷新</el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 用例列表表格 - 需求点列表表格区域 -->
      <el-card id="table">
        <el-table
          ref="usecaseTable"
          :data="tableData"
          border
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
          @row-dblclick="handleRowDblClick"
          v-loading="loading"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="usecaseId" label="用例ID" width="180" show-overflow-tooltip />
          <el-table-column prop="usecaseName" label="用例名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="usecaseTypeName" label="用例类型" width="120" />
          <el-table-column prop="testPointName" label="测试要点" width="120" />
          <el-table-column prop="usecaseNatureName" label="用例性质" width="120" />
          <el-table-column prop="prorityName" label="优先级" width="100" />
          <el-table-column prop="latestExeStatusName" label="执行状态" width="100" />
          <el-table-column prop="isSmokeTest" label="冒烟测试" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.isSmokeTest === '1' ? 'success' : 'info'" size="mini">
                {{ scope.row.isSmokeTest === '1' ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建人" width="100" />
          <el-table-column prop="createTime" label="创建时间" width="160">
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template slot-scope="scope">
              <el-button @click="handleView(scope.row)" type="text" size="small" icon="el-icon-view">查看</el-button>
              <el-button @click="handleEdit(scope.row)" type="text" size="small" icon="el-icon-edit">编辑</el-button>
              <el-button @click="handleCopy(scope.row)" type="text" size="small" icon="el-icon-document-copy">复制</el-button>
              <el-button @click="handleDelete(scope.row)" type="text" size="small" icon="el-icon-delete" style="color: #f56c6c;">删除</el-button>
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
            :total="pagination.total">
          </el-pagination>
        </div>
      </el-card>
    </div>

    <!-- 导入对话框 -->
    <el-dialog
      title="导入用例"
      :visible.sync="importDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-upload
        ref="upload"
        :action="uploadAction"
        :headers="uploadHeaders"
        :data="uploadData"
        :file-list="fileList"
        :auto-upload="false"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        accept=".xlsx,.xls"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传xlsx/xls文件，且不超过10MB</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button @click="downloadTemplate" type="info">下载模板</el-button>
        <el-button @click="submitUpload" type="primary" :loading="uploading">确定导入</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import DirectoryTreeSelect from '@/views/test/baseManage/components/DirectoryTreeSelect'
import usecaseApi from '@/api/test/usecaseManage/usecaseRepository'
import dictionaryApi from '@/api/framework/dictionary'
import { formatDateTime } from '@/utils/index'

export default {
  name: 'usecaseRepository',
  components: {
    DirectoryTreeSelect
  },

  data() {
    return {
      // 加载状态
      loading: false,

      // 选中的目录
      selectedDirectory: null,

      // 搜索表单
      searchForm: {
        usecaseName: '',
        usecaseType: '',
        testPoint: '',
        usecaseNature: '',
        prority: '',
        isSmokeTest: '',
        creator: '',
        directoryId: ''
      },

      // 是否显示更多搜索条件
      showMoreSearch: false,

      // 表格数据
      tableData: [],

      // 选中的行
      selectedRows: [],

      // 分页信息
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },

      // 字典数据
      usecaseTypeOptions: [],
      testPointOptions: [],
      usecaseNatureOptions: [],
      prorityOptions: [],

      // 导入相关
      importDialogVisible: false,
      fileList: [],
      uploading: false,
      uploadAction: '/api/test/usecase/import',
      uploadHeaders: {},
      uploadData: {}
    }
  },

  computed: {
    // 是否有选中项
    hasSelection() {
      return this.selectedRows.length > 0
    }
  },

  created() {
    this.loadDictionaryData()
    this.restorePageState()
  },

  activated() {
    this.restorePageState()
  },

  deactivated() {
    this.savePageState()
  },

  beforeDestroy() {
    this.savePageState()
  },

  methods: {
    // 加载字典数据
    async loadDictionaryData() {
      try {
        const [usecaseTypeRes, testPointRes, usecaseNatureRes, prorityRes] = await Promise.all([
          dictionaryApi.getDictionaryList('usecaseType'),
          dictionaryApi.getDictionaryList('testPoint'),
          dictionaryApi.getDictionaryList('usecaseNature'),
          dictionaryApi.getDictionaryList('prority')
        ])

        this.usecaseTypeOptions = usecaseTypeRes.data || []
        this.testPointOptions = testPointRes.data || []
        this.usecaseNatureOptions = usecaseNatureRes.data || []
        this.prorityOptions = prorityRes.data || []
      } catch (error) {
        this.$message.error('加载字典数据失败')
      }
    },

    // 目录选择处理
    handleNodeSelect(node) {
      this.selectedDirectory = node
      this.searchForm.directoryId = node ? node.id : ''
      this.pagination.currentPage = 1
      this.loadUsecaseList()
    },

    // 切换更多搜索条件
    toggleMoreSearch() {
      this.showMoreSearch = !this.showMoreSearch
    },

    // 搜索
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadUsecaseList()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        usecaseName: '',
        usecaseType: '',
        testPoint: '',
        usecaseNature: '',
        prority: '',
        isSmokeTest: '',
        creator: '',
        directoryId: this.searchForm.directoryId
      }
      this.pagination.currentPage = 1
      this.loadUsecaseList()
    },

    // 加载用例列表
    async loadUsecaseList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          currentPage: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }

        const response = await usecaseApi.getUsecaseList(params)
        this.tableData = response.data.records || []
        this.pagination.total = response.data.total || 0
      } catch (error) {
        this.$message.error('加载用例列表失败')
      } finally {
        this.loading = false
      }
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 新建用例
    handleAdd() {
      this.$router.push({
        path: '/test/usecaseManage/usecaseDetail',
        query: { mode: 'create', directoryId: this.searchForm.directoryId }
      })
    },

    // 查看用例
    handleView(row) {
      this.$router.push({
        path: '/test/usecaseManage/usecaseDetail',
        query: { mode: 'view', id: row.usecaseId }
      })
    },

    // 编辑用例
    handleEdit(row) {
      this.$router.push({
        path: '/test/usecaseManage/usecaseDetail',
        query: { mode: 'edit', id: row.usecaseId }
      })
    },

    // 复制用例
    async handleCopy(row) {
      try {
        await this.$confirm('确定要复制此用例吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await usecaseApi.copyUsecase(row.usecaseId, {
          targetDirectoryId: this.searchForm.directoryId
        })

        this.$message.success('复制成功')
        this.loadUsecaseList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('复制失败')
        }
      }
    },

    // 删除用例
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除此用例吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        await usecaseApi.deleteUsecase(row.usecaseId)

        this.$message.success('删除成功')
        this.loadUsecaseList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    // 批量删除
    async handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的用例')
        return
      }

      try {
        await this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个用例吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const usecaseIds = this.selectedRows.map(row => row.usecaseId)
        await usecaseApi.batchDeleteUsecases(usecaseIds)

        this.$message.success('批量删除成功')
        this.loadUsecaseList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量删除失败')
        }
      }
    },

    // 导出
    async handleExport() {
      try {
        const params = { ...this.searchForm }
        const response = await usecaseApi.exportUsecases(params)

        // 创建下载链接
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `用例列表_${new Date().getTime()}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)

        this.$message.success('导出成功')
      } catch (error) {
        this.$message.error('导出失败')
      }
    },

    // 导入
    handleImport() {
      this.importDialogVisible = true
      this.fileList = []
    },

    // 下载模板
    async downloadTemplate() {
      try {
        const response = await usecaseApi.downloadImportTemplate()

        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = '用例导入模板.xlsx'
        link.click()
        window.URL.revokeObjectURL(url)

        this.$message.success('模板下载成功')
      } catch (error) {
        this.$message.error('模板下载失败')
      }
    },

    // 上传前检查
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.type === 'application/vnd.ms-excel'
      const isLt10M = file.size / 1024 / 1024 < 10

      if (!isExcel) {
        this.$message.error('只能上传Excel文件!')
        return false
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB!')
        return false
      }
      return true
    },

    // 提交上传
    submitUpload() {
      if (this.fileList.length === 0) {
        this.$message.warning('请选择要上传的文件')
        return
      }

      this.uploading = true
      this.$refs.upload.submit()
    },

    // 上传成功
    handleUploadSuccess(response) {
      this.uploading = false
      this.importDialogVisible = false
      this.$message.success('导入成功')
      this.loadUsecaseList()
    },

    // 上传失败
    handleUploadError(error) {
      this.uploading = false
      this.$message.error('导入失败')
    },

    // 刷新
    handleRefresh() {
      this.loadUsecaseList()
    },

    // 双击行
    handleRowDblClick(row) {
      this.handleView(row)
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.loadUsecaseList()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadUsecaseList()
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      return formatDateTime(dateTime)
    },

    // 保存页面状态
    savePageState() {
      const state = {
        selectedDirectory: this.selectedDirectory,
        searchForm: this.searchForm,
        pagination: this.pagination,
        tableData: this.tableData,
        treeExpandedKeys: this.$refs.directoryTreeSelect ? this.$refs.directoryTreeSelect.getExpandedKeys() : []
      }
      sessionStorage.setItem('usecaseRepository_state', JSON.stringify(state))
    },

    // 恢复页面状态
    restorePageState() {
      try {
        const stateStr = sessionStorage.getItem('usecaseRepository_state')
        if (stateStr) {
          const state = JSON.parse(stateStr)

          // 恢复搜索表单和分页
          this.searchForm = { ...this.searchForm, ...state.searchForm }
          this.pagination = { ...this.pagination, ...state.pagination }
          this.tableData = state.tableData || []

          // 延迟恢复目录树状态
          setTimeout(() => {
            if (state.selectedDirectory && this.$refs.directoryTreeSelect) {
              this.$refs.directoryTreeSelect.setSelectedKey(state.selectedDirectory.id, state.treeExpandedKeys)
            }
          }, 100)
        } else {
          // 如果没有保存的状态，加载默认数据
          this.loadUsecaseList()
        }
      } catch (error) {
        this.loadUsecaseList()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.usecase-repository-container {
  display: flex;
  height: calc(100vh - 84px);
  background-color: #f5f5f5;
}

.left-panel {
  width: 300px;
  background-color: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fafafa;

  h3 {
    margin: 0;
    font-size: 16px;
    color: #303133;
  }
}

.tree-container {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 搜索条件样式
.search-input-small {
  ::v-deep .el-input__inner {
    height: 24px !important;
    line-height: 24px !important;
    font-size: 10px !important;
  }
}

.search-select-small {
  ::v-deep .el-input__inner {
    height: 24px !important;
    line-height: 24px !important;
    font-size: 10px !important;
  }
}

.search-button-small {
  height: 24px !important;
  padding: 0 8px !important;
  font-size: 10px !important;
  line-height: 24px !important;
}

// 表格样式
::v-deep .el-table th {
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 !important;
  font-size: 12px !important;
}

::v-deep .el-table td {
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 !important;
  font-size: 12px !important;
}

::v-deep .el-table .cell {
  padding: 0 8px !important;
  line-height: 24px !important;
}

::v-deep .el-button--mini {
  height: 20px !important;
  padding: 0 5px !important;
  font-size: 10px !important;
  line-height: 20px !important;
}

::v-deep .el-tag--mini {
  height: 16px !important;
  line-height: 16px !important;
  font-size: 10px !important;
}

// 卡片样式
.el-card {
  margin-bottom: 10px;

  ::v-deep .el-card__body {
    padding: 15px;
  }
}

// 分页样式
.pagination-container {
  margin-top: 15px;
  text-align: right;
}

// 响应式设计
@media (max-width: 768px) {
  .usecase-repository-container {
    flex-direction: column;
    height: auto;
  }

  .left-panel {
    width: 100%;
    height: 300px;
  }

  .right-panel {
    height: auto;
  }
}
</style>
