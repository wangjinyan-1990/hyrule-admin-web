<template>
  <div class="usecase-execution-container">
    <!-- 左侧目录树 -->
    <div class="left-panel">
      <div class="panel-header">
        <h3>测试集目录</h3>
      </div>
      <div class="system-select-container">
        <el-select
          v-model="selectedSystemId"
          placeholder="请选择系统"
          clearable
          filterable
          @change="handleSystemChange"
          style="width: 100%; margin-bottom: 10px;">
          <el-option
            v-for="system in systemOptions"
            :key="system.systemId"
            :label="system.systemName"
            :value="system.systemId">
          </el-option>
        </el-select>
      </div>
      <div class="tree-container">
        <DirectoryTreeSelect
          ref="directoryTreeSelect"
          :show-actions="true"
          @node-select="handleNodeSelect"
        />
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="right-panel">
      <!-- 摘要统计 -->
      <el-card id="summary">
        <div slot="header">
          <span>摘要</span>
        </div>
        <el-row :gutter="20">
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">用例总数:</div>
              <div class="stat-value">{{ statistics.totalCount || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">通过率:</div>
              <div class="stat-value">{{ statistics.passRate || '0%' }}</div>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">未执行:</div>
              <div class="stat-value">{{ statistics.notExecuted || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">偏差率:</div>
              <div class="stat-value">{{ statistics.deviationRate || '0%' }}</div>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">通过:</div>
              <div class="stat-value">{{ statistics.passed || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">可执行率:</div>
              <div class="stat-value">{{ statistics.executableRate || '0%' }}</div>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">失败:</div>
              <div class="stat-value">{{ statistics.failed || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">完成率:</div>
              <div class="stat-value">{{ statistics.completionRate || '0%' }}</div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 10px;">
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">不适用:</div>
              <div class="stat-value">{{ statistics.notApplicable || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">缺陷率:</div>
              <div class="stat-value">{{ statistics.defectRate || '0%' }}</div>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">阻塞:</div>
              <div class="stat-value">{{ statistics.blocked || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <div class="stat-label">缺陷数:</div>
              <div class="stat-value">{{ statistics.defectCount || 0 }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 搜索栏 - 查询条件输入框区域 -->
      <el-card id="search">
        <el-row>
          <el-col :span="24">
            <!-- 第一排查询条件 -->
            <el-row style="margin-bottom: 0px;">
              <el-col :span="6">
                <el-input v-model="searchForm.usecaseId" placeholder="用例编号" class="search-input-small"></el-input>
              </el-col>
              <el-col :span="6">
                <el-input v-model="searchForm.usecaseName" placeholder="用例名称" class="search-input-small"></el-input>
              </el-col>
              <el-col :span="6">
                <el-input v-model="searchForm.usecaseOverview" placeholder="用例概述" class="search-input-small"></el-input>
              </el-col>
              <el-col :span="6">
                <el-checkbox v-model="searchForm.includeSubdirectories" style="margin-right: 10px;">包含子目录:</el-checkbox>
                <el-button @click="handleSearch" type="primary" round icon="el-icon-search" class="search-button-small">查询</el-button>
                <el-button @click="handleReset" type="info" round icon="el-icon-refresh" class="search-button-small">重置</el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

        <!-- 第二排查询条件 -->
        <el-row style="margin-top: 10px;">
          <el-col :span="6">
            <el-date-picker
              v-model="searchForm.actExecutionTimeStart"
              type="date"
              placeholder="实际执行日期(起)"
              value-format="yyyy-MM-dd"
              class="search-date-small"
              style="width: 100%;">
            </el-date-picker>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="searchForm.actExecutionTimeEnd"
              type="date"
              placeholder="实际执行日期(止)"
              value-format="yyyy-MM-dd"
              class="search-date-small"
              style="width: 100%;">
            </el-date-picker>
          </el-col>
          <el-col :span="6">
            <el-select v-model="searchForm.runStatus" placeholder="执行结果" clearable class="search-select-small">
              <el-option
                v-for="item in runStatusOptions"
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
      </el-card>

      <!-- 操作栏 -->
      <el-card id="operation">
        <el-row>
          <el-col :span="12">
            <el-button @click="handleExport" type="success" icon="el-icon-download" class="search-button-small">导出</el-button>
          </el-col>
          <el-col :span="12" style="text-align: right;">
            <el-button @click="handleRefresh" type="info" icon="el-icon-refresh" class="search-button-small">刷新</el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 用例执行列表表格 -->
      <el-card id="table">
        <el-table
          ref="executionTable"
          :data="tableData"
          border
          stripe
          style="width: 100%"
          @selection-change="handleSelectionChange"
          @row-dblclick="handleRowDblClick"
          v-loading="loading"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="usecaseId" label="用例编号" width="180" show-overflow-tooltip />
          <el-table-column prop="usecaseName" label="用例名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="usecaseOverview" label="用例概述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="creator" label="用例设计者" width="120" />
          <el-table-column prop="planExecutorName" label="计划执行人" width="120" />
          <el-table-column prop="planExecutionDate" label="计划执行日期" width="120">
            <template slot-scope="scope">
              {{ formatDate(scope.row.planExecutionDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="actExecutorName" label="实际执行人" width="120" />
          <el-table-column prop="actExecutionTime" label="实际执行日期" width="120">
            <template slot-scope="scope">
              {{ formatDate(scope.row.actExecutionTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="runStatusName" label="执行结果" width="100">
            <template slot-scope="scope">
              <el-tag :type="getRunStatusType(scope.row.runStatus)" size="mini">
                {{ scope.row.runStatusName || '-' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="functionModuleName" label="功能模块名称" width="150" show-overflow-tooltip />
          <el-table-column prop="remark" label="执行备注" min-width="150" show-overflow-tooltip />
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
  </div>
</template>

<script>
import DirectoryTreeSelect from '@/views/test/baseManage/components/DirectoryTreeSelect'
import usecaseExecutionApi from '@/api/test/usecaseManage/usecaseExecution'
import dictionaryApi from '@/api/framework/dictionary'
import testSystemApi from '@/api/test/baseManage/testSystem'

export default {
  name: 'usecaseExecution',
  components: {
    DirectoryTreeSelect
  },

  data() {
    return {
      // 加载状态
      loading: false,

      // 选中的目录
      selectedDirectory: null,

      // 选中的系统ID
      selectedSystemId: '',

      // 系统选项
      systemOptions: [],

      // 搜索表单
      searchForm: {
        usecaseId: '',
        usecaseName: '',
        usecaseOverview: '',
        actExecutionTimeStart: '',
        actExecutionTimeEnd: '',
        runStatus: '',
        includeSubdirectories: true,
        directoryId: '',
        systemId: ''
      },

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

      // 统计信息
      statistics: {
        totalCount: 0,
        passRate: '0%',
        notExecuted: 0,
        deviationRate: '0%',
        passed: 0,
        executableRate: '0%',
        failed: 0,
        completionRate: '0%',
        notApplicable: 0,
        defectRate: '0%',
        blocked: 0,
        defectCount: 0
      },

      // 执行结果选项
      runStatusOptions: []
    }
  },

  created() {
    this.loadSystemOptions()
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
    // 加载系统选项
    async loadSystemOptions() {
      try {
        const response = await testSystemApi.getTestSystemList({ pageNo: 1, pageSize: 1000 })
        if (response.code === 20000 && response.data?.rows) {
          this.systemOptions = response.data.rows
        } else if (Array.isArray(response.data)) {
          this.systemOptions = response.data
        } else if (Array.isArray(response)) {
          this.systemOptions = response
        }
      } catch (error) {
        console.error('加载系统列表失败:', error)
      }
    },

    // 加载字典数据
    async loadDictionaryData() {
      try {
        const runStatusRes = await dictionaryApi.getDictionaryList('runStatus')
        this.runStatusOptions = runStatusRes.data || []
      } catch (error) {
        this.$message.error('加载字典数据失败')
      }
    },

    // 系统选择变化
    handleSystemChange(systemId) {
      this.searchForm.systemId = systemId || ''
      this.pagination.currentPage = 1
      this.loadExecutionList()
      this.loadStatistics()
    },

    // 目录选择处理
    handleNodeSelect(node) {
      this.selectedDirectory = node
      this.searchForm.directoryId = node ? node.directoryId : ''
      this.pagination.currentPage = 1
      this.loadExecutionList()
      this.loadStatistics()
    },

    // 搜索
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadExecutionList()
      this.loadStatistics()
    },

    // 重置搜索
    handleReset() {
      this.searchForm = {
        usecaseId: '',
        usecaseName: '',
        usecaseOverview: '',
        actExecutionTimeStart: '',
        actExecutionTimeEnd: '',
        runStatus: '',
        includeSubdirectories: true,
        directoryId: this.searchForm.directoryId,
        systemId: this.searchForm.systemId
      }
      this.pagination.currentPage = 1
      this.loadExecutionList()
      this.loadStatistics()
    },

    // 加载执行列表
    async loadExecutionList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          currentPage: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }

        const response = await usecaseExecutionApi.getExecutionList(params)
        if (response.code === 20000 || response.code === 200) {
          this.tableData = response.data?.records || response.data?.rows || []
          this.pagination.total = response.data?.total || 0
        } else {
          this.$message.error(response.message || '加载执行列表失败')
          this.tableData = []
          this.pagination.total = 0
        }
      } catch (error) {
        this.$message.error('加载执行列表失败')
        this.tableData = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },

    // 加载统计信息
    async loadStatistics() {
      try {
        const params = {
          ...this.searchForm
        }

        const response = await usecaseExecutionApi.getExecutionStatistics(params)
        if (response.code === 20000 || response.code === 200) {
          const data = response.data || {}
          this.statistics = {
            totalCount: data.totalCount || 0,
            passRate: data.passRate || '0%',
            notExecuted: data.notExecuted || 0,
            deviationRate: data.deviationRate || '0%',
            passed: data.passed || 0,
            executableRate: data.executableRate || '0%',
            failed: data.failed || 0,
            completionRate: data.completionRate || '0%',
            notApplicable: data.notApplicable || 0,
            defectRate: data.defectRate || '0%',
            blocked: data.blocked || 0,
            defectCount: data.defectCount || 0
          }
        }
      } catch (error) {
        console.error('加载统计信息失败:', error)
      }
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 导出
    async handleExport() {
      try {
        const params = { ...this.searchForm }
        const response = await usecaseExecutionApi.exportExecutionList(params)

        // 创建下载链接
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `用例执行列表_${new Date().getTime()}.xlsx`
        link.click()
        window.URL.revokeObjectURL(url)

        this.$message.success('导出成功')
      } catch (error) {
        this.$message.error('导出失败')
      }
    },

    // 刷新
    handleRefresh() {
      this.loadExecutionList()
      this.loadStatistics()
    },

    // 双击行
    handleRowDblClick(row) {
      // 跳转到执行用例详情页
      this.$router.push({
        path: '/test/usecaseManage/executionDetail',
        query: { 
          usecaseExecutionId: row.usecaseExecutionId,
          usecaseId: row.usecaseId 
        }
      })
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.loadExecutionList()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadExecutionList()
    },

    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '-'
      if (typeof dateStr === 'string' && dateStr.includes(' ')) {
        return dateStr.split(' ')[0]
      }
      return dateStr
    },

    // 获取执行结果标签类型
    getRunStatusType(runStatus) {
      const statusMap = {
        '1': 'success', // 通过
        '2': 'danger', // 失败
        '3': 'info', // 未执行
        '4': 'warning', // 不适用
        '5': 'danger' // 阻塞
      }
      return statusMap[runStatus] || 'info'
    },

    // 保存页面状态
    savePageState() {
      const state = {
        selectedDirectory: this.selectedDirectory,
        selectedSystemId: this.selectedSystemId,
        searchForm: this.searchForm,
        pagination: this.pagination,
        tableData: this.tableData,
        treeExpandedKeys: this.$refs.directoryTreeSelect ? this.$refs.directoryTreeSelect.getExpandedKeys() : []
      }
      sessionStorage.setItem('usecaseExecution_state', JSON.stringify(state))
    },

    // 恢复页面状态
    restorePageState() {
      try {
        const stateStr = sessionStorage.getItem('usecaseExecution_state')
        if (stateStr) {
          const state = JSON.parse(stateStr)

          // 恢复搜索表单和分页
          this.selectedSystemId = state.selectedSystemId || ''
          this.searchForm = { ...this.searchForm, ...state.searchForm }
          this.pagination = { ...this.pagination, ...state.pagination }
          this.tableData = state.tableData || []

          // 延迟恢复目录树状态
          setTimeout(() => {
            if (state.selectedDirectory && this.$refs.directoryTreeSelect) {
              this.$refs.directoryTreeSelect.setSelectedKey(state.selectedDirectory.directoryId, state.treeExpandedKeys)
            }
          }, 100)

          // 加载统计信息
          this.loadStatistics()
        } else {
          // 如果没有保存的状态，加载默认数据
          this.loadExecutionList()
          this.loadStatistics()
        }
      } catch (error) {
        this.loadExecutionList()
        this.loadStatistics()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.usecase-execution-container {
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

.system-select-container {
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
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

// 统计样式
.stat-item {
  text-align: center;
  padding: 10px 0;

  .stat-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 5px;
  }

  .stat-value {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
  }
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

.search-date-small {
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
  .usecase-execution-container {
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
