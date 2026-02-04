<template>
  <div class="bug-history-container">
    <el-table
      :data="historyList"
      border
      stripe
      style="width: 100%"
      v-loading="historyLoading"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="operatorName" label="操作人" width="120" />
      <el-table-column prop="operatingTime" label="操作时间" width="180">
        <template slot-scope="scope">
          {{ formatDateTime(scope.row.operatingTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="oldStateName" label="旧状态" width="100" align="center" />
      <el-table-column prop="newStateName" label="新状态" width="100" align="center" />
      <el-table-column prop="comment" label="备注" min-width="300" />
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @size-change="handleHistorySizeChange"
        @current-change="handleHistoryCurrentChange"
        :current-page="historyPagination.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="historyPagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="historyPagination.total"
      />
    </div>
  </div>
</template>

<script>
import bugManageApi from '@/api/test/bugManage/bugManage'
import { formatTime } from '@/utils/index'

export default {
  name: 'bugHistory',
  props: {
    bugId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      historyLoading: false,
      historyList: [],
      historyPagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      }
    }
  },
  watch: {
    bugId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadBugHistory()
        } else {
          this.historyList = []
          this.historyPagination.total = 0
        }
      }
    }
  },
  methods: {
    // 加载历史记录
    async loadBugHistory() {
      if (!this.bugId) return
      this.historyLoading = true
      try {
        const response = await bugManageApi.getBugHistory(this.bugId, {
          currentPage: this.historyPagination.currentPage,
          pageSize: this.historyPagination.pageSize
        })
        if (response.code === 20000 && response.data) {
          const data = response.data
          this.historyList = data.records || data.rows || data.list || []
          this.historyPagination.total = data.total || 0
        }
      } catch (error) {
        console.error('加载历史记录失败:', error)
      } finally {
        this.historyLoading = false
      }
    },

    // 历史记录分页
    handleHistorySizeChange(val) {
      this.historyPagination.pageSize = val
      this.historyPagination.currentPage = 1
      this.loadBugHistory()
    },

    handleHistoryCurrentChange(val) {
      this.historyPagination.currentPage = val
      this.loadBugHistory()
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      return formatTime(dateTime) || '-'
    }
  }
}
</script>

<style lang="scss" scoped>
.bug-history-container {
  padding: 20px;
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
      padding: 4px 0 !important;
    }
  }

  .el-table__body {
    td {
      padding: 4px 0 !important;
    }
    
    tr {
      height: 32px !important;
    }
  }
}
</style>
