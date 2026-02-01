<template>
  <div class="execution-history-container">
    <div class="tab-content" v-loading="loading">
      <el-table
        :data="historyList"
        border
        stripe
        style="width: 100%"
        :empty-text="emptyText"
      >
        <el-table-column prop="runStatus" label="执行状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag
              :type="getStatusTagType(scope.row.runStatus)"
              size="small"
            >
              {{ getRunStatusName(scope.row.runStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="executorName" label="实际执行人" width="150" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.executorName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="executionTime" label="执行时间" width="180" align="center">
          <template slot-scope="scope">
            {{ formatTime(scope.row.executionTime) || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="attachment" label="执行过程附件" min-width="200" align="center">
          <template slot-scope="scope">
            <div v-if="scope.row.attachmentId && scope.row.originalFileName" class="attachment-list">
              <el-link
                type="primary"
                :underline="false"
                @click="handleDownloadAttachment(scope.row)"
                class="attachment-link"
              >
                <i class="el-icon-document"></i>
                {{ scope.row.originalFileName }}
              </el-link>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column prop="remark" label="执行备注" min-width="250" show-overflow-tooltip>
          <template slot-scope="scope">
            <span>{{ scope.row.remark || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态提示 -->
      <div v-if="!loading && historyList.length === 0" class="empty-state">
        <el-empty description="暂无历史执行记录"></el-empty>
      </div>
    </div>
  </div>
</template>

<script>
import usecaseExecutionApi from '@/api/test/usecaseManage/usecaseExecution'
import attachmentApi from '@/api/framework/attachment'
import dictionaryApi from '@/api/framework/dictionary'
import { formatTime } from '@/utils/index'

export default {
  name: 'executionHistory',
  props: {
    // 目录ID
    directoryId: {
      type: [String, Number],
      default: null
    },
    // 用例ID
    usecaseId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      loading: false,
      historyList: [],
      emptyText: '暂无数据',
      // 执行状态字典选项
      runStatusOptions: []
    }
  },
  async mounted() {
    // 加载字典数据
    await this.loadDictionaryData()
    // 组件挂载时加载数据（只在页签激活时才会挂载）
    if (this.directoryId && this.usecaseId) {
      this.loadHistory()
    }
  },
  watch: {
    directoryId(newVal) {
      // 只在组件已挂载且参数变化时重新加载
      if (newVal && this.usecaseId && this.$el) {
        this.loadHistory()
      } else {
        this.historyList = []
      }
    },
    usecaseId(newVal) {
      // 只在组件已挂载且参数变化时重新加载
      if (newVal && this.directoryId && this.$el) {
        this.loadHistory()
      } else {
        this.historyList = []
      }
    }
  },
  methods: {
    // 加载历史执行记录
    async loadHistory() {
      if (!this.directoryId || !this.usecaseId) {
        this.historyList = []
        return
      }

      this.loading = true
      try {
        const response = await usecaseExecutionApi.getExecutionHistory({
          directoryId: this.directoryId,
          usecaseId: this.usecaseId
        })

        if (response.code === 20000 || response.code === 200) {
          // 处理返回的数据
          let list = []
          if (Array.isArray(response.data)) {
            list = response.data
          } else if (response.data && Array.isArray(response.data.rows)) {
            list = response.data.rows
          } else if (response.data && Array.isArray(response.data.list)) {
            list = response.data.list
          }

          // 直接使用后端返回的数据，不需要再加载附件
          this.historyList = list
        } else {
          this.$message.error(response.message || '加载历史执行记录失败')
          this.historyList = []
        }
      } catch (error) {
        console.error('加载历史执行记录失败:', error)
        this.$message.error('加载历史执行记录失败')
        this.historyList = []
      } finally {
        this.loading = false
      }
    },

    // 加载字典数据
    async loadDictionaryData() {
      try {
        const response = await dictionaryApi.getDictionaryList('runStatus')
        this.runStatusOptions = response.data || []
      } catch (error) {
        console.error('加载执行状态字典失败:', error)
        this.runStatusOptions = []
      }
    },

    // 获取执行状态名称
    getRunStatusName(runStatus) {
      if (!runStatus) {
        return '-'
      }
      const item = this.runStatusOptions.find(option => option.dataValue === runStatus)
      return item ? item.dataName : '-'
    },

    // 获取状态标签类型
    getStatusTagType(runStatus) {
      const statusMap = {
        '1': 'success',    // 通过
        '2': 'danger',     // 失败
        '3': 'warning',    // 阻塞
        '4': 'info'        // 不适用
      }
      return statusMap[runStatus] || 'info'
    },

    // 格式化时间
    formatTime(dateTime) {
      return formatTime(dateTime)
    },

    // 下载附件
    async handleDownloadAttachment(row) {
      if (!row.attachmentId) {
        this.$message.warning('附件信息不完整')
        return
      }

      try {
        const response = await attachmentApi.downloadAttachment(row.attachmentId)
        
        // 根据 request.js 的处理逻辑，当 responseType 是 'blob' 时，返回的是整个 response 对象
        // response.data 才是实际的 blob 数据
        let blob = null
        
        if (response instanceof Blob) {
          // 如果直接返回 blob
          blob = response
        } else if (response.data instanceof Blob) {
          // 如果 response.data 是 blob
          blob = response.data
        } else {
          // 如果返回的不是 blob，可能是错误信息
          this.$message.error('下载附件失败：响应数据格式错误')
          return
        }
        
        // 检查 blob 是否可能是错误信息的 JSON（通过检查大小）
        // 如果 blob 很小（小于 500 字节），可能是错误信息
        if (blob.size < 500) {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const text = reader.result
              // 尝试解析为 JSON
              const errorData = JSON.parse(text)
              if (errorData.message || errorData.code) {
                // 确实是错误信息
                this.$message.error(errorData.message || '下载附件失败')
                return
              }
            } catch (e) {
              // 不是 JSON，继续下载
            }
            // 重新创建 blob 并下载
            const blob2 = new Blob([text], { type: blob.type || 'text/plain' })
            this.downloadBlob(blob2, row.originalFileName)
          }
          reader.readAsText(blob)
          return
        }
        
        // 下载 blob
        this.downloadBlob(blob, row.originalFileName)
      } catch (error) {
        console.error('下载附件失败:', error)
        // 如果错误响应是 blob，尝试读取错误信息
        if (error.response && error.response.data instanceof Blob) {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result)
              this.$message.error(errorData.message || '下载附件失败')
            } catch (e) {
              this.$message.error('下载附件失败')
            }
          }
          reader.readAsText(error.response.data)
        } else {
          this.$message.error(error.message || '下载附件失败')
        }
      }
    },

    // 下载 blob 文件
    downloadBlob(blob, fileName) {
      try {
        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName || '附件')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('创建下载链接失败:', error)
        this.$message.error('下载附件失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.execution-history-container {
  padding: 20px;
  background-color: #fff;
}

.tab-content {
  min-height: 200px;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.attachment-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin: 0 4px;

  i {
    font-size: 14px;
  }

  &:hover {
    color: #409eff;
  }
}

.empty-state {
  padding: 40px 0;
}

::v-deep .el-table {
  font-size: 12px;

  .el-table__header {
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
      padding: 10px 0;
    }
  }

  .el-table__body {
    td {
      padding: 10px 0;
    }
  }
}

::v-deep .el-tag {
  font-size: 12px;
  padding: 2px 8px;
}
</style>
