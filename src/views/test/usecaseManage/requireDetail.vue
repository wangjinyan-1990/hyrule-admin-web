<template>
  <div class="require-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button
          type="text"
          icon="el-icon-arrow-left"
          @click="goBack"
          class="back-button"
        >
          返回需求点管理
        </el-button>
        <div class="page-title">
          <i class="el-icon-document"></i>
          <span v-if="mode === 'edit'">编辑需求点</span>
          <span v-else-if="mode === 'create'">新建需求点</span>
        </div>
      </div>
      <div class="header-right">
        <el-button
          v-if="mode === 'view'"
          type="primary"
          icon="el-icon-edit"
          @click="switchToEdit"
        >
          编辑
        </el-button>
        <el-button
          v-if="mode === 'edit'"
          type="success"
          icon="el-icon-check"
          @click="saveRequirePoint"
          :loading="saving"
        >
          保存
        </el-button>
        <el-button
          v-if="mode === 'edit'"
          icon="el-icon-close"
          @click="cancelEdit"
        >
          取消
        </el-button>
        <el-button
          v-if="mode === 'create'"
          type="success"
          icon="el-icon-check"
          @click="createRequirePoint"
          :loading="saving"
        >
          创建
        </el-button>
        <el-button
          v-if="mode === 'create'"
          icon="el-icon-close"
          @click="cancelCreate"
        >
          取消
        </el-button>
      </div>
    </div>

    <!-- 需求点详情内容 -->
    <div class="detail-content" v-loading="loading">
      <el-form
        ref="requireForm"
        :model="requireForm"
        :rules="requireRules"
        label-width="120px"
        :disabled="mode === 'view'"
      >
        <!-- 基本信息 -->
        <el-card class="info-card" shadow="never">
          <div slot="header" class="card-header">
            <i class="el-icon-info"></i>
            <span>基本信息</span>
          </div>

          <!-- 需求点描述独占一行 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="需求点描述" prop="requirePointDesc">
                <el-input
                  v-model="requireForm.requirePointDesc"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入需求点描述"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="需求点类型" prop="requirePointType">
                <span v-if="mode === 'view'" class="view-text">{{ requirePointTypeText }}</span>
                <el-select
                  v-else
                  v-model="requireForm.requirePointType"
                  placeholder="请选择需求点类型"
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
            <el-col :span="12">
              <el-form-item label="需求状态" prop="requireStatus">
                <span v-if="mode === 'view'" class="view-text">{{ requireStatusText }}</span>
                <el-select
                  v-else
                  v-model="requireForm.requireStatus"
                  placeholder="请选择需求状态"
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
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="评审状态" prop="reviewStatus">
                <span v-if="mode === 'view'" class="view-text">{{ reviewStatusText }}</span>
                <el-select
                  v-else
                  v-model="requireForm.reviewStatus"
                  placeholder="请选择评审状态"
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
            <el-col :span="12">
              <el-form-item label="分析方法" prop="analysisMethod">
                <span v-if="mode === 'view'" class="view-text">{{ analysisMethodText }}</span>
                <el-select
                  v-else
                  v-model="requireForm.analysisMethod"
                  placeholder="请选择分析方法"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in analysisMethodOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                    :value="item.dataValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="requireForm.remark"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注信息"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
      </el-form>

      <!-- 关联信息 -->
      <el-card class="info-card" shadow="never">
        <div slot="header" class="card-header">
          <i class="el-icon-connection"></i>
          <span>关联信息</span>
        </div>

        <el-tabs v-model="activeRelationTab" type="card">
            <!-- 关联用例标签页 -->
            <el-tab-pane label="关联用例" name="testCases">
              <require-related-use-cases
                :require-point-id="requirePointId"
                :mode="mode"
                @removed="handleTestCasesRemoved"
              />
            </el-tab-pane>

            <!-- 关联缺陷标签页 -->
            <el-tab-pane label="关联缺陷" name="bugs">
              <require-related-bugs
                :require-point-id="requirePointId"
                :mode="mode"
              />
            </el-tab-pane>
          </el-tabs>
        </el-card>
    </div>
  </div>
</template>

<script>
import requireRepositoryApi from '@/api/test/usecaseManage/requireRepository'
import dictionaryApi from '@/api/framework/dictionary'
import RequireRelatedUseCases from './components/RequireRelatedUseCases.vue'
import RequireRelatedBugs from './components/RequireRelatedBugs.vue'

export default {
  name: 'RequireDetail',

  components: {
    RequireRelatedUseCases,
    RequireRelatedBugs
  },

  data() {
    return {
      // 页面模式：view(查看)、edit(编辑)、create(新建)
      mode: 'view',

      // 需求点ID
      requirePointId: null,

      // 加载状态
      loading: false,

      // 保存状态
      saving: false,

      // 关联信息标签页
      activeRelationTab: 'testCases',

      // 表单数据
      requireForm: {
        requirePointId: '',
        requirePointDesc: '', // 对应原有的字段名
        requirePointType: '',
        requireStatus: '',
        reviewStatus: '',
        analysisMethod: '',
        priority: '',
        remark: '',
        relatedTestCases: '',
        relatedBugs: '',
        directoryId: '',
        systemId: ''
      },

      // 表单验证规则
      requireRules: {
        requirePointDesc: [
          { required: true, message: '请输入需求点描述', trigger: 'blur' },
          { min: 2, max: 200, message: '需求点描述长度在 2 到 200 个字符', trigger: 'blur' }
        ],
        requirePointType: [
          { required: true, message: '请选择需求点类型', trigger: 'change' }
        ],
        requireStatus: [
          { required: true, message: '请选择需求状态', trigger: 'change' }
        ],
        reviewStatus: [
          { required: true, message: '请选择评审状态', trigger: 'change' }
        ],
        analysisMethod: [
          { required: true, message: '请选择分析方法', trigger: 'change' }
        ]
      },

      // 数据字典选项
      requirePointTypeOptions: [],
      requireStatusOptions: [],
      reviewStatusOptions: [],
      analysisMethodOptions: []
    }
  },

  computed: {
    // 页面标题
    pageTitle() {
      switch (this.mode) {
        case 'view':
          return '查看需求点'
        case 'edit':
          return '编辑需求点'
        case 'create':
          return '新建需求点'
        default:
          return '需求点详情'
      }
    },

    // 需求点类型文本
    requirePointTypeText() {
      const item = this.requirePointTypeOptions.find(option => option.dataValue === this.requireForm.requirePointType)
      return item ? item.dataName : this.requireForm.requirePointType
    },

    // 需求状态文本
    requireStatusText() {
      const item = this.requireStatusOptions.find(option => option.dataValue === this.requireForm.requireStatus)
      return item ? item.dataName : this.requireForm.requireStatus
    },

    // 评审状态文本
    reviewStatusText() {
      const item = this.reviewStatusOptions.find(option => option.dataValue === this.requireForm.reviewStatus)
      return item ? item.dataName : this.requireForm.reviewStatus
    },

    // 分析方法文本
    analysisMethodText() {
      const item = this.analysisMethodOptions.find(option => option.dataValue === this.requireForm.analysisMethod)
      return item ? item.dataName : this.requireForm.analysisMethod
    },

  },

  async created() {
    // 获取路由参数
    this.parseRouteParams()

    // 加载数据字典
    await this.loadDictionaryData()

    // 根据模式加载数据
    if (this.mode === 'create') {
      this.initCreateForm()
    } else if (this.requirePointId) {
      await this.loadRequirePointDetail()
    }
  },

  methods: {
    // 解析路由参数
    parseRouteParams() {
      const { mode, id } = this.$route.query
      this.mode = mode || 'view'

      // 处理 ID，保持原始字符串类型（因为后端可能是字符串ID）
      this.requirePointId = id || null
    },

    // 加载数据字典
    async loadDictionaryData() {
      try {
        const [requirePointTypeRes, requireStatusRes, reviewStatusRes, analysisMethodRes] = await Promise.all([
          dictionaryApi.getDictionaryList('requirePointType'),
          dictionaryApi.getDictionaryList('requireStatus'),
          dictionaryApi.getDictionaryList('reviewStatus'),
          dictionaryApi.getDictionaryList('analysisMethod')
        ])

        this.requirePointTypeOptions = requirePointTypeRes.data || []
        this.requireStatusOptions = requireStatusRes.data || []
        this.reviewStatusOptions = reviewStatusRes.data || []
        this.analysisMethodOptions = analysisMethodRes.data || []
      } catch (error) {
        console.error('加载数据字典失败:', error)
        this.$message.error('加载数据字典失败')
      }
    },

    // 初始化新建表单
    initCreateForm() {
      const { directoryId, systemId } = this.$route.query
      this.requireForm = {
        requirePointId: '',
        requirePointDesc: '',
        requirePointType: '',
        requireStatus: '1', // 默认草稿状态
        reviewStatus: '0', // 默认待评审
        analysisMethod: '',
        remark: '',
        directoryId: directoryId || '',
        systemId: systemId || ''
      }
    },

    // 加载需求点详情
    async loadRequirePointDetail() {
      try {
        this.loading = true
        const response = await requireRepositoryApi.getRequirePointDetail(this.requirePointId)
        if (response.code === 20000 && response.data) {
          // 直接使用后端返回的数据，确保所有字段都被正确映射
          this.requireForm = {
            ...this.requireForm,
            ...response.data
          }
        } else {
          this.$message.error(response.message || '加载需求点详情失败')
        }
      } catch (error) {
        console.error('加载需求点详情失败:', error)
        this.$message.error('加载需求点详情失败')
      } finally {
        this.loading = false
      }
    },

    // 处理关联用例移除后的事件
    handleTestCasesRemoved() {
      // 用例移除后，可以在这里执行一些操作，比如刷新数据
      // 由于组件内部已经处理了数据更新，这里暂时不需要额外操作
    },

    // 切换到编辑模式
    switchToEdit() {
      this.mode = 'edit'
      this.$router.replace({
        query: { ...this.$route.query, mode: 'edit' }
      })
    },

    // 保存需求点
    async saveRequirePoint() {
      try {
        await this.$refs.requireForm.validate()

        this.saving = true
        const response = await requireRepositoryApi.updateRequirePoint(this.requirePointId, this.requireForm)

        if (response.code === 20000) {
          this.$message.success('需求点保存成功')
          this.mode = 'view'
          this.$router.replace({
            query: { ...this.$route.query, mode: 'view' }
          })
          // 重新加载数据
          await this.loadRequirePointDetail()
        } else {
          this.$message.error(response.message || '保存失败')
        }
      } catch (error) {
        if (error.message) {
          this.$message.error(error.message)
        } else {
          console.error('保存需求点失败:', error)
          this.$message.error('保存失败')
        }
      } finally {
        this.saving = false
      }
    },

    // 取消编辑
    cancelEdit() {
      this.$confirm('确定要取消编辑吗？未保存的修改将丢失。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.mode = 'view'
        this.$router.replace({
          query: { ...this.$route.query, mode: 'view' }
        })
        // 重新加载原始数据
        this.loadRequirePointDetail()
      }).catch(() => {
        // 用户取消
      })
    },

    // 创建需求点
    async createRequirePoint() {
      try {
        await this.$refs.requireForm.validate()

        this.saving = true
        const response = await requireRepositoryApi.createRequirePoint(this.requireForm)

        if (response.code === 20000) {
          this.$message.success('需求点创建成功')
          // 跳转到查看页面
          this.requirePointId = response.data.requirePointId
          this.mode = 'view'
          this.$router.replace({
            query: { ...this.$route.query, mode: 'view', id: this.requirePointId }
          })
          // 重新加载数据
          await this.loadRequirePointDetail()
        } else {
          this.$message.error(response.message || '创建失败')
        }
      } catch (error) {
        if (error.message) {
          this.$message.error(error.message)
        } else {
          console.error('创建需求点失败:', error)
          this.$message.error('创建失败')
        }
      } finally {
        this.saving = false
      }
    },

    // 取消创建
    cancelCreate() {
      this.$confirm('确定要取消创建吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.goBack()
      }).catch(() => {
        // 用户取消
      })
    },

    // 返回需求点管理页面
    goBack() {
      // 使用浏览器后退功能，保持原页面状态不刷新
      this.$router.go(-1)
    },

    // 添加关联用例
    handleAddTestCase() {
      if (this.mode === 'view') {
        this.$message.warning('查看模式下不能添加用例，请先切换到编辑模式')
        return
      }
      this.$message.info('添加关联用例功能开发中')
      // TODO: 实现添加关联用例的对话框
    },

    // 处理用例选择变化
    // 获取用例行的唯一key
    getTestCaseRowKey(row) {
      return row.usecaseId || row.id || Math.random()
    },

    // 处理用例选择变化
    handleTestCasesSelectionChange(selection) {
      console.log('用例选择变化:', selection)
      this.selectedTestCases = selection || []
      console.log('selectedTestCases 已更新:', this.selectedTestCases.length)
    },

    // 全选/取消全选用例
    handleSelectAllTestCases() {
      if (this.mode === 'view') {
        this.$message.warning('查看模式下不能操作，请先切换到编辑模式')
        return
      }
      if (this.isAllTestCasesSelected) {
        // 取消全选
        this.$refs.testCasesTable.clearSelection()
      } else {
        // 全选
        this.$refs.testCasesTable.toggleAllSelection()
      }
    },

    // 批量移除关联用例
    async handleBatchRemoveTestCases() {
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
            // 从列表中移除已删除的用例
            this.relatedTestCasesList = this.relatedTestCasesList.filter(
              item => !usecaseIds.includes(item.usecaseId)
            )
            this.selectedTestCases = []
            this.$message.success('移除成功')
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

    // 移除关联用例（单个）
    async handleRemoveTestCase(row, index) {
      this.$confirm('确定要移除此关联用例吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        if (!this.requirePointId || !row.usecaseId) {
          this.$message.error('缺少必要参数')
          return
        }
        try {
          const response = await usecaseRequireLinkApi.unlinkTestCasesFromRequirePoint(
            this.requirePointId,
            [row.usecaseId]
          )
          if (response.code === 20000) {
            this.relatedTestCasesList.splice(index, 1)
            // 如果移除的用例在选中列表中，也要移除
            this.selectedTestCases = this.selectedTestCases.filter(
              item => item.usecaseId !== row.usecaseId
            )
            this.$message.success('移除成功')
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

    // 添加关联缺陷
    handleAddBug() {
      this.$message.info('添加关联缺陷功能开发中')
      // TODO: 实现添加关联缺陷的对话框
    },

    // 移除关联缺陷
    handleRemoveBug(row, index) {
      this.$confirm('确定要移除此关联缺陷吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.relatedBugsList.splice(index, 1)
        this.$message.success('移除成功')
      }).catch(() => {
        // 用户取消
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.require-detail-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 8px 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  font-size: 14px;
  color: #606266;

  &:hover {
    color: #409eff;
  }
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;

  i {
    color: #409eff;
  }
}

.header-right {
  display: flex;
  gap: 12px;
}

.detail-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-card {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;

  &:last-child {
    margin-bottom: 0;
  }

  // 卡片头部 padding 调整
  ::v-deep .el-card__header {
    padding: 8px 10px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;

  i {
    color: #409eff;
  }
}

// 表单项样式优化
.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

// 查看模式文本样式
.view-text {
  display: inline-block;
  padding: 6px 10px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  color: #606266;
  font-size: 12px;
  min-height: 40px;
  line-height: 24px;
  width: 100%;
  box-sizing: border-box;
}

// 输入框样式
::v-deep .el-input__inner,
::v-deep .el-textarea__inner {
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  font-size: 12px;

  &:focus {
    border-color: #409eff;
  }
}

// 选择器样式
.el-select {
  width: 100%;
}

// 日期选择器样式
.el-date-editor {
  width: 100%;
}

// 数字输入框样式
.el-input-number {
  width: 100%;
}

// 禁用状态样式
.el-form--disabled .el-input__inner,
.el-form--disabled .el-textarea__inner,
.el-form--disabled .el-select .el-input__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
}

// 关联信息样式
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

// 关联用例和关联缺陷表格字体大小
.relation-content ::v-deep .el-table {
  font-size: 12px;

  th {
    font-size: 12px;
  }

  td {
    font-size: 12px;
  }

  .cell {
    font-size: 12px;
  }

  .el-button {
    font-size: 12px;
  }
}

// 关联用例表格行高和间距调整
.related-test-cases-table {
  pointer-events: auto !important;

  ::v-deep {
    pointer-events: auto !important;

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

            // 确保操作列的按钮可以正常点击
            .el-button {
              padding: 4px 8px !important;
              pointer-events: auto !important;
              cursor: pointer !important;
              min-height: 24px !important;
              line-height: 1 !important;
            }

            // 确保选择列的复选框可以正常点击
            .el-checkbox {
              pointer-events: auto !important;
              cursor: pointer !important;
              user-select: none !important;

              .el-checkbox__input {
                pointer-events: auto !important;
                cursor: pointer !important;

                &.is-disabled {
                  pointer-events: none !important;
                  cursor: not-allowed !important;
                }

                .el-checkbox__inner {
                  pointer-events: auto !important;
                  cursor: pointer !important;
                  width: 14px !important;
                  height: 14px !important;
                }
              }

              &.is-disabled {
                pointer-events: none !important;
                cursor: not-allowed !important;
              }
            }
          }
        }
      }
    }
  }

  ::v-deep .el-table__header-wrapper {
    pointer-events: auto !important;

    .el-table__header {
      pointer-events: auto !important;

      th {
        padding: 4px 0 !important;
        height: 32px !important;
        line-height: 24px !important;
        pointer-events: auto !important;

        .cell {
          padding: 0 8px !important;
          line-height: 24px !important;
          pointer-events: auto !important;
        }

        // 确保表头的全选复选框可以正常点击
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

// 按钮 padding 调整
::v-deep .el-button {
  padding: 8px 10px;
}

// 响应式设计
@media (max-width: 768px) {
  .require-detail-container {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-left {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .detail-content {
    padding: 16px;
  }

  .el-col {
    margin-bottom: 16px;
  }
}
</style>
