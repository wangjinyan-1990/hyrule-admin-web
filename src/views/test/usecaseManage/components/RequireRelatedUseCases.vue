<template>
  <div>
    <div class="relation-content">
      <div class="relation-header">
        <el-button
          v-if="mode !== 'view'"
          size="small"
          @click="handleSelectAll"
        >
          {{ isAllSelected ? '取消全选' : '全选' }}
        </el-button>
        <el-button
          type="danger"
          size="small"
          icon="el-icon-delete"
          @click="handleBatchRemove"
          style="margin-left: 10px;"
        >
          移除用例
          <span v-if="selectedTestCases && selectedTestCases.length > 0">
            ({{ selectedTestCases.length }})
          </span>
        </el-button>
        <el-button
          type="primary"
          size="small"
          icon="el-icon-plus"
          @click="handleAdd"
          style="margin-left: 10px;"
        >
          添加用例
        </el-button>
      </div>

    <el-table
      ref="testCasesTable"
      :data="testCasesList"
      border
      stripe
      style="width: 100%; margin-top: 10px;"
      max-height="150"
      class="related-test-cases-table"
      @selection-change="handleSelectionChange"
      @row-dblclick="handleRowDblClick"
      :row-key="getRowKey"
    >
        <el-table-column
          type="selection"
          width="35"
          align="center"
        />
        <el-table-column prop="usecaseId" label="用例ID" width="120" />
        <el-table-column prop="usecaseName" label="用例名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="usecaseTypeName" label="用例类型" width="100" />
        <el-table-column prop="prorityName" label="优先级" width="80" />
      </el-table>

      <div v-if="testCasesList.length === 0" class="empty-tip">
        暂无关联用例
      </div>
    </div>

    <!-- 用例选择器 -->
    <usecase-selector
      :visible.sync="selectorVisible"
      :selected-usecase-ids="existingUsecaseIds"
      @confirm="handleUsecaseConfirm"
    />
  </div>
</template>

<script>
import usecaseRequireLinkApi from '@/api/test/usecaseManage/usecaseRequireLink'
import UsecaseSelector from './UsecaseSelector.vue'

export default {
  name: 'RequireRelatedUseCases',
  components: {
    UsecaseSelector
  },
  props: {
    requirePointId: {
      type: [String, Number],
      default: null
    },
    mode: {
      type: String,
      default: 'view'
    }
  },
  data() {
    return {
      testCasesList: [],
      selectedTestCases: [],
      selectorVisible: false
    }
  },
  computed: {
    isAllSelected() {
      return this.testCasesList.length > 0 &&
             this.selectedTestCases.length === this.testCasesList.length
    },
    // 已存在的用例ID列表（用于选择器中排除已关联的用例）
    existingUsecaseIds() {
      return this.testCasesList.map(item => item.usecaseId)
    }
  },
  watch: {
    requirePointId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadTestCases()
        }
      }
    }
  },
  methods: {
    // 加载关联用例
    async loadTestCases() {
      if (!this.requirePointId) {
        return
      }
      try {
        const response = await usecaseRequireLinkApi.getRequirePointTestCases(this.requirePointId)
        if (response.code === 20000 && response.data) {
          if (Array.isArray(response.data)) {
            this.testCasesList = response.data
          } else if (response.data.rows) {
            this.testCasesList = response.data.rows
          } else {
            this.testCasesList = []
          }
        } else {
          this.testCasesList = []
        }
      } catch (error) {
        console.error('加载关联用例失败:', error)
        this.testCasesList = []
      }
    },

    // 获取行的唯一key
    getRowKey(row) {
      return row.usecaseId || row.id || Math.random()
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      this.selectedTestCases = selection || []
    },

    // 全选/取消全选
    handleSelectAll() {
      if (this.mode === 'view') {
        this.$message.warning('查看模式下不能操作，请先切换到编辑模式')
        return
      }
      if (this.isAllSelected) {
        this.$refs.testCasesTable.clearSelection()
      } else {
        this.$refs.testCasesTable.toggleAllSelection()
      }
    },

    // 批量移除
    async handleBatchRemove() {
      if (this.mode === 'view') {
        this.$message.warning('查看模式下不能移除用例，请先切换到编辑模式')
        return
      }
      if (!this.selectedTestCases || this.selectedTestCases.length === 0) {
        this.$message.warning('请先选择要移除的用例')
        return
      }

      this.$confirm(`确定要移除选中的 ${this.selectedTestCases.length} 个关联用例吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        if (!this.requirePointId) {
          this.$message.error('缺少必要参数')
          return
        }
        try {
          const usecaseIds = this.selectedTestCases.map(item => item.usecaseId)
          const response = await usecaseRequireLinkApi.unlinkTestCasesFromRequirePoint(
            this.requirePointId,
            usecaseIds
          )
          if (response.code === 20000) {
            this.testCasesList = this.testCasesList.filter(
              item => !usecaseIds.includes(item.usecaseId)
            )
            this.selectedTestCases = []
            this.$message.success('移除成功')
            this.$emit('removed')
          } else {
            this.$message.error(response.message || '移除失败')
          }
        } catch (error) {
          console.error('移除关联用例失败:', error)
          this.$message.error('移除失败')
        }
      }).catch(() => {
        // 用户取消
      })
    },

    // 添加用例
    handleAdd() {
      if (this.mode === 'view') {
        this.$message.warning('查看模式下不能添加用例，请先切换到编辑模式')
        return
      }
      if (!this.requirePointId) {
        this.$message.warning('请先保存需求点')
        return
      }
      this.selectorVisible = true
    },

    // 双击用例行跳转到用例详情页
    handleRowDblClick(row) {
      if (!row || !row.usecaseId) {
        return
      }
      // 跳转到用例详情页
      this.$router.push({
        path: '/test/usecaseManage/usecaseDetail',
        query: {
          id: row.usecaseId,
          mode: 'view'
        }
      })
    },

    // 处理用例选择确认
    async handleUsecaseConfirm(selectedUsecases) {
      if (!selectedUsecases || selectedUsecases.length === 0) {
        return
      }
      if (!this.requirePointId) {
        this.$message.error('缺少必要参数')
        return
      }

      try {
        // 过滤掉已经关联的用例
        const newUsecases = selectedUsecases.filter(
          item => !this.existingUsecaseIds.includes(item.usecaseId)
        )

        if (newUsecases.length === 0) {
          this.$message.warning('所选用例已全部关联')
          return
        }

        const usecaseIds = newUsecases.map(item => item.usecaseId)
        const response = await usecaseRequireLinkApi.linkTestCasesToRequirePoint(
          this.requirePointId,
          usecaseIds
        )

        if (response.code === 20000) {
          this.$message.success(`成功关联 ${newUsecases.length} 个用例`)
          // 重新加载用例列表
          await this.loadTestCases()
          this.$emit('removed')
        } else {
          this.$message.error(response.message || '关联失败')
        }
      } catch (error) {
        console.error('关联用例失败:', error)
        this.$message.error('关联失败')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.relation-content {
  padding: 10px 0;
  pointer-events: auto !important;
}

.relation-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
  pointer-events: auto !important;

  .el-button {
    pointer-events: auto !important;
    cursor: pointer !important;
  }
}

.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

// 关联用例表格样式
.related-test-cases-table {
  pointer-events: auto !important;

  ::v-deep {
    pointer-events: auto !important;
    font-size: 12px;

    .el-table__body-wrapper {
      pointer-events: auto !important;

      .el-table__body {
        pointer-events: auto !important;

        tr {
          height: 32px !important;
          min-height: 32px !important;
          max-height: 32px !important;
          pointer-events: auto !important;

          td {
            padding: 4px 0 !important;
            height: 32px !important;
            line-height: 24px !important;
            pointer-events: auto !important;

            .cell {
              padding: 0 8px !important;
              line-height: 24px !important;
              pointer-events: auto !important;
            }

            .el-checkbox {
              pointer-events: auto !important;
              cursor: pointer !important;
              user-select: none !important;

              .el-checkbox__input {
                pointer-events: auto !important;
                cursor: pointer !important;

                .el-checkbox__inner {
                  pointer-events: auto !important;
                  cursor: pointer !important;
                  width: 14px !important;
                  height: 14px !important;
                }
              }
            }
          }
        }
      }
    }

    .el-table__header-wrapper {
      pointer-events: auto !important;

      .el-table__header {
        pointer-events: auto !important;

        th {
          padding: 4px 0 !important;
          height: 32px !important;
          line-height: 24px !important;
          pointer-events: auto !important;
          font-size: 12px;

          .cell {
            padding: 0 8px !important;
            line-height: 24px !important;
            pointer-events: auto !important;
          }

          .el-checkbox {
            pointer-events: auto !important;
            cursor: pointer !important;

            .el-checkbox__input {
              pointer-events: auto !important;
              cursor: pointer !important;

              .el-checkbox__inner {
                pointer-events: auto !important;
                cursor: pointer !important;
              }
            }
          }
        }
      }
    }
  }
}
</style>

