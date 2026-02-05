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
          :show-actions="false"
          module="isUseTestset"
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
              <span class="stat-label">用例总数:</span>
              <span class="stat-value">{{ statistics.totalCount || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <span class="stat-label">通过率:</span>
              <el-tooltip content="通过的用例数/(通过的用例数+失败的用例数)" placement="top">
                <span class="stat-value stat-value-tooltip">{{ statistics.passRate || '0%' }}</span>
              </el-tooltip>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <span class="stat-label">未执行:</span>
              <span class="stat-value">{{ statistics.notExecuted || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <span class="stat-label">偏差率:</span>
              <span class="stat-value">{{ statistics.deviationRate || '0%' }}</span>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <span class="stat-label">通过:</span>
              <span class="stat-value">{{ statistics.passed || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <span class="stat-label">可执行率:</span>
              <el-tooltip content="(通过+失败)/(通过+失败+阻塞+不适用)" placement="top">
                <span class="stat-value stat-value-tooltip">{{ statistics.executableRate || '0%' }}</span>
              </el-tooltip>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <span class="stat-label">失败:</span>
              <span class="stat-value">{{ statistics.failed || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <span class="stat-label">完成率:</span>
              <el-tooltip content="通过/(用例总数-不适用)" placement="top">
                <span class="stat-value stat-value-tooltip">{{ statistics.completionRate || '0%' }}</span>
              </el-tooltip>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 5px;">
          <el-col :span="3">
            <div class="stat-item">
              <span class="stat-label">不适用:</span>
              <span class="stat-value">{{ statistics.notApplicable || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <span class="stat-label">缺陷率:</span>
              <el-tooltip content="缺陷数/(用例总数-未执行-不适用)" placement="top">
                <span class="stat-value stat-value-tooltip">{{ statistics.bugRate || '0%' }}</span>
              </el-tooltip>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <span class="stat-label">阻塞:</span>
              <span class="stat-value">{{ statistics.blocked || 0 }}</span>
            </div>
          </el-col>
          <el-col :span="3">
            <div class="stat-item">
              <span class="stat-label">缺陷数:</span>
              <span class="stat-value">{{ statistics.bugCount || 0 }}</span>
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
                <el-input v-model="searchForm.usecaseId" placeholder="用例ID" class="search-input-small"></el-input>
              </el-col>
              <el-col :span="6">
                <el-input v-model="searchForm.usecaseName" placeholder="用例名称" class="search-input-small"></el-input>
              </el-col>
              <el-col :span="12">
                <el-checkbox v-model="searchForm.includeSubdirectories" style="margin-right: 10px;" class="include-subdirectories-checkbox">包含子目录:</el-checkbox>
                <el-button @click="handleSearch" type="primary" round icon="el-icon-search" class="search-button-small">查询</el-button>
                <el-button @click="handleReset" type="info" round icon="el-icon-refresh" class="search-button-small">重置</el-button>
              </el-col>
            </el-row>
          </el-col>
        </el-row>

        <!-- 第二排查询条件 -->
        <el-row style="margin-top: 5px;">
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
            <el-button @click="handleAdd" type="primary" icon="el-icon-plus" class="search-button-small">添加</el-button>
            <el-button @click="handleMove" type="warning" icon="el-icon-rank" class="search-button-small" style="margin-left: 10px;" :disabled="selectedRows.length === 0">移动</el-button>
            <el-button @click="handlePlan" type="success" icon="el-icon-date" class="search-button-small" style="margin-left: 10px;" :disabled="selectedRows.length === 0">计划</el-button>
            <el-button @click="handleBlockOrNotApplicable" type="info" icon="el-icon-warning" class="search-button-small" style="margin-left: 10px;" :disabled="selectedRows.length === 0">阻塞|不适用</el-button>
            <el-button @click="handleDelete" type="danger" icon="el-icon-delete" class="search-button-small" style="margin-left: 10px;" :disabled="selectedRows.length === 0">删除</el-button>
            <el-button @click="handleExport" type="success" icon="el-icon-download" class="search-button-small" style="margin-left: 10px;">导出</el-button>
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
          <el-table-column prop="usecaseId" label="用例ID" width="180" show-overflow-tooltip />
          <el-table-column prop="usecaseName" label="用例名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="usecaseDesigner" label="用例设计者" width="120" />
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
                {{ getRunStatusName(scope.row.runStatus, scope.row.runStatusName) }}
              </el-tag>
            </template>
          </el-table-column>
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

    <!-- 用例选择器 -->
    <usecase-selector
      :visible.sync="selectorVisible"
      :selected-usecase-ids="existingUsecaseIds"
      @confirm="handleUsecaseConfirm"
    />

    <!-- 移动用例对话框 -->
    <el-dialog
      title="移动到其他目录"
      :visible.sync="moveDialogVisible"
      width="500px"
      @close="handleMoveDialogClose"
    >
      <div style="margin-bottom: 10px;">
        <span style="font-size: 12px; color: #909399;">请选择目标目录（只能选择当前目录的子节点目录）：</span>
      </div>
      <el-tree
        ref="moveDirectoryTree"
        :data="moveDirectoryTreeData"
        :props="{ children: 'children', label: 'directoryName' }"
        node-key="directoryId"
        :default-expand-all="false"
        highlight-current
        @node-click="handleMoveDirectoryNodeClick"
        style="max-height: 400px; overflow-y: auto;"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
        </span>
      </el-tree>
      <div v-if="selectedMoveDirectory" style="margin-top: 10px; padding: 10px; background-color: #f5f7fa; border-radius: 4px;">
        <span style="font-size: 12px; color: #606266;">已选择：</span>
        <span style="font-size: 12px; color: #303133; font-weight: bold;">{{ selectedMoveDirectory.directoryName }}</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleMoveDialogClose" size="small">取 消</el-button>
        <el-button type="primary" @click="handleMoveConfirm" size="small" :disabled="!selectedMoveDirectory">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 阻塞|不适用对话框 -->
    <el-dialog
      title="批量设置状态"
      :visible.sync="blockOrNotApplicableDialogVisible"
      width="500px"
      @close="handleBlockOrNotApplicableDialogClose"
    >
      <el-form :model="blockOrNotApplicableForm" label-width="100px">
        <el-form-item label="状态" required>
          <el-select
            v-model="blockOrNotApplicableForm.runStatus"
            placeholder="请选择状态"
            style="width: 100%"
          >
            <el-option
              v-for="item in blockOrNotApplicableStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="执行备注">
          <el-input
            v-model="blockOrNotApplicableForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入执行备注"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleBlockOrNotApplicableDialogClose" size="small">取 消</el-button>
        <el-button type="primary" @click="handleBlockOrNotApplicableConfirm" size="small" :disabled="!blockOrNotApplicableForm.runStatus">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 计划执行对话框 -->
    <el-dialog
      title="批量设置计划执行"
      :visible.sync="planDialogVisible"
      width="500px"
      @close="handlePlanDialogClose"
    >
      <el-form :model="planForm" label-width="120px">
        <el-form-item label="计划执行人" required>
          <el-select
            v-model="planForm.planExecutorId"
            placeholder="请选择计划执行人"
            filterable
            clearable
            style="width: 100%"
            :loading="testerOptionsLoading"
          >
            <el-option
              v-for="item in testerOptions"
              :key="item.userId || item.id"
              :label="item.userName || item.name"
              :value="item.userId || item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="计划执行日期" required>
          <el-date-picker
            v-model="planForm.planExecutionDate"
            type="date"
            placeholder="请选择计划执行日期"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handlePlanDialogClose" size="small">取 消</el-button>
        <el-button type="primary" @click="handlePlanConfirm" size="small" :disabled="!planForm.planExecutorId || !planForm.planExecutionDate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import DirectoryTreeSelect from '@/views/test/baseManage/components/DirectoryTreeSelect'
import UsecaseSelector from '@/views/test/usecaseManage/components/UsecaseSelector.vue'
import usecaseExecutionApi from '@/api/test/usecaseManage/usecaseExecution'
import dictionaryApi from '@/api/framework/dictionary'
import testSystemApi from '@/api/test/baseManage/testSystem'
import testDirectoryApi from '@/api/test/baseManage/testDirectory'
import selectUsersApi from '@/api/test/baseManage/selectUsers'

export default {
  name: 'usecaseExecution',
  components: {
    DirectoryTreeSelect,
    UsecaseSelector
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
        bugRate: '0%',
        blocked: 0,
        bugCount: 0
      },

      // 执行结果选项
      runStatusOptions: [],

      // 用例选择器显示状态
      selectorVisible: false,
      // 移动用例对话框
      moveDialogVisible: false,
      moveDirectoryTreeData: [],
      selectedMoveDirectory: null,
      // 阻塞|不适用对话框
      blockOrNotApplicableDialogVisible: false,
      blockOrNotApplicableForm: {
        runStatus: '',
        remark: ''
      },
      // 阻塞|不适用状态选项
      blockOrNotApplicableStatusOptions: [
        { label: '阻塞', value: '5' },
        { label: '不适用', value: '4' }
      ],
      // 计划执行对话框
      planDialogVisible: false,
      planForm: {
        planExecutorId: '',
        planExecutionDate: ''
      },
      // 测试人员选项
      testerOptions: [],
      testerOptionsLoading: false
    }
  },

  computed: {
    // 获取已存在的用例ID列表（用于选择器中排除已添加的用例）
    existingUsecaseIds() {
      return this.tableData.map(item => item.usecaseId)
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
      if (!node) {
        this.$message.warning('请选择一个有效的目录节点')
        return
      }
      this.selectedDirectory = node
      // 确保获取正确的 directoryId
      const directoryId = node.directoryId || node.id
      if (!directoryId) {
        this.$message.warning('目录节点ID无效')
        return
      }
      // 获取 systemId
      const systemId = node.systemId || this.selectedSystemId || ''
      this.searchForm.directoryId = directoryId
      this.searchForm.systemId = systemId
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
          
          // 获取基础数据
          const totalCount = data.totalCount || 0
          const notExecuted = data.notExecuted || 0
          const passed = data.passed || 0
          const failed = data.failed || 0
          const notApplicable = data.notApplicable || 0
          const blocked = data.blocked || 0
          const bugCount = data.bugCount || 0
          
          // 计算通过率：通过的用例数/(通过的用例数+失败的用例数)
          let passRate = '0%'
          const passedPlusFailed = passed + failed
          if (passedPlusFailed > 0) {
            passRate = ((passed / passedPlusFailed) * 100).toFixed(2) + '%'
          }
          
          // 计算可执行率：(通过+失败)/(通过+失败+阻塞+不适用)
          let executableRate = '0%'
          const executableDenominator = passed + failed + blocked + notApplicable
          if (executableDenominator > 0) {
            executableRate = ((passedPlusFailed / executableDenominator) * 100).toFixed(2) + '%'
          }
          
          // 计算完成率：通过/(用例总数-不适用)
          let completionRate = '0%'
          const completionDenominator = totalCount - notApplicable
          if (completionDenominator > 0) {
            completionRate = ((passed / completionDenominator) * 100).toFixed(2) + '%'
          }
          
          // 计算缺陷率：缺陷数/(用例总数-未执行-不适用)
          let bugRate = '0%'
          const bugDenominator = totalCount - notExecuted - notApplicable
          if (bugDenominator > 0) {
            bugRate = ((bugCount / bugDenominator) * 100).toFixed(2) + '%'
          }
          
          this.statistics = {
            totalCount: totalCount,
            passRate: passRate,
            notExecuted: notExecuted,
            deviationRate: data.deviationRate || '0%', // 保留原有字段，如果后端有返回
            passed: passed,
            executableRate: executableRate,
            failed: failed,
            completionRate: completionRate,
            notApplicable: notApplicable,
            bugRate: bugRate,
            blocked: blocked,
            bugCount: bugCount
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

    // 添加用例
    handleAdd() {
      if (!this.selectedDirectory) {
        this.$message.warning('请先在左侧目录树中选择一个目录节点')
        return
      }
      // 确保 directoryId 存在
      const directoryId = this.selectedDirectory.directoryId || this.selectedDirectory.id || this.searchForm.directoryId
      if (!directoryId) {
        this.$message.warning('请先在左侧目录树中选择一个目录节点，以获取目录ID')
        return
      }
      this.selectorVisible = true
    },

    // 处理用例选择确认
    async handleUsecaseConfirm(selectedUsecases) {
      if (!selectedUsecases || selectedUsecases.length === 0) {
        return
      }
      if (!this.selectedDirectory) {
        this.$message.error('缺少必要参数：请先选择目录')
        return
      }
      // 确保 directoryId 存在
      const directoryId = this.selectedDirectory.directoryId || this.selectedDirectory.id || this.searchForm.directoryId
      if (!directoryId) {
        this.$message.error('缺少必要参数：目录ID无效')
        return
      }

      try {
        // 批量创建执行记录
        const executionDataList = selectedUsecases.map(usecase => ({
          usecaseId: usecase.usecaseId,
          directoryId: directoryId,
          systemId: this.selectedDirectory.systemId || this.selectedSystemId || this.searchForm.systemId
        }))

        // 调用API批量保存
        let successCount = 0
        let failCount = 0

        for (const executionData of executionDataList) {
          try {
            const response = await usecaseExecutionApi.addToExecution(executionData)
            if (response.code === 20000) {
              successCount++
            } else {
              failCount++
            }
          } catch (error) {
            failCount++
          }
        }

        if (successCount > 0) {
          this.$message.success(`成功添加 ${successCount} 个用例到执行列表`)
          // 重新加载执行列表和统计信息
          await this.loadExecutionList()
          await this.loadStatistics()
        }
        if (failCount > 0) {
          this.$message.warning(`${failCount} 个用例添加失败`)
        }
      } catch (error) {
        console.error('添加用例到执行列表失败:', error)
        this.$message.error('添加失败')
      }
    },

    // 移动用例
    async handleMove() {
      if (!this.selectedRows || this.selectedRows.length === 0) {
        this.$message.warning('请先选择要移动的用例')
        return
      }

      if (!this.selectedDirectory) {
        this.$message.warning('请先在左侧目录树中选择一个目录节点')
        return
      }

      // 加载当前目录的子节点目录
      await this.loadMoveDirectoryTree()
      this.moveDialogVisible = true
    },

    // 加载移动目录树（只显示当前目录的子节点）
    async loadMoveDirectoryTree() {
      if (!this.selectedDirectory) {
        this.moveDirectoryTreeData = []
        return
      }

      try {
        const directoryId = this.selectedDirectory.directoryId || this.selectedDirectory.id
        const systemId = this.selectedDirectory.systemId || this.selectedSystemId || this.searchForm.systemId

        const response = await testDirectoryApi.getChildrenByParentId(
          directoryId,
          systemId,
          'isUseTestset'
        )

        if (response.code === 20000 && response.data?.rows) {
          this.moveDirectoryTreeData = response.data.rows.map(item => ({
            directoryId: item.directoryId,
            directoryName: item.directoryName,
            directoryType: item.directoryType,
            systemId: item.systemId,
            directoryParentId: item.directoryParentId,
            level: item.level || 1,
            children: []
          }))
        } else {
          this.moveDirectoryTreeData = []
        }
      } catch (error) {
        console.error('加载子目录失败:', error)
        this.moveDirectoryTreeData = []
      }
    },

    // 处理移动目录节点点击
    handleMoveDirectoryNodeClick(data) {
      this.selectedMoveDirectory = data
    },

    // 移动对话框关闭
    handleMoveDialogClose() {
      this.moveDialogVisible = false
      this.selectedMoveDirectory = null
      this.moveDirectoryTreeData = []
    },

    // 确认移动
    async handleMoveConfirm() {
      if (!this.selectedMoveDirectory) {
        this.$message.warning('请选择目标目录')
        return
      }

      if (!this.selectedRows || this.selectedRows.length === 0) {
        this.$message.warning('请先选择要移动的用例')
        return
      }

      try {
        const usecaseExecutionIds = this.selectedRows
          .map(row => row.usecaseExecutionId)
          .filter(id => id)

        if (usecaseExecutionIds.length === 0) {
          this.$message.warning('选中的用例没有有效的执行ID')
          return
        }

        const targetDirectoryId = this.selectedMoveDirectory.directoryId

        // 调用移动API
        const response = await usecaseExecutionApi.moveExecutions(
          usecaseExecutionIds,
          targetDirectoryId
        )

        if (response.code === 20000 || response.code === 200) {
          this.$message.success(`成功移动 ${usecaseExecutionIds.length} 个用例`)
          // 关闭对话框
          this.handleMoveDialogClose()
          // 清空选中
          this.selectedRows = []
          // 重新加载列表和统计
          await this.loadExecutionList()
          await this.loadStatistics()
        } else {
          this.$message.error(response.message || '移动失败')
        }
      } catch (error) {
        console.error('移动用例失败:', error)
        this.$message.error('移动失败')
      }
    },

    // 计划执行
    async handlePlan() {
      if (!this.selectedRows || this.selectedRows.length === 0) {
        this.$message.warning('请先选择要设置的用例')
        return
      }

      if (!this.selectedDirectory && !this.searchForm.systemId) {
        this.$message.warning('请先在左侧目录树中选择一个目录节点，以获取系统ID')
        return
      }

      // 获取系统ID
      const systemId = this.selectedDirectory?.systemId || this.selectedSystemId || this.searchForm.systemId
      if (!systemId) {
        this.$message.warning('无法获取系统ID，请先选择目录')
        return
      }

      // 加载测试人员列表
      await this.loadTesterOptions(systemId)

      // 重置表单
      this.planForm = {
        planExecutorId: '',
        planExecutionDate: ''
      }
      this.planDialogVisible = true
    },

    // 加载测试人员选项
    async loadTesterOptions(systemId) {
      if (!systemId) {
        this.testerOptions = []
        return
      }

      this.testerOptionsLoading = true
      try {
        const response = await selectUsersApi.getTestersBySystemId(systemId)
        if (response.code === 20000 || response.code === 200) {
          this.testerOptions = response.data || []
        } else {
          this.testerOptions = []
          this.$message.error(response.message || '加载测试人员列表失败')
        }
      } catch (error) {
        console.error('加载测试人员列表失败:', error)
        this.testerOptions = []
        this.$message.error('加载测试人员列表失败')
      } finally {
        this.testerOptionsLoading = false
      }
    },

    // 计划对话框关闭
    handlePlanDialogClose() {
      this.planDialogVisible = false
      this.planForm = {
        planExecutorId: '',
        planExecutionDate: ''
      }
      this.testerOptions = []
    },

    // 确认设置计划执行
    async handlePlanConfirm() {
      if (!this.planForm.planExecutorId) {
        this.$message.warning('请选择计划执行人')
        return
      }

      if (!this.planForm.planExecutionDate) {
        this.$message.warning('请选择计划执行日期')
        return
      }

      if (!this.selectedRows || this.selectedRows.length === 0) {
        this.$message.warning('请先选择要设置的用例')
        return
      }

      try {
        const usecaseExecutionIds = this.selectedRows
          .map(row => row.usecaseExecutionId)
          .filter(id => id)

        if (usecaseExecutionIds.length === 0) {
          this.$message.warning('选中的用例没有有效的执行ID')
          return
        }

        // 调用批量更新计划执行API
        const response = await usecaseExecutionApi.batchUpdatePlanExecution({
          usecaseExecutionIds: usecaseExecutionIds,
          planExecutorId: this.planForm.planExecutorId,
          planExecutionDate: this.planForm.planExecutionDate
        })

        if (response.code === 20000 || response.code === 200) {
          this.$message.success(`成功设置 ${usecaseExecutionIds.length} 个用例的计划执行信息`)
          // 关闭对话框
          this.handlePlanDialogClose()
          // 清空选中
          this.selectedRows = []
          // 重新加载列表和统计
          await this.loadExecutionList()
          await this.loadStatistics()
        } else {
          this.$message.error(response.message || '设置失败')
        }
      } catch (error) {
        console.error('设置计划执行失败:', error)
        this.$message.error('设置失败')
      }
    },

    // 阻塞|不适用
    handleBlockOrNotApplicable() {
      if (!this.selectedRows || this.selectedRows.length === 0) {
        this.$message.warning('请先选择要设置的用例')
        return
      }

      // 重置表单
      this.blockOrNotApplicableForm = {
        runStatus: '',
        remark: ''
      }
      this.blockOrNotApplicableDialogVisible = true
    },

    // 阻塞|不适用对话框关闭
    handleBlockOrNotApplicableDialogClose() {
      this.blockOrNotApplicableDialogVisible = false
      this.blockOrNotApplicableForm = {
        runStatus: '',
        remark: ''
      }
    },

    // 确认设置阻塞|不适用
    async handleBlockOrNotApplicableConfirm() {
      if (!this.blockOrNotApplicableForm.runStatus) {
        this.$message.warning('请选择状态')
        return
      }

      if (!this.selectedRows || this.selectedRows.length === 0) {
        this.$message.warning('请先选择要设置的用例')
        return
      }

      try {
        const usecaseExecutionIds = this.selectedRows
          .map(row => row.usecaseExecutionId)
          .filter(id => id)

        if (usecaseExecutionIds.length === 0) {
          this.$message.warning('选中的用例没有有效的执行ID')
          return
        }

        // 调用批量更新API
        const response = await usecaseExecutionApi.batchUpdateRunStatus({
          usecaseExecutionIds: usecaseExecutionIds,
          runStatus: this.blockOrNotApplicableForm.runStatus,
          remark: this.blockOrNotApplicableForm.remark || ''
        })

        if (response.code === 20000 || response.code === 200) {
          this.$message.success(`成功设置 ${usecaseExecutionIds.length} 个用例的状态`)
          // 关闭对话框
          this.handleBlockOrNotApplicableDialogClose()
          // 清空选中
          this.selectedRows = []
          // 重新加载列表和统计
          await this.loadExecutionList()
          await this.loadStatistics()
        } else {
          this.$message.error(response.message || '设置失败')
        }
      } catch (error) {
        console.error('设置状态失败:', error)
        this.$message.error('设置失败')
      }
    },

    // 删除用例
    async handleDelete() {
      if (!this.selectedRows || this.selectedRows.length === 0) {
        this.$message.warning('请先选择要删除的用例')
        return
      }

      // 检查选中的用例是否都是未执行状态
      // 未执行状态：runStatus 为空、null、undefined 或 '0'
      const nonExecutableRows = this.selectedRows.filter(row => {
        const runStatus = row.runStatus
        return runStatus && runStatus !== '' && runStatus !== '0' && runStatus !== null && runStatus !== undefined
      })

      if (nonExecutableRows.length > 0) {
        const statusNames = nonExecutableRows.map(row => {
          return this.getRunStatusName(row.runStatus, row.runStatusName)
        }).join('、')
        this.$message.warning(`只能删除未执行状态的用例，选中的用例中包含：${statusNames}`)
        return
      }

      // 确认删除
      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个用例吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const usecaseExecutionIds = this.selectedRows.map(row => row.usecaseExecutionId).filter(id => id)

          if (usecaseExecutionIds.length === 0) {
            this.$message.warning('选中的用例没有有效的执行ID')
            return
          }

          // 批量删除
          let successCount = 0
          let failCount = 0

          for (const usecaseExecutionId of usecaseExecutionIds) {
            try {
              const response = await usecaseExecutionApi.deleteExecution(usecaseExecutionId)
              if (response.code === 20000 || response.code === 200) {
                successCount++
              } else {
                failCount++
              }
            } catch (error) {
              failCount++
            }
          }

          if (successCount > 0) {
            this.$message.success(`成功删除 ${successCount} 个用例`)
            // 清空选中
            this.selectedRows = []
            // 重新加载列表和统计
            await this.loadExecutionList()
            await this.loadStatistics()
          }
          if (failCount > 0) {
            this.$message.warning(`${failCount} 个用例删除失败`)
          }
        } catch (error) {
          console.error('删除用例失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {
        // 用户取消
      })
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

    // 获取执行结果名称（通过字典查找）
    getRunStatusName(runStatus, runStatusName) {
      // 如果后端返回了名称，直接使用
      if (runStatusName) {
        return runStatusName
      }
      // 否则通过字典查找
      if (!runStatus) {
        return '-'
      }
      const item = this.runStatusOptions.find(option => option.dataValue === runStatus)
      return item ? item.dataName : '-'
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
  padding: 5px;
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
#summary {
  ::v-deep .el-card__body {
    padding: 10px 15px !important;
  }
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 3px 0;

  .stat-label {
    font-size: 12px;
    color: #909399;
    line-height: 16px;
    margin-right: 4px;
  }

  .stat-value {
    font-size: 12px;
    font-weight: bold;
    color: #303133;
    line-height: 16px;
  }
  
  .stat-value-tooltip {
    cursor: help;
  }
}

.include-subdirectories-checkbox {
  ::v-deep .el-checkbox__label {
    font-size: 10px !important;
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

  ::v-deep .el-input__suffix {
    line-height: 24px !important;
    top: 0 !important;
  }

  ::v-deep .el-input__suffix-inner {
    line-height: 24px !important;
  }

  ::v-deep .el-input__icon {
    line-height: 24px !important;
    height: 24px !important;
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

  ::v-deep .el-card__header {
    padding: 3px 5px;
  }

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
