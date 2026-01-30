<template>
  <div class="require-repository-container">
    <!-- 左侧目录树 -->
    <div class="left-panel">
      <div class="panel-header">
        <h3>目录结构</h3>
      </div>
      <div class="tree-container">
        <DirectoryTreeSelect
          ref="directoryTreeSelect"
          :show-actions="false"
          module="isUseTestcase"
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
                <el-input v-model="searchForm.requirePointDesc" placeholder="需求点概述" class="search-input-small"></el-input>
            </el-col>
            <el-col :span="6">
                <el-select v-model="searchForm.requirePointType" placeholder="需求点类型" clearable class="search-select-small">
                  <el-option
                    v-for="item in requirePointTypeOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                    :value="item.dataValue">
                  </el-option>
                </el-select>
            </el-col>
            <el-col :span="6">
                <el-select v-model="searchForm.reviewStatus" placeholder="评审状态" clearable class="search-select-small">
                  <el-option
                    v-for="item in reviewStatusOptions"
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
            <el-select v-model="searchForm.requireStatus" placeholder="需求状态" clearable class="search-select-small">
                  <el-option
                    v-for="item in requireStatusOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                :value="item.dataValue">
              </el-option>
                </el-select>
            </el-col>
            <el-col :span="6">
            <el-select v-model="searchForm.analysisMethod" placeholder="分析方法" clearable class="search-select-small">
              <el-option
                v-for="item in analysisMethodOptions"
                :key="item.dataValue"
                :label="item.dataName"
                :value="item.dataValue">
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-input v-model="searchForm.designer" placeholder="设计人" class="search-input-small"></el-input>
          </el-col>
          <el-col :span="6">
            <!-- 预留空间 -->
            </el-col>
          </el-row>

        <!-- 展开的搜索条件 -->
        <el-row v-show="showMoreSearch" style="margin-top: 0px;">
          <el-col :span="6">
            <!-- 可以添加更多查询条件 -->
          </el-col>
          <el-col :span="6">
            <!-- 可以添加更多查询条件 -->
          </el-col>
          <el-col :span="6">
            <!-- 可以添加更多查询条件 -->
          </el-col>
          <el-col :span="6">
            <!-- 预留空间 -->
          </el-col>
        </el-row>
      </el-card>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button type="primary" @click="handleAdd" :disabled="!selectedDirectory">
          <i class="el-icon-plus"></i> 新增需求点
        </el-button>
        <el-button type="success" @click="handleBatchReview" :disabled="selectedRows.length === 0">
          <i class="el-icon-check"></i> 批量评审
        </el-button>
        <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
          <i class="el-icon-delete"></i> 批量删除
        </el-button>
        <el-button type="warning" @click="handleImport">
          <i class="el-icon-upload2"></i> 导入
        </el-button>
        <el-button type="info" @click="handleExport" :disabled="tableData.length === 0">
          <i class="el-icon-download"></i> 导出
        </el-button>
        <el-button type="default" @click="handleDownloadTemplate">
          <i class="el-icon-document"></i> 下载导入模板
        </el-button>
      </div>


      <!-- 结果列表 - 需求点列表表格 -->
      <div class="table-section">
        <div class="table-wrapper">
        <el-table
          :data="tableData"
          v-loading="loading"
          @selection-change="handleSelectionChange"
          @row-dblclick="handleRowDblClick"
          stripe
          border
            height="500"
            style="width: 100%"
            :key="tableKey"
        >
          <el-table-column type="selection" width="35" />
          <el-table-column prop="requirePointId" label="需求点ID" width="110" show-overflow-tooltip />
          <el-table-column prop="requirePointDesc" label="需求点概述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="requirePointType" label="需求点类型" width="120">
            <template slot-scope="scope">
              <el-tag :type="getRequirePointTypeTag(scope.row.requirePointType)">
                {{ getRequirePointTypeText(scope.row.requirePointType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reviewStatus" label="评审状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getReviewStatusTag(scope.row.reviewStatus)">
                {{ getReviewStatusText(scope.row.reviewStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="requireStatus" label="需求状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getRequireStatusTag(scope.row.requireStatus)">
                {{ getRequireStatusText(scope.row.requireStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="analysisMethod" label="分析方法" width="120" show-overflow-tooltip>
            <template slot-scope="scope">
              {{ getAnalysisMethodText(scope.row.analysisMethod) }}
            </template>
          </el-table-column>
          <el-table-column prop="designer" label="设计人" width="100" />
          <el-table-column prop="modifier" label="修改人" width="100" />
          <el-table-column prop="createTime" label="创建时间" width="160">
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="modifyTime" label="修改时间" width="160">
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.modifyTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleView(scope.row)">
                查看
              </el-button>
              <el-button size="mini" type="success" @click="handleEdit(scope.row)">
                编辑
              </el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        </div>

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
          />
        </div>
      </div>
    </div>

    <!-- 新增/编辑/查看对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
    >
      <!-- 查看模式 -->
      <div v-if="dialogMode === 'view'" class="view-detail">
        <el-form :model="formData" label-width="120px" class="view-form">
          <el-form-item label="需求点概述">
            <el-input
              :value="formData.requirePointDesc || '-'"
              type="textarea"
              :rows="3"
              readonly
              class="view-input"
            />
          </el-form-item>

          <el-form-item label="需求点类型">
            <el-select :value="formData.requirePointType" disabled class="view-select">
              <el-option
                :label="getRequirePointTypeText(formData.requirePointType)"
                :value="formData.requirePointType"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="分析方法">
            <el-select :value="formData.analysisMethod" disabled class="view-select">
              <el-option
                :label="getAnalysisMethodText(formData.analysisMethod)"
                :value="formData.analysisMethod"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="备注">
            <el-input
              :value="formData.remark || '-'"
              type="textarea"
              :rows="2"
              readonly
              class="view-input"
            />
          </el-form-item>

          <!-- 其他信息 -->
          <el-form-item label="评审状态">
            <el-tag :type="getReviewStatusTag(formData.reviewStatus)">
              {{ getReviewStatusText(formData.reviewStatus) }}
            </el-tag>
          </el-form-item>

          <el-form-item label="需求状态">
            <el-tag :type="getRequireStatusTag(formData.requireStatus)">
              {{ getRequireStatusText(formData.requireStatus) }}
            </el-tag>
          </el-form-item>

          <el-form-item label="设计人">
            <span class="view-text">{{ formData.designer || '-' }}</span>
          </el-form-item>
          <el-form-item label="修改人">
            <span class="view-text">{{ formData.modifier || '-' }}</span>
          </el-form-item>
          <el-form-item label="创建时间">
            <span class="view-text">{{ formatDateTime(formData.createTime) || '-' }}</span>
          </el-form-item>
          <el-form-item label="修改时间">
            <span class="view-text">{{ formatDateTime(formData.modifyTime) || '-' }}</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 编辑模式 -->
      <el-form v-else-if="dialogMode === 'edit'" :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="需求点概述" prop="requirePointDesc">
          <el-input
            v-model="formData.requirePointDesc"
            type="textarea"
            :rows="3"
            placeholder="请输入需求点概述"
          />
        </el-form-item>
        <el-form-item label="需求点类型" prop="requirePointType">
          <el-select v-model="formData.requirePointType" placeholder="请选择需求点类型" style="width: 100%">
            <el-option
              v-for="item in requirePointTypeOptions"
              :key="item.dataValue"
              :label="item.dataName"
              :value="item.dataValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分析方法" prop="analysisMethod">
          <el-select v-model="formData.analysisMethod" placeholder="请选择分析方法" style="width: 100%">
            <el-option
              v-for="item in analysisMethodOptions"
              :key="item.dataValue"
              :label="item.dataName"
              :value="item.dataValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设计人">
          <el-input
            v-model="formData.designer"
            placeholder="请输入设计人"
          />
        </el-form-item>
        <el-form-item label="修改人">
          <el-input
            v-model="formData.modifier"
            placeholder="请输入修改人"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <!-- 查看模式按钮 -->
        <template v-if="dialogMode === 'view'">
          <el-button @click="dialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="switchToEditMode">编辑</el-button>
        </template>

        <!-- 编辑模式按钮 -->
        <template v-else-if="dialogMode === 'edit'">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </template>
      </div>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog
      title="删除需求点"
      :visible.sync="deleteDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="delete-confirm">
        <div class="delete-warning">
          <i class="el-icon-warning" style="color: #E6A23C; font-size: 24px; margin-right: 12px;"></i>
          <span>确定要删除需求点"{{ deleteData.requirePointDesc }}"吗？</span>
        </div>
        <p style="color: #909399; font-size: 12px; margin-top: 10px;">删除后不可恢复，请谨慎操作！</p>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleConfirmDelete" :loading="deleteLoading">确认删除</el-button>
      </div>
    </el-dialog>

    <!-- 批量评审对话框 -->
    <el-dialog
      title="批量评审"
      :visible.sync="batchReviewDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="batchReviewForm" label-width="120px">
        <el-form-item label="评审状态" required>
          <el-select v-model="batchReviewForm.reviewStatus" placeholder="请选择评审状态" style="width: 100%">
            <el-option
              v-for="item in reviewStatusOptions"
              :key="item.dataValue"
              :label="item.dataName"
              :value="item.dataValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          :label="isReviewRejected ? '评审意见' : '评审意见'"
          :required="isReviewRejected"
        >
          <el-input
            v-model="batchReviewForm.reviewComment"
            type="textarea"
            :rows="3"
            :placeholder="isReviewRejected ? '请输入评审意见（必填）' : '请输入评审意见'"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="batchReviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmBatchReview" :loading="batchReviewLoading">确定</el-button>
      </div>
    </el-dialog>

    <!-- 导入对话框 -->
    <FileUploadSingleDialog
      title="导入需求点"
      :visible.sync="importDialogVisible"
      tips="请先下载导入模板，按照模板格式填写数据后上传"
      accept=".xlsx,.xls"
      accept-text="Excel"
      :max-size="10"
      confirm-text="确定导入"
      :loading="importLoading"
      @confirm="handleImportConfirm"
      @cancel="importDialogVisible = false"
    />
  </div>
</template>

<script>
import DirectoryTreeSelect from '../baseManage/components/DirectoryTreeSelect.vue'
import FileUploadSingleDialog from '@/views/sys/common/FileUploadSingleDialog.vue'
import dictionaryApi from '@/api/framework/dictionary'
import requireRepositoryApi from '@/api/test/usecaseManage/requireRepository'

export default {
  name: 'requireRepository', // 组件名与路由名一致，以便keep-alive缓存
  components: {
    DirectoryTreeSelect,
    FileUploadSingleDialog
  },
  data() {
    return {
      // 查询表单
      searchForm: {
        requirePointDesc: '',
        requirePointType: '',
        reviewStatus: '',
        requireStatus: '',
        designer: '',
        directoryId: ''
      },
      // 数据字典选项
      requirePointTypeOptions: [],
      reviewStatusOptions: [],
      requireStatusOptions: [],
      analysisMethodOptions: [],

      // 导入相关
      importDialogVisible: false,
      importLoading: false,

      // 表格数据
      tableData: [],
      selectedRows: [],
      loading: false,
      tableKey: 0,
      showMoreSearch: false,

      // 分页
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },

      // 选中的目录
      selectedDirectory: null,

      // 对话框
      dialogVisible: false,
      dialogTitle: '',
      dialogMode: 'edit', // 'view', 'edit'
      submitLoading: false,

      // 删除对话框
      deleteDialogVisible: false,
      deleteData: {},
      deleteLoading: false,

      // 批量评审对话框
      batchReviewDialogVisible: false,
      batchReviewForm: {
        reviewStatus: '',
        reviewComment: ''
      },
      batchReviewLoading: false,
      formData: {
        requirePointId: '',
        requirePointDesc: '',
        requirePointType: '',
        analysisMethod: '',
        remark: '',
        designer: '',
        modifier: '',
        directoryId: '',
        systemId: ''
      },

      // 表单验证规则
      formRules: {
        requirePointDesc: [
          { required: true, message: '请输入需求点概述', trigger: 'blur' }
        ],
        requirePointType: [
          { required: true, message: '请选择需求点类型', trigger: 'change' }
        ],
        analysisMethod: [
          { required: true, message: '请输入分析方法', trigger: 'blur' }
        ]
      }
    }
  },

  async created() {
    await this.loadDictionaryData()
    // 恢复保存的状态
    this.restorePageState()
    // 只加载数据字典，不自动查询数据
  },

  activated() {
    // 即使 keep-alive 生效，也尝试恢复状态以确保万无一失
    this.restorePageState()
  },

  deactivated() {
    // 保存当前状态
    this.savePageState()
  },

  beforeDestroy() {
    // 组件销毁前保存状态
    this.savePageState()
  },

  mounted() {
    // 页面加载时不自动查询数据
    this.$nextTick(() => {
      // 强制设置查询条件输入框高度
      const searchInputs = document.querySelectorAll('#search .el-input__inner')
      searchInputs.forEach(input => {
        input.style.height = '24px'
        input.style.lineHeight = '24px'
        input.style.fontSize = '10px'
      })

      // 强制设置表格行高 - 使用更强的方式
      this.forceTableRowHeight()
    })
  },

  computed: {
    // 判断当前选择的评审状态是否为"评审不通过"
    isReviewRejected() {
      if (!this.batchReviewForm.reviewStatus || !this.reviewStatusOptions.length) {
        return false
      }
      const selectedOption = this.reviewStatusOptions.find(option => option.dataValue === this.batchReviewForm.reviewStatus)
      return selectedOption && selectedOption.dataName === '评审不通过'
    }
  },

  methods: {
    // 保存页面状态到 sessionStorage
    savePageState() {
      try {
        // 获取目录树的展开状态
        let treeExpandedKeys = []
        const treeSelect = this.$refs.directoryTreeSelect

        if (treeSelect) {
          if (treeSelect.getExpandedKeys) {
            treeExpandedKeys = treeSelect.getExpandedKeys()
          }

          // 如果获取失败，尝试直接访问组件的 expandedKeys 属性
          if (treeExpandedKeys.length === 0 && treeSelect.expandedKeys) {
            treeExpandedKeys = [...treeSelect.expandedKeys]
          }
        }

        const state = {
          selectedDirectory: this.selectedDirectory,
          searchForm: this.searchForm,
          pagination: this.pagination,
          tableData: this.tableData,
          treeExpandedKeys: treeExpandedKeys,
          timestamp: Date.now()
        }
        sessionStorage.setItem('requireRepository_state', JSON.stringify(state))
      } catch (error) {
        console.error('保存页面状态失败:', error)
      }
    },

    // 从 sessionStorage 恢复页面状态
    restorePageState() {
      try {
        const savedState = sessionStorage.getItem('requireRepository_state')
        if (!savedState) {
          return
        }

        const state = JSON.parse(savedState)
        const timeDiff = Date.now() - state.timestamp

        // 如果状态保存时间超过30分钟，则不恢复（避免过期数据）
        if (timeDiff > 30 * 60 * 1000) {
          sessionStorage.removeItem('requireRepository_state')
          return
        }

        // 恢复选中的目录
        if (state.selectedDirectory) {
          this.selectedDirectory = state.selectedDirectory
          this.searchForm.directoryId = state.selectedDirectory.directoryId

          // DirectoryTreeSelect 会在 created/activated 钩子中自动恢复展开状态
          // 这里只需要设置选中节点即可
          this.$nextTick(() => {
            setTimeout(() => {
              const treeSelect = this.$refs.directoryTreeSelect
              if (treeSelect && treeSelect.setSelectedKey) {
                // 不传递 expandedKeys，让组件自己从 sessionStorage 恢复
                treeSelect.setSelectedKey(state.selectedDirectory.directoryId)
              }
            }, 1500) // 延迟更长时间，等待树完全展开
          })
        }

        // 恢复搜索条件
        if (state.searchForm) {
          this.searchForm = { ...this.searchForm, ...state.searchForm }
        }

        // 恢复分页
        if (state.pagination) {
          this.pagination = { ...this.pagination, ...state.pagination }
        }

        // 恢复表格数据
        if (state.tableData) {
          this.tableData = state.tableData
        }
      } catch (error) {
        console.error('恢复页面状态失败:', error)
      }
    },

    // 强制设置表格行高
    forceTableRowHeight() {
      // 延迟执行，确保表格已渲染
      // 注意：字体大小已通过 CSS 设置，这里只设置高度，避免闪烁
      setTimeout(() => {
        // 设置所有表格行高度
        const allRows = document.querySelectorAll('.el-table__row')
        allRows.forEach(row => {
          row.style.height = '24px'
          row.style.minHeight = '24px'
          row.style.maxHeight = '24px'
        })

        // 设置所有表格单元格高度（不设置字体大小，避免闪烁）
        const allCells = document.querySelectorAll('.el-table th, .el-table td')
        allCells.forEach(cell => {
          cell.style.height = '24px'
          cell.style.lineHeight = '24px'
          // 移除字体大小设置，使用 CSS 中的设置
          // cell.style.fontSize = '10px'
          cell.style.padding = '0'
        })

        // 设置表头行高度
        const headerRows = document.querySelectorAll('.el-table__header tr')
        headerRows.forEach(row => {
          row.style.height = '24px'
          row.style.minHeight = '24px'
          row.style.maxHeight = '24px'
        })

        // 设置表体行高度
        const bodyRows = document.querySelectorAll('.el-table__body tr')
        bodyRows.forEach(row => {
          row.style.height = '24px'
          row.style.minHeight = '24px'
          row.style.maxHeight = '24px'
        })
      }, 100)
    },

    // 切换更多搜索条件显示
    toggleMoreSearch() {
      this.showMoreSearch = !this.showMoreSearch
    },

    // 加载数据字典
    async loadDictionaryData() {
      try {
        const [requirePointTypeRes, reviewStatusRes, requireStatusRes, analysisMethodRes] = await Promise.all([
          dictionaryApi.getDictionaryList('requirePointType'),
          dictionaryApi.getDictionaryList('reviewStatus'),
          dictionaryApi.getDictionaryList('requireStatus'),
          dictionaryApi.getDictionaryList('analysisMethod')
        ])

        this.requirePointTypeOptions = requirePointTypeRes.data || []
        this.reviewStatusOptions = reviewStatusRes.data || []
        this.requireStatusOptions = requireStatusRes.data || []
        this.analysisMethodOptions = analysisMethodRes.data || []
      } catch (error) {
        this.$message.error('加载数据字典失败')
      }
    },

    // 加载数据
    async loadData() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          pageNum: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }

        // 确保directoryId参数正确传递
        if (this.searchForm.directoryId) {
          params.directoryId = this.searchForm.directoryId
        }

        // 调试信息：显示传递给API的参数
        console.log('API请求参数:', params)

        const response = await requireRepositoryApi.getRequirePointList(params)

        // 检查API响应结构，支持两种格式
        let responseData = null
        if (response.data && response.data.code === 20000) {
          // 标准格式：{code: 20000, message: "success", data: {rows: [], total: 0}}
          responseData = response.data.data
        } else if (response.data && response.data.rows) {
          // 直接格式：{rows: [], total: 0, pageNo: 1, ...}
          responseData = response.data
        }

        if (responseData) {
          // 先清空数据，强制表格重新创建
          this.tableData = []
          this.tableKey += 1
          // 延迟设置新数据
          this.$nextTick(() => {
            this.tableData = responseData.rows || []
            this.pagination.total = responseData.total || 0
            this.tableKey += 1
            // 再次强制更新
            this.$nextTick(() => {
              this.$forceUpdate()
              // 数据更新后强制设置表格行高
              setTimeout(() => {
                this.forceTableRowHeight()
              }, 200)
            })
          })
        } else {
          this.$message.error('API响应数据格式不正确')
        }
      } catch (error) {
        this.$message.error('加载数据失败: ' + (error.response?.data?.message || error.message))
      } finally {
        this.loading = false
      }
    },

    // 查询
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 重置
    handleReset() {
      this.searchForm = {
        requirePointDesc: '',
        requirePointType: '',
        reviewStatus: '',
        requireStatus: '',
        designer: '',
        directoryId: ''
      }
      this.pagination.currentPage = 1
      // 重置时清空表格数据，不自动查询
      this.tableData = []
      this.pagination.total = 0
    },

    // 目录选择
    handleNodeSelect(data) {
      this.selectedDirectory = data
      this.searchForm.directoryId = data.directoryId
      this.loadData()
    },

    // 新增
    handleAdd() {
      if (!this.selectedDirectory) {
        this.$message.warning('请先选择目录')
        return
      }

      // 跳转到新建需求点页面
      this.$router.push({
        name: 'requireDetail',
        query: {
          mode: 'create',
        directoryId: this.selectedDirectory.directoryId,
        systemId: this.selectedDirectory.systemId
      }
      })
    },

    // 编辑
    handleEdit(row) {
      // 跳转到编辑需求点页面
      this.$router.push({
        name: 'requireDetail',
        query: {
          mode: 'edit',
          id: row.requirePointId
        }
      })
    },

    // 查看
    handleView(row) {
      // 跳转到查看需求点页面
      this.$router.push({
        name: 'requireDetail',
        query: {
          mode: 'view',
          id: row.requirePointId
        }
      })
    },

    // 双击行事件 - 进入查看页面
    handleRowDblClick(row) {
      // 复用handleView方法的逻辑
      this.handleView(row)
    },

    // 删除
    async handleDelete(row) {
      try {
        this.loading = true
        const response = await requireRepositoryApi.getRequirePointById(row.requirePointId)
        if (response.code === 20000) {
          this.deleteData = { ...response.data }
          this.deleteDialogVisible = true
        } else {
          this.$message.error(response.message || '获取详情失败')
        }
      } catch (error) {
        console.error('获取需求点详情失败:', error)
        this.$message.error('获取详情失败')
      } finally {
        this.loading = false
      }
    },

    // 模式切换方法
    switchToEditMode() {
      this.dialogMode = 'edit'
      this.dialogTitle = '编辑需求点'
    },

    // 确认删除
    async handleConfirmDelete() {
      try {
        this.deleteLoading = true
        await requireRepositoryApi.deleteRequirePoint(this.deleteData.requirePointId)
        this.$message.success('删除成功')
        this.deleteDialogVisible = false
        this.loadData()
      } catch (error) {
        console.error('删除失败:', error)
        this.$message.error('删除失败')
      } finally {
        this.deleteLoading = false
      }
    },

    // 批量评审
    handleBatchReview() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要评审的需求点')
        return
      }

      // 显示评审选择对话框
      this.batchReviewDialogVisible = true
      this.batchReviewForm = {
        reviewStatus: '',
        reviewComment: ''
      }
    },

    // 确认批量评审
    async handleConfirmBatchReview() {
      if (!this.batchReviewForm.reviewStatus) {
        this.$message.warning('请选择评审状态')
        return
      }

      // 如果选择"评审不通过"，评审意见必填
      if (this.isReviewRejected && !this.batchReviewForm.reviewComment.trim()) {
        this.$message.warning('评审不通过时，评审意见为必填项')
        return
      }

      try {
        this.batchReviewLoading = true
        const requirePointIds = this.selectedRows.map(row => row.requirePointId)
        await requireRepositoryApi.batchReviewRequirePoints({
          requirePointIds: requirePointIds,
          reviewStatus: this.batchReviewForm.reviewStatus,
          reviewComment: this.batchReviewForm.reviewComment.trim()
        })

        this.$message.success('批量评审成功')
        this.batchReviewDialogVisible = false
        this.selectedRows = []
        this.loadData()
      } catch (error) {
        console.error('批量评审失败:', error)
        this.$message.error('批量评审失败')
      } finally {
        this.batchReviewLoading = false
      }
    },

    // 批量删除
    handleBatchDelete() {
      if (this.selectedRows.length === 0) {
        this.$message.warning('请选择要删除的需求点')
        return
      }

      this.$confirm(`确定要删除选中的 ${this.selectedRows.length} 个需求点吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const requirePointIds = this.selectedRows.map(row => row.requirePointId)
          await requireRepositoryApi.batchDeleteRequirePoints(requirePointIds)
          this.$message.success('删除成功')
          this.loadData()
        } catch (error) {
          this.$message.error('批量删除失败')
        }
      })
    },

    // 提交表单
    handleSubmit() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            let response
            if (this.formData.requirePointId) {
              // 更新需求点
              response = await requireRepositoryApi.updateRequirePoint(this.formData.requirePointId, this.formData)
            } else {
              // 新增需求点
              response = await requireRepositoryApi.createRequirePoint(this.formData)
            }

            this.$message.success(this.formData.requirePointId ? '修改成功' : '新增成功')
            this.dialogVisible = false
            this.loadData()
          } catch (error) {
            this.$message.error('提交失败')
          } finally {
            this.submitLoading = false
          }
        }
      })
    },

    // 表格选择变化
    handleSelectionChange(selection) {
      this.selectedRows = selection
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.currentPage = 1
      this.loadData()
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.currentPage = val
      this.loadData()
    },

    // 获取需求点类型标签样式
    getRequirePointTypeTag(type) {
      const typeMap = {
        '1': 'primary',
        '2': 'success',
        '3': 'danger',
        '4': 'warning'
      }
      return typeMap[type] || 'info'
    },

    // 获取需求点类型文本
    getRequirePointTypeText(type) {
      const item = this.requirePointTypeOptions.find(option => option.dataValue === type)
      return item ? item.dataName : type
    },

    // 获取评审状态标签样式
    getReviewStatusTag(status) {
      const statusMap = {
        '0': 'warning',
        '1': 'success',
        '2': 'danger'
      }
      return statusMap[status] || 'info'
    },

    // 获取评审状态文本
    getReviewStatusText(status) {
      const item = this.reviewStatusOptions.find(option => option.dataValue === status)
      return item ? item.dataName : status
    },

    // 获取需求状态标签样式
    getRequireStatusTag(status) {
      const statusMap = {
        '0': 'warning',
        '1': 'primary',
        '2': 'success',
        '3': 'info'
      }
      return statusMap[status] || 'info'
    },

    // 获取需求状态文本
    getRequireStatusText(status) {
      const item = this.requireStatusOptions.find(option => option.dataValue === status)
      return item ? item.dataName : status
    },

    // 格式化日期时间
    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN')
    },

    // 获取需求点类型文本
    getRequirePointTypeText(type) {
      const item = this.requirePointTypeOptions.find(option => option.dataValue === type)
      return item ? item.dataName : type
    },

    // 获取分析方法文本
    getAnalysisMethodText(method) {
      const item = this.analysisMethodOptions.find(option => option.dataValue === method)
      return item ? item.dataName : method
    },

    // 导入相关方法
    handleImport() {
      if (!this.selectedDirectory) {
        this.$message.warning('请选择要导入的系统')
        return
      }
      this.importDialogVisible = true
      // 清空之前的文件选择状态
      this.$nextTick(() => {
        // FileUploadSingleDialog 组件会在对话框打开时自动重置文件
        // 这里确保对话框打开时清空状态
      })
    },

    async handleImportConfirm(file) {
      this.importLoading = true
      try {
        const formData = new FormData()
        formData.append('file', file.raw)

        // 添加systemId参数
        if (this.selectedDirectory?.systemId) {
          formData.append('systemId', this.selectedDirectory.systemId)
        }

        const response = await requireRepositoryApi.importRequirePoints(formData)


        // 处理导入结果

        // 检查响应数据结构
        let responseData = null
        if (response.data && response.data.code === 20000) {
          responseData = response.data
        } else if (response.code === 20000) {
          responseData = response
        } else {
          this.$message.error('导入失败：响应数据格式不正确')
          return
        }

        const result = responseData.data
        const message = responseData.message


        if (result.failCount === 0 || result.failCount === '0') {
          // 全部成功
          this.$message.success(message)
        } else if (result.successCount > 0 || result.successCount > '0') {
          // 部分成功
          this.$message.warning(message)

          // 显示错误详情
          if (result.errorMessages && result.errorMessages.length > 0) {
            const errorDetail = result.errorMessages.join('\n')
            this.$alert(errorDetail, '导入错误详情', {
              confirmButtonText: '确定',
              type: 'warning'
            })
          }
        } else {
          // 全部失败
          this.$message.error(message)

          // 显示错误详情
          if (result.errorMessages && result.errorMessages.length > 0) {
            const errorDetail = result.errorMessages.join('\n')
            this.$alert(errorDetail, '导入错误详情', {
              confirmButtonText: '确定',
              type: 'error'
            })
          }
        }

        // 只有全部成功时才关闭对话框
        if (result.failCount === 0 || result.failCount === '0') {
          this.importDialogVisible = false
        }
        // 部分成功或全部失败时，不清空文件列表，方便用户修改后重新导入
        // 但用户重新选择文件时，FileUploadSingleDialog 会自动清空旧文件
        this.loadData() // 重新加载数据
      } catch (error) {
        this.$message.error('导入失败: ' + (error.message || '未知错误'))
        // 导入失败时不清空文件列表，方便用户重试
        // 但用户重新选择文件时，FileUploadSingleDialog 会自动清空旧文件
      } finally {
        this.importLoading = false
      }
    },

    // 导出
    async handleExport() {
      if (this.tableData.length === 0) {
        this.$message.warning('没有数据可导出')
        return
      }

      try {
        const response = await requireRepositoryApi.exportRequirePoints(this.searchForm)

        // 创建下载链接
        const blob = new Blob([response.data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url

        // 从响应头获取文件名，如果没有则使用默认名称
        const contentDisposition = response.headers['content-disposition']
        let fileName = '需求点数据.xlsx'
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = decodeURIComponent(fileNameMatch[1].replace(/['"]/g, ''))
          }
        }

        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        this.$message.success('导出成功')
      } catch (error) {
        this.$message.error('导出失败: ' + (error.message || '未知错误'))
      }
    },

    // 下载导入模板
    async handleDownloadTemplate() {
      try {
        this.$message.info('正在下载模板...')

        const response = await requireRepositoryApi.downloadImportTemplate()

        // 检查响应数据
        if (!response.data) {
          throw new Error('服务器返回空数据')
        }

        // 创建下载链接
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = '需求点导入模板.xlsx'
        link.style.display = 'none'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // 清理URL对象
        setTimeout(() => {
          window.URL.revokeObjectURL(url)
        }, 100)

        this.$message.success('模板下载成功')
      } catch (error) {

        let errorMessage = '下载模板失败'
        if (error.response?.status === 404) {
          errorMessage = '模板文件不存在，请联系管理员'
        } else if (error.response?.status === 500) {
          errorMessage = '服务器错误，请稍后重试'
        } else if (error.response?.status === 403) {
          errorMessage = '没有权限下载模板文件'
        } else if (error.message) {
          errorMessage = error.message
        }

        this.$message.error(errorMessage)
      }
    }
  }
    }
</script>

<style scoped>
.require-repository-container {
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

/* 搜索表单样式 - 参考testSystem.vue */
#search .el-input, #search .el-select{
  width: 100%;
  margin-right: 10px;
}

#search .el-input__inner {
  width: 100% !important;
  height: 24px !important;
  line-height: 24px !important;
}

#search .el-select .el-input__inner {
  width: 100% !important;
  height: 24px !important;
  line-height: 24px !important;
}

/* 按钮样式调整 */
#search .el-button {
  padding: 6px 8px;
  font-size: 11px;
  margin-left: 2px;
}

/* 小字体样式 - 查询条件输入框 */
.search-input-small .el-input__inner {
  font-size: 10px !important;
  padding: 0 6px !important;
}

.search-select-small .el-input__inner {
  font-size: 10px !important;
  padding: 0 6px !important;
}

.search-select-small .el-select-dropdown__item {
  font-size: 10px !important;
  padding: 4px 8px !important;
}

.search-button-small {
  font-size: 10px !important;
  padding: 3px 6px !important;
  height: 24px !important;
}

.el-card{
  margin-bottom: 10px;
}

/* 减少查询条件间距 */
#search .el-row {
  margin-bottom: 0px !important;
}

#search .el-col {
  margin-bottom: 0px !important;
}

.action-section {
  padding: 16px 20px;
  border-bottom: 1px solid #e6e6e6;
  background: #fafafa;
}

.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
  max-height: calc(100vh - 200px);
  width: 100%;
}

/* 表格容器水平滚动 - 参考testSystem.vue */
.table-wrapper {
  width: 100%;
  overflow-x: auto !important;
  overflow-y: auto !important;
  margin: 0;
  padding: 0;
}

.table-wrapper .el-table {
  min-width: 1400px !important;
  width: 1400px !important;
}

/* 强制覆盖Element UI的默认样式 */
.el-table {
  min-width: 1400px !important;
  width: 1400px !important;
}

/* 表格选中行高亮颜色 */
.el-table__body tr.current-row > td {
  background-color: #b3d9ff !important;
}

/* 鼠标悬停时保持选中行的颜色不变 */
.el-table__body tr.current-row:hover > td {
  background-color: #b3d9ff !important;
}

/* 未选中行的悬停效果 */
.el-table__body tr:not(.current-row):hover > td {
  background-color: #f5f7fa !important;
}


/* 固定表头样式优化 */
.el-table .el-table__header-wrapper {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 表格容器样式 */
.el-table {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

/* 表头样式 */
.el-table th {
  background-color: #fafafa;
  font-weight: 600;
}

/* 表格样式 - 使用 ::v-deep 确保样式优先级 */
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

.table-wrapper ::v-deep .el-table th {
  padding: 0px 0 !important;
  font-size: 12px !important;
  font-weight: 500;
  height: 24px !important;
  line-height: 24px !important;
}

.table-wrapper ::v-deep .el-table td {
  padding: 0px 0 !important;
  font-size: 12px !important;
  height: 24px !important;
  line-height: 24px !important;
}

/* 使用更强的选择器覆盖Element UI默认样式 */
::v-deep .el-table th,
::v-deep .el-table td {
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 !important;
  font-size: 12px !important;
}

/* 针对表格行 */
.el-table__row {
  height: 24px !important;
}

/* 强制覆盖Element UI的列高度 */
::v-deep .el-table__header-wrapper .el-table th,
::v-deep .el-table__body-wrapper .el-table td,
::v-deep .el-table__footer-wrapper .el-table td {
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 !important;
  font-size: 12px !important;
}

/* 针对具体的列 */
::v-deep .el-table .el-table__header th,
::v-deep .el-table .el-table__body td {
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 !important;
  font-size: 12px !important;
}

/* 覆盖所有可能的表格列样式 */
.el-table .el-table__column {
  height: 24px !important;
}

/* 强制设置表格行高 */
::v-deep .el-table tbody tr,
::v-deep .el-table thead tr {
  height: 24px !important;
}

::v-deep .el-table__row {
  height: 24px !important;
}

::v-deep .el-table .cell {
  padding: 0 8px !important;
  line-height: 24px !important;
  font-size: 12px !important;
}

.table-wrapper ::v-deep .el-table .cell {
  padding: 0 3px;
  line-height: 1.1;
  height: 24px;
  display: flex;
  align-items: center;
  font-size: 12px !important;
}

/* 调整按钮大小 - 使用 ::v-deep 确保样式优先级 */
::v-deep .el-button--mini {
  height: 20px !important;
  padding: 0 5px !important;
  font-size: 10px !important;
  line-height: 20px !important;
}

.table-wrapper ::v-deep .el-button--mini {
  padding: 1px 4px;
  font-size: 10px !important;
  margin: 1px 2px;
  height: 20px !important;
}

/* 调整操作按钮区域的大小 */
.action-section ::v-deep .el-button {
  font-size: 12px;
  padding: 6px 12px;
  height: 28px;
}

.action-section ::v-deep .el-button i {
  font-size: 12px;
}

/* 调整标签大小 - 使用 ::v-deep 确保样式优先级 */
::v-deep .el-tag--mini {
  height: 16px !important;
  line-height: 16px !important;
  font-size: 10px !important;
}

.table-wrapper ::v-deep .el-tag {
  font-size: 10px !important;
  padding: 1px 3px;
  height: 16px !important;
  line-height: 16px !important;
}

.pagination-container {
  padding: 16px 20px;
  text-align: right;
  border-top: 1px solid #e6e6e6;
  background: #fafafa;
}

.dialog-footer {
  text-align: right;
}

/* 导入对话框样式 */

/* 响应式布局 */
@media (max-width: 1400px) {
  .left-panel {
    width: 260px;
  }
}

@media (max-width: 1200px) {
  .left-panel {
    width: 240px;
  }

  .search-form .el-row .el-col {
    margin-bottom: 10px;
  }
}

@media (max-width: 992px) {
  .left-panel {
    width: 220px;
  }

  .search-section {
    padding: 16px;
  }

  .search-form .el-row .el-col {
    margin-bottom: 8px;
  }
}

@media (max-width: 768px) {
  .require-repository-container {
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

  .search-section {
    padding: 12px;
  }

  .search-form .el-row .el-col {
    margin-bottom: 12px;
  }

  /* 小屏幕下调整列宽 */
  .search-form .el-row:first-child .el-col:first-child {
    flex: 0 0 50%;
  }

  .search-form .el-row:first-child .el-col:last-child {
    flex: 0 0 50%;
  }
}

@media (max-width: 576px) {
  /* 超小屏幕下垂直布局 */
  .search-form .el-row .el-col {
    margin-bottom: 12px;
  }

  .search-form .el-row:first-child .el-col:last-child {
    text-align: left;
  }
}

/* 查看详情对话框样式 */
.view-detail {
  padding: 20px 0;
}

.view-form {
  max-width: 100%;
}

.view-input {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
}

.view-input .el-textarea__inner {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  color: #606266;
  cursor: default;
}

.view-select {
  width: 100%;
}

.view-select .el-input__inner {
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  color: #606266;
  cursor: default;
}

.view-text {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

/* 删除确认对话框样式 */
.delete-confirm {
  padding: 20px 0;
}

.delete-warning {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #303133;
}
</style>
