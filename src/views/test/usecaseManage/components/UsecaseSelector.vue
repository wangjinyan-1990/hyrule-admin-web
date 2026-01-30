<template>
  <el-dialog
    title="选择用例"
    :visible.sync="dialogVisible"
    width="1200px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="usecase-selector-container">
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
        <el-card class="search-card">
          <el-row :gutter="10">
            <el-col :span="6">
              <el-input
                v-model="searchForm.usecaseName"
                placeholder="用例名称"
                size="small"
                clearable
              />
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="searchForm.usecaseType"
                placeholder="用例类型"
                size="small"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in usecaseTypeOptions"
                  :key="item.dataValue"
                  :label="item.dataName"
                  :value="item.dataValue"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select
                v-model="searchForm.testPoint"
                placeholder="测试要点"
                size="small"
                clearable
                style="width: 100%"
              >
                <el-option
                  v-for="item in testPointOptions"
                  :key="item.dataValue"
                  :label="item.dataName"
                  :value="item.dataValue"
                />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button
                type="primary"
                size="small"
                icon="el-icon-search"
                @click="handleSearch"
              >
                查询
              </el-button>
              <el-button
                size="small"
                icon="el-icon-refresh"
                @click="handleReset"
              >
                重置
              </el-button>
            </el-col>
          </el-row>
        </el-card>

        <!-- 用例列表 -->
        <el-card class="table-card">
          <div class="table-header">
            <span>已选择：{{ selectedUsecases.length }} 个用例</span>
            <el-button
              size="small"
              @click="handleSelectAll"
            >
              {{ isAllSelected ? '取消全选' : '全选' }}
            </el-button>
          </div>
          <el-table
            ref="usecaseTable"
            :data="tableData"
            border
            stripe
            style="width: 100%"
            max-height="350"
            class="usecase-selector-table"
            @selection-change="handleSelectionChange"
            @row-dblclick="handleRowDblClick"
            :row-key="getRowKey"
            v-loading="loading"
          >
            <el-table-column
              type="selection"
              width="55"
              align="center"
              :reserve-selection="true"
            />
            <el-table-column prop="usecaseId" label="用例ID" width="120" show-overflow-tooltip />
            <el-table-column prop="usecaseName" label="用例名称" min-width="200" show-overflow-tooltip />
            <el-table-column prop="usecaseTypeName" label="用例类型" width="120" />
            <el-table-column prop="testPointName" label="测试要点" width="120" />
            <el-table-column prop="prorityName" label="优先级" width="100" />
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
              small
            />
          </div>
        </el-card>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import DirectoryTreeSelect from '@/views/test/baseManage/components/DirectoryTreeSelect'
import usecaseApi from '@/api/test/usecaseManage/usecaseRepository'
import dictionaryApi from '@/api/framework/dictionary'

export default {
  name: 'UsecaseSelector',
  components: {
    DirectoryTreeSelect
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    selectedUsecaseIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      selectedDirectory: null,
      searchForm: {
        usecaseName: '',
        usecaseType: '',
        testPoint: '',
        directoryId: '',
        systemId: ''
      },
      tableData: [],
      selectedUsecases: [],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      usecaseTypeOptions: [],
      testPointOptions: []
    }
  },
  computed: {
    isAllSelected() {
      return this.tableData.length > 0 &&
             this.selectedUsecases.length === this.tableData.length
    }
  },
  watch: {
    visible(newVal) {
      this.dialogVisible = newVal
      if (newVal) {
        this.initData()
      }
    },
    dialogVisible(newVal) {
      if (!newVal) {
        this.$emit('update:visible', false)
      }
    },
    selectedUsecaseIds: {
      immediate: true,
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.$nextTick(() => {
            this.setInitialSelection()
          })
        }
      }
    }
  },
  created() {
    this.loadDictionaryData()
  },
  methods: {
    // 初始化数据
    initData() {
      this.selectedUsecases = []
      this.tableData = []
      this.searchForm = {
        usecaseName: '',
        usecaseType: '',
        testPoint: '',
        directoryId: '',
        systemId: ''
      }
      this.pagination.currentPage = 1
      this.selectedDirectory = null
    },

    // 加载字典数据
    async loadDictionaryData() {
      try {
        const [usecaseTypeRes, testPointRes] = await Promise.all([
          dictionaryApi.getDictionaryList('usecaseType'),
          dictionaryApi.getDictionaryList('testPoint')
        ])
        this.usecaseTypeOptions = usecaseTypeRes.data || []
        this.testPointOptions = testPointRes.data || []
      } catch (error) {
        console.error('加载字典数据失败:', error)
      }
    },

    // 目录选择处理
    handleNodeSelect(node) {
      if (!node) {
        return
      }
      this.selectedDirectory = node
      const directoryId = node.directoryId || node.id
      const systemId = node.systemId || ''
      this.searchForm.directoryId = directoryId
      this.searchForm.systemId = systemId
      this.pagination.currentPage = 1
      this.loadUsecaseList()
    },

    // 查询
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadUsecaseList()
    },

    // 重置
    handleReset() {
      this.searchForm.usecaseName = ''
      this.searchForm.usecaseType = ''
      this.searchForm.testPoint = ''
      this.pagination.currentPage = 1
      this.loadUsecaseList()
    },

    // 加载用例列表
    async loadUsecaseList() {
      if (!this.searchForm.directoryId) {
        this.tableData = []
        this.pagination.total = 0
        return
      }

      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          currentPage: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }

        const response = await usecaseApi.getUsecaseList(params)

        if (response.code === 20000 || response.code === 200) {
          this.tableData = response.data?.records || response.data?.rows || []
          this.pagination.total = response.data?.total || 0
        } else {
          this.tableData = []
          this.pagination.total = 0
        }

        // 恢复选中状态
        this.$nextTick(() => {
          this.restoreSelection()
        })
      } catch (error) {
        console.error('加载用例列表失败:', error)
        this.tableData = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },

    // 获取行的唯一key
    getRowKey(row) {
      return row.usecaseId || row.id || Math.random()
    },

    // 处理选择变化
    handleSelectionChange(selection) {
      // 合并当前页选中的用例和之前选中的用例
      const currentPageIds = this.tableData.map(item => item.usecaseId)
      // 移除当前页的用例
      this.selectedUsecases = this.selectedUsecases.filter(
        item => !currentPageIds.includes(item.usecaseId)
      )
      // 添加新选中的用例
      this.selectedUsecases = [...this.selectedUsecases, ...selection]
    },

    // 恢复选中状态
    restoreSelection() {
      if (!this.$refs.usecaseTable) {
        return
      }
      this.$refs.usecaseTable.clearSelection()
      this.tableData.forEach(row => {
        const isSelected = this.selectedUsecases.some(
          item => item.usecaseId === row.usecaseId
        )
        if (isSelected) {
          this.$refs.usecaseTable.toggleRowSelection(row, true)
        }
      })
    },

    // 设置初始选中状态
    setInitialSelection() {
      if (!this.$refs.usecaseTable || !this.selectedUsecaseIds || this.selectedUsecaseIds.length === 0) {
        return
      }
      this.tableData.forEach(row => {
        if (this.selectedUsecaseIds.includes(row.usecaseId)) {
          const exists = this.selectedUsecases.some(item => item.usecaseId === row.usecaseId)
          if (!exists) {
            this.selectedUsecases.push(row)
          }
          this.$refs.usecaseTable.toggleRowSelection(row, true)
        }
      })
    },

    // 全选/取消全选
    handleSelectAll() {
      if (this.isAllSelected) {
        // 取消全选当前页
        const currentPageIds = this.tableData.map(item => item.usecaseId)
        this.selectedUsecases = this.selectedUsecases.filter(
          item => !currentPageIds.includes(item.usecaseId)
        )
        this.$refs.usecaseTable.clearSelection()
      } else {
        // 全选当前页
        this.tableData.forEach(row => {
          const exists = this.selectedUsecases.some(item => item.usecaseId === row.usecaseId)
          if (!exists) {
            this.selectedUsecases.push(row)
          }
          this.$refs.usecaseTable.toggleRowSelection(row, true)
        })
      }
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

    // 确认选择
    handleConfirm() {
      this.$emit('confirm', this.selectedUsecases)
      this.handleClose()
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      this.$emit('update:visible', false)
    },

    // 双击用例行跳转到用例详情页
    handleRowDblClick(row) {
      if (!row || !row.usecaseId) {
        return
      }
      // 关闭对话框
      this.dialogVisible = false
      this.$emit('update:visible', false)
      // 使用 nextTick 确保对话框关闭后再跳转
      this.$nextTick(() => {
        this.$router.push({
          path: '/test/usecaseManage/usecaseDetail',
          query: {
            id: row.usecaseId,
            mode: 'view'
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.usecase-selector-container {
  display: flex;
  height: 600px;
  gap: 10px;
}

.left-panel {
  width: 300px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  background: white;
}

.panel-header {
  padding: 10px;
  border-bottom: 1px solid #dcdfe6;
  background: #f5f7fa;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }
}

.tree-container {
  flex: 1;
  overflow: auto;
  padding: 10px;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-card {
  ::v-deep .el-card__body {
    padding: 15px;
  }
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;

  ::v-deep .el-card__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 15px;
  }
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.pagination-container {
  margin-top: 15px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}

// 表格样式
.usecase-selector-table {
  font-size: 12px;

  ::v-deep {
    th {
      font-size: 12px;
      padding: 4px 0 !important;
      height: 32px !important;
      line-height: 24px !important;
    }

    td {
      font-size: 12px;
      padding: 4px 0 !important;
      height: 32px !important;
      line-height: 24px !important;
    }

    .cell {
      font-size: 12px;
      padding: 0 8px !important;
      line-height: 24px !important;
    }

    .el-table__body {
      tr {
        height: 32px !important;
        min-height: 32px !important;
        max-height: 32px !important;
      }
    }
  }
}
</style>

