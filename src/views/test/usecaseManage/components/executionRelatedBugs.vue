<template>
  <div class="execution-related-bugs-container">
    <div class="tab-content" v-loading="loading">
      <div class="section-header">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="small"
          @click="handleAddBug"
        >
          新增缺陷
        </el-button>
      </div>
      <el-table
        :data="bugsList"
        border
        stripe
        style="width: 100%"
        :empty-text="emptyText"
      >
        <el-table-column prop="bugId" label="缺陷编号" width="150" show-overflow-tooltip />
        <el-table-column prop="bugName" label="标题" min-width="300" show-overflow-tooltip />
        <el-table-column prop="submitterName" label="提交人" width="120" align="center" />
        <el-table-column prop="developerName" label="责任人" width="120" align="center" />
        <el-table-column prop="bugStateName" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag
              :type="getBugStateTagType(scope.row.bugState)"
              size="small"
            >
              {{ scope.row.bugStateName || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="commitTime" label="提交时间" width="180" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.commitTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="bugSeverityLevelName" label="严重级别" width="100" align="center">
          <template slot-scope="scope">
            <el-tag
              :type="getSeverityLevelTagType(scope.row.bugSeverityLevel)"
              size="small"
            >
              {{ scope.row.bugSeverityLevelName || '-' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态提示 -->
      <div v-if="!loading && bugsList.length === 0" class="empty-state">
        <el-empty description="暂无关联缺陷"></el-empty>
      </div>

      <!-- 分页 -->
      <div class="pagination-container" v-if="bugsList.length > 0">
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
</template>

<script>
import dictionaryApi from '@/api/framework/dictionary'
import bugManageApi from '@/api/test/bugManage/bugManage'
import { formatTime } from '@/utils/index'

export default {
  name: 'executionRelatedBugs',
  props: {
    // 用例执行ID
    usecaseExecutionId: {
      type: [String, Number],
      default: null
    },
    // 用例ID
    usecaseId: {
      type: [String, Number],
      default: null
    },
    // 目录ID
    directoryId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      loading: false,
      bugsList: [],
      emptyText: '暂无数据',
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      // 数据字典选项
      bugStateOptions: [],
      bugSeverityLevelOptions: []
    }
  },
  created() {
    this.loadDictionaryData()
  },
  mounted() {
    if (this.usecaseId && this.directoryId && this.$el) {
      this.loadDefects()
    }
  },
  watch: {
    usecaseId(newVal) {
      if (newVal && this.directoryId && this.$el) {
        this.pagination.currentPage = 1
        this.loadDefects()
      } else {
        this.bugsList = []
        this.pagination.total = 0
      }
    },
    directoryId(newVal) {
      if (newVal && this.usecaseId && this.$el) {
        this.pagination.currentPage = 1
        this.loadDefects()
      } else {
        this.bugsList = []
        this.pagination.total = 0
      }
    }
  },
  methods: {
    // 加载数据字典
    async loadDictionaryData() {
      try {
        const [bugStateRes, bugSeverityLevelRes] = await Promise.all([
          dictionaryApi.getDictionaryList('bugState'),
          dictionaryApi.getDictionaryList('bugSeverityLevel')
        ])
        this.bugStateOptions = bugStateRes.data || []
        this.bugSeverityLevelOptions = bugSeverityLevelRes.data || []
      } catch (error) {
        console.error('加载数据字典失败:', error)
      }
    },

    // 加载关联的缺陷
    async loadDefects() {
      if (!this.usecaseId || !this.directoryId) {
        this.bugsList = []
        this.pagination.total = 0
        return
      }

      this.loading = true
      try {
        const response = await bugManageApi.getRelatedBugs({
          usecaseId: this.usecaseId,
          directoryId: this.directoryId,
          currentPage: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        })

        if (response.code === 20000 || response.code === 200) {
          const data = response.data || {}
          let list = []
          if (Array.isArray(data)) {
            list = data
          } else if (Array.isArray(data.records)) {
            list = data.records
          } else if (Array.isArray(data.rows)) {
            list = data.rows
          } else if (Array.isArray(data.list)) {
            list = data.list
          }
          this.bugsList = list
          this.pagination.total = data.total || list.length || 0
        } else {
          this.$message.error(response.message || '加载关联缺陷失败')
          this.bugsList = []
          this.pagination.total = 0
        }
      } catch (error) {
        console.error('加载关联缺陷失败:', error)
        this.$message.error('加载关联缺陷失败')
        this.bugsList = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
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
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.loadDefects()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadDefects()
    },

    // 新增缺陷
    handleAddBug() {
      const query = {
        mode: 'create',
        fromExecution: 'true'
      }
      if (this.usecaseId) {
        query.usecaseId = this.usecaseId
      }
      if (this.directoryId) {
        query.directoryId = this.directoryId
      }
      this.$router.push({
        name: 'bugDetail',
        query
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.execution-related-bugs-container {
  padding: 20px;
}

.tab-content {
  min-height: 200px;
}

.section-header {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.pagination-container {
  margin-top: 16px;
  text-align: right;
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
