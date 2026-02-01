<template>
  <div class="bug-list-container">
    <!-- 左侧查询条件面板 -->
    <div class="left-panel">
      <div class="panel-header">
        <h3>查询条件</h3>
      </div>
      <div class="query-content">
        <el-form :model="searchForm" label-width="100px" size="small" class="query-form">
          <!-- 查询条件下拉框 -->
          <el-form-item label="查询条件">
            <el-select v-model="searchForm.queryType" placeholder="请选择" clearable style="width: 100%">
              <el-option label="和我相关的活动缺陷" value="myActiveBugs" />
              <el-option label="全部缺陷" value="allBugs" />
            </el-select>
          </el-form-item>

          <!-- 所属条线 -->
          <el-form-item label="所属条线">
            <el-input v-model="searchForm.line" placeholder="请输入所属条线" clearable />
          </el-form-item>

          <!-- 所属系统 -->
          <el-form-item label="所属系统">
            <el-select v-model="searchForm.systemId" placeholder="请选择所属系统" clearable filterable style="width: 100%">
              <el-option
                v-for="system in systemOptions"
                :key="system.systemId"
                :label="system.systemName"
                :value="system.systemId"
              />
            </el-select>
          </el-form-item>

          <!-- 工作包编号 -->
          <el-form-item label="工作包编号">
            <el-input v-model="searchForm.workPackageId" placeholder="请输入工作包编号" clearable />
          </el-form-item>

          <!-- 测试任务 -->
          <el-form-item label="测试任务">
            <el-input v-model="searchForm.testTask" placeholder="请输入测试任务" clearable />
          </el-form-item>

          <!-- 测试阶段 -->
          <el-form-item label="测试阶段">
            <el-input v-model="searchForm.testPhase" placeholder="请输入测试阶段" clearable />
          </el-form-item>

          <!-- 测试类型 -->
          <el-form-item label="测试类型">
            <el-input v-model="searchForm.testType" placeholder="请输入测试类型" clearable />
          </el-form-item>

          <!-- 轮次号 -->
          <el-form-item label="轮次号">
            <el-input v-model="searchForm.roundNumber" placeholder="请输入轮次号" clearable />
          </el-form-item>

          <!-- 状态 -->
          <el-form-item label="状态">
            <el-select v-model="searchForm.bugState" placeholder="请选择状态" clearable style="width: 100%">
              <el-option
                v-for="item in bugStateOptions"
                :key="item.dataValue"
                :label="item.dataName"
                :value="item.dataValue"
              />
            </el-select>
          </el-form-item>

          <!-- 编号 -->
          <el-form-item label="编号">
            <el-input v-model="searchForm.bugId" placeholder="请输入编号" clearable />
          </el-form-item>

          <!-- 标题 -->
          <el-form-item label="标题">
            <el-input v-model="searchForm.bugName" placeholder="请输入标题" clearable />
          </el-form-item>

          <!-- 提交人 -->
          <el-form-item label="提交人">
            <el-input v-model="searchForm.submitterName" placeholder="请输入提交人" clearable />
          </el-form-item>

          <!-- 验证人 -->
          <el-form-item label="验证人">
            <el-input v-model="searchForm.checkerName" placeholder="请输入验证人" clearable />
          </el-form-item>

          <!-- 提交时间(起) -->
          <el-form-item label="提交时间(起)">
            <el-date-picker
              v-model="searchForm.commitTimeStart"
              type="datetime"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>

          <!-- 提交时间(止) -->
          <el-form-item label="提交时间(止)">
            <el-date-picker
              v-model="searchForm.commitTimeEnd"
              type="datetime"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>

          <!-- 责任人 -->
          <el-form-item label="责任人">
            <el-input v-model="searchForm.developerName" placeholder="请输入责任人" clearable />
          </el-form-item>

          <!-- 关闭时间(起) -->
          <el-form-item label="关闭时间(起)">
            <el-date-picker
              v-model="searchForm.closeTimeStart"
              type="datetime"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>

          <!-- 关闭时间(止) -->
          <el-form-item label="关闭时间(止)">
            <el-date-picker
              v-model="searchForm.closeTimeEnd"
              type="datetime"
              placeholder="选择日期时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>

          <!-- 缺陷所在模块 -->
          <el-form-item label="缺陷所在模块">
            <el-input v-model="searchForm.bugModule" placeholder="请输入缺陷所在模块" clearable>
              <el-button slot="append" icon="el-icon-more" @click="handleSelectModule"></el-button>
            </el-input>
          </el-form-item>

          <!-- 缺陷类型 -->
          <el-form-item label="缺陷类型">
            <el-select v-model="searchForm.bugType" placeholder="请选择缺陷类型" clearable style="width: 100%">
              <el-option label="全部" value="" />
              <el-option
                v-for="item in bugTypeOptions"
                :key="item.dataValue"
                :label="item.dataName"
                :value="item.dataValue"
              />
            </el-select>
          </el-form-item>

          <!-- 严重级别 -->
          <el-form-item label="严重级别">
            <el-select v-model="searchForm.bugSeverityLevel" placeholder="请选择严重级别" clearable style="width: 100%">
              <el-option
                v-for="item in bugSeverityLevelOptions"
                :key="item.dataValue"
                :label="item.dataName"
                :value="item.dataValue"
              />
            </el-select>
          </el-form-item>

          <!-- 缺陷来源 -->
          <el-form-item label="缺陷来源">
            <el-select v-model="searchForm.bugSource" placeholder="请选择缺陷来源" clearable style="width: 100%">
              <el-option
                v-for="item in bugSourceOptions"
                :key="item.dataValue"
                :label="item.dataName"
                :value="item.dataValue"
              />
            </el-select>
          </el-form-item>

          <!-- 查询和重置按钮 -->
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="handleSearch" class="query-button">查询</el-button>
            <el-button icon="el-icon-refresh" @click="handleReset" class="query-button" style="margin-left: 8px;">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 右侧缺陷列表 -->
    <div class="right-panel">
      <div class="panel-header">
        <h3>缺陷列表</h3>
      </div>
      <div class="table-content">
        <el-table
          :data="tableData"
          v-loading="loading"
          border
          stripe
          style="width: 100%"
          @row-dblclick="handleRowDblClick"
          height="calc(100vh - 200px)"
        >
          <el-table-column prop="bugId" label="编号" width="150" show-overflow-tooltip />
          <el-table-column prop="bugName" label="标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="bugStateName" label="状态" width="100" align="center">
            <template slot-scope="scope">
              <el-tag :type="getBugStateTagType(scope.row.bugState)" size="small">
                {{ scope.row.bugStateName || '-' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="systemName" label="所属系统" width="150" show-overflow-tooltip />
          <el-table-column prop="submitterName" label="提交人" width="100" />
          <el-table-column prop="devLeaderName" label="开发组长" width="100" />
          <el-table-column prop="developerName" label="责任人" width="100" />
          <el-table-column prop="checkerName" label="验证人" width="100" />
          <el-table-column prop="usecaseModule" label="用例模块" width="150" show-overflow-tooltip />
          <el-table-column prop="directoryName" label="测试集目录" width="150" show-overflow-tooltip />
          <el-table-column prop="bugSeverityLevelName" label="严重级别" width="100" align="center">
            <template slot-scope="scope">
              <el-tag :type="getSeverityLevelTagType(scope.row.bugSeverityLevel)" size="small">
                {{ scope.row.bugSeverityLevelName || '-' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="bugSourceName" label="缺陷来源" width="120" />
          <el-table-column prop="commitTime" label="提交时间" width="160">
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.commitTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="resolvedTime" label="解决时间" width="160">
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.resolvedTime) }}
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.currentPage"
            :page-sizes="[10, 15, 20, 50, 100]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import bugManageApi from '@/api/test/bugManage/bugManage'
import dictionaryApi from '@/api/framework/dictionary'
import testSystemApi from '@/api/test/baseManage/testSystem'
import { formatTime } from '@/utils/index'

export default {
  name: 'bugList',
  data() {
    return {
      loading: false,
      tableData: [],
      searchForm: {
        queryType: 'myActiveBugs', // 默认查询条件
        line: '',
        systemId: '',
        workPackageId: '',
        testTask: '',
        testPhase: '',
        testType: '',
        roundNumber: '',
        bugState: '',
        bugId: '',
        bugName: '',
        submitterName: '',
        checkerName: '',
        commitTimeStart: '',
        commitTimeEnd: '',
        developerName: '',
        closeTimeStart: '',
        closeTimeEnd: '',
        bugModule: '',
        bugType: '',
        bugSeverityLevel: '',
        bugSource: '',
        directoryId: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 15,
        total: 0
      },
      // 系统选项
      systemOptions: [],
      // 字典选项
      bugStateOptions: [],
      bugTypeOptions: [],
      bugSeverityLevelOptions: [],
      bugSourceOptions: []
    }
  },
  async created() {
    await this.loadDictionaryData()
    await this.loadSystemOptions()
  },
  methods: {
    // 加载数据字典
    async loadDictionaryData() {
      try {
        const [bugStateRes, bugTypeRes, bugSeverityLevelRes, bugSourceRes] = await Promise.all([
          dictionaryApi.getDictionaryList('bugState'),
          dictionaryApi.getDictionaryList('bugType'),
          dictionaryApi.getDictionaryList('bugSeverityLevel'),
          dictionaryApi.getDictionaryList('bugSource')
        ])
        this.bugStateOptions = bugStateRes.data || []
        this.bugTypeOptions = bugTypeRes.data || []
        this.bugSeverityLevelOptions = bugSeverityLevelRes.data || []
        this.bugSourceOptions = bugSourceRes.data || []
      } catch (error) {
        console.error('加载数据字典失败:', error)
        this.$message.error('加载数据字典失败')
      }
    },

    // 加载系统选项
    async loadSystemOptions() {
      try {
        const response = await testSystemApi.getTestSystemList({ pageNo: 1, pageSize: 1000 })
        if (response.code === 20000 && response.data?.rows) {
          this.systemOptions = response.data.rows
        } else if (Array.isArray(response.data)) {
          this.systemOptions = response.data
        }
      } catch (error) {
        console.error('加载系统列表失败:', error)
      }
    },

    // 查询
    async handleSearch() {
      this.pagination.currentPage = 1
      await this.loadBugList()
    },

    // 重置
    handleReset() {
      this.searchForm = {
        queryType: 'myActiveBugs',
        line: '',
        systemId: '',
        workPackageId: '',
        testTask: '',
        testPhase: '',
        testType: '',
        roundNumber: '',
        bugState: '',
        bugId: '',
        bugName: '',
        submitterName: '',
        checkerName: '',
        commitTimeStart: '',
        commitTimeEnd: '',
        developerName: '',
        closeTimeStart: '',
        closeTimeEnd: '',
        bugModule: '',
        bugType: '',
        bugSeverityLevel: '',
        bugSource: '',
        directoryId: ''
      }
      this.pagination.currentPage = 1
      this.tableData = []
      this.pagination.total = 0
    },

    // 加载缺陷列表
    async loadBugList() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          currentPage: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }

        const response = await bugManageApi.getBugList(params)
        if (response.code === 20000 || response.code === 200) {
          const data = response.data || {}
          this.tableData = data.records || data.rows || data.list || []
          this.pagination.total = data.total || 0
        } else {
          this.$message.error(response.message || '加载缺陷列表失败')
          this.tableData = []
          this.pagination.total = 0
        }
      } catch (error) {
        console.error('加载缺陷列表失败:', error)
        this.$message.error('加载缺陷列表失败')
        this.tableData = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },

    // 双击行
    handleRowDblClick(row) {
      this.$router.push({
        path: '/test/bugManage/bugDetail',
        query: {
          id: row.bugId,
          mode: 'view'
        }
      })
    },

    // 选择模块
    handleSelectModule() {
      this.$message.info('选择模块功能开发中')
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.loadBugList()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadBugList()
    },

    // 获取缺陷状态标签类型
    getBugStateTagType(bugState) {
      const statusMap = {
        '新建': 'info',
        '已分配': 'warning',
        '已解决': 'success',
        '已关闭': '',
        '重新提交': 'danger'
      }
      return statusMap[bugState] || 'info'
    },

    // 获取严重级别标签类型
    getSeverityLevelTagType(level) {
      const levelMap = {
        '1': 'danger',   // 严重
        '2': 'warning',  // 一般
        '3': 'info'      // 轻微
      }
      return levelMap[level] || 'info'
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      return formatTime(dateTime) || '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.bug-list-container {
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
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #fafafa;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.query-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.query-form {
  .el-form-item {
    margin-bottom: 12px;
  }

  ::v-deep .el-form-item__label {
    font-size: 12px !important;
    color: #606266;
    line-height: 1.5;
  }

  .el-input,
  .el-select {
    font-size: 12px;
  }

  // 查询和重置按钮样式
  .query-button {
    font-size: 10px !important;
    padding: 4px 8px !important;
    height: 22px !important;
    line-height: 1 !important;
    width: auto !important;
    min-width: 60px !important;
  }

  .el-button {
    font-size: 10px !important;
    padding: 4px 8px !important;
    height: 22px !important;
    line-height: 1 !important;
  }

  .el-button--primary {
    font-size: 10px !important;
    padding: 4px 8px !important;
    height: 22px !important;
  }
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  margin: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
}

.pagination-container {
  padding: 16px 0;
  text-align: right;
  border-top: 1px solid #e4e7ed;
}

::v-deep .el-table {
  font-size: 12px;

  .el-table__header {
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
      padding: 8px 0;
    }
  }

  .el-table__body {
    td {
      padding: 8px 0;
    }
  }
}

::v-deep .el-tag {
  font-size: 12px;
  padding: 2px 8px;
}
</style>
