<template>
  <div class="usecase-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button
          type="text"
          icon="el-icon-arrow-left"
          @click="goBack"
          class="back-button"
        >
          返回用例管理
        </el-button>
        <div class="page-title">
          <i class="el-icon-document"></i>
          <span v-if="mode === 'edit'">编辑用例</span>
          <span v-else-if="mode === 'create'">新建用例</span>
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
          @click="saveUsecase"
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
          @click="createUsecase"
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

    <!-- 用例详情内容 -->
    <div class="detail-content" v-loading="loading">
      <el-form
        ref="usecaseForm"
        :model="usecaseForm"
        :rules="usecaseRules"
        label-width="120px"
        :disabled="mode === 'view'"
      >
        <!-- 基本信息 -->
        <el-card class="info-card" shadow="never">
          <div slot="header" class="card-header">
            <i class="el-icon-info"></i>
            <span>基本信息</span>
          </div>

          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="用例名称" prop="usecaseName">
                <span v-if="mode === 'view'" class="view-text">{{ usecaseForm.usecaseName || '-' }}</span>
                <el-input
                  v-else
                  v-model="usecaseForm.usecaseName"
                  placeholder="请输入用例名称"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="用例类型" prop="usecaseType">
                <span v-if="mode === 'view'" class="view-text">{{ usecaseTypeText }}</span>
                <el-select
                  v-else
                  v-model="usecaseForm.usecaseType"
                  placeholder="请选择用例类型"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in usecaseTypeOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                    :value="item.dataValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="测试要点" prop="testPoint">
                <span v-if="mode === 'view'" class="view-text">{{ testPointText }}</span>
                <el-select
                  v-else
                  v-model="usecaseForm.testPoint"
                  placeholder="请选择测试要点"
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
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="用例性质" prop="usecaseNature">
                <span v-if="mode === 'view'" class="view-text">{{ usecaseNatureText }}</span>
                <el-select
                  v-else
                  v-model="usecaseForm.usecaseNature"
                  placeholder="请选择用例性质"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in usecaseNatureOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                    :value="item.dataValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="优先级" prop="prority">
                <span v-if="mode === 'view'" class="view-text">{{ prorityText }}</span>
                <el-select
                  v-else
                  v-model="usecaseForm.prority"
                  placeholder="请选择优先级"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in prorityOptions"
                    :key="item.dataValue"
                    :label="item.dataName"
                    :value="item.dataValue"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="是否冒烟测试">
                <span v-if="mode === 'view'" class="view-text">
                  <el-tag :type="usecaseForm.isSmokeTest === '1' ? 'success' : 'info'" size="small">
                    {{ usecaseForm.isSmokeTest === '1' ? '是' : '否' }}
                  </el-tag>
                </span>
                <el-select
                  v-else
                  v-model="usecaseForm.isSmokeTest"
                  placeholder="请选择是否冒烟测试"
                  clearable
                  style="width: 100%"
                >
                  <el-option label="是" value="1" />
                  <el-option label="否" value="0" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="执行状态">
                <span v-if="mode === 'view'" class="view-text">{{ latestExeStatusText }}</span>
                <span v-else class="view-text">{{ latestExeStatusText || '-' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 测试内容 -->
        <el-card class="info-card" shadow="never">
          <div slot="header" class="card-header">
            <i class="el-icon-edit-outline"></i>
            <span>测试内容</span>
          </div>

          <div class="test-content-table-wrapper">
            <table class="test-content-table" border="1">
              <thead>
                <tr>
                  <th>前置条件</th>
                  <th>测试数据</th>
                  <th>测试步骤*</th>
                  <th>预期结果*</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span v-if="mode === 'view'" class="table-cell-text">{{ usecaseForm.precondition || '' }}</span>
                    <el-form-item v-else prop="precondition" class="table-form-item">
                      <el-input
                        v-model="usecaseForm.precondition"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入前置条件"
                        maxlength="1000"
                        show-word-limit
                        class="table-cell-input"
                      />
                    </el-form-item>
                  </td>
                  <td>
                    <span v-if="mode === 'view'" class="table-cell-text">{{ usecaseForm.testData || '' }}</span>
                    <el-form-item v-else prop="testData" class="table-form-item">
                      <el-input
                        v-model="usecaseForm.testData"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入测试数据"
                        maxlength="1000"
                        show-word-limit
                        class="table-cell-input"
                      />
                    </el-form-item>
                  </td>
                  <td>
                    <span v-if="mode === 'view'" class="table-cell-text">{{ usecaseForm.testStep || '' }}</span>
                    <el-form-item v-else prop="testStep" class="table-form-item">
                      <el-input
                        v-model="usecaseForm.testStep"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入测试步骤"
                        maxlength="2000"
                        show-word-limit
                        class="table-cell-input"
                      />
                    </el-form-item>
                  </td>
                  <td>
                    <span v-if="mode === 'view'" class="table-cell-text">{{ usecaseForm.expectedResult || '' }}</span>
                    <el-form-item v-else prop="expectedResult" class="table-form-item">
                      <el-input
                        v-model="usecaseForm.expectedResult"
                        type="textarea"
                        :rows="4"
                        placeholder="请输入预期结果"
                        maxlength="2000"
                        show-word-limit
                        class="table-cell-input"
                      />
                    </el-form-item>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>

        <!-- 其他信息 -->
        <el-card class="info-card" shadow="never">
          <div slot="header" class="card-header">
            <i class="el-icon-user"></i>
            <span>其他信息</span>
          </div>

          <el-row :gutter="12">
            <el-col :span="6">
              <el-form-item label="创建人">
                <span class="view-text">{{ usecaseForm.creator || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="创建时间">
                <span class="view-text">{{ formatTime(usecaseForm.createTime) || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="修改人">
                <span class="view-text">{{ usecaseForm.modifier || '-' }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="修改时间">
                <span class="view-text">{{ formatTime(usecaseForm.modifyTime) || '-' }}</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>
      </el-form>
    </div>
  </div>
</template>

<script>
import usecaseApi from '@/api/test/usecaseManage/usecaseRepository'
import dictionaryApi from '@/api/framework/dictionary'
import { formatTime } from '@/utils/index'

export default {
  name: 'UsecaseDetail',

  data() {
    return {
      // 页面模式：view(查看)、edit(编辑)、create(新建)
      mode: 'view',

      // 用例ID
      usecaseId: null,

      // 加载状态
      loading: false,

      // 保存状态
      saving: false,

      // 表单数据
      usecaseForm: {
        usecaseId: '',
        directoryId: '',
        usecaseName: '',
        usecaseType: '',
        testPoint: '',
        usecaseNature: '',
        prority: '',
        isSmokeTest: '',
        latestExeStatus: '',
        precondition: '',
        testData: '',
        testStep: '',
        expectedResult: '',
        creator: '',
        creatorId: '',
        createTime: '',
        modifier: '',
        modifierId: '',
        modifyTime: '',
        systemId: '',
        workPackageId: null
      },

      // 表单验证规则
      usecaseRules: {
        usecaseName: [
          { required: true, message: '请输入用例名称', trigger: 'blur' },
          { min: 1, max: 200, message: '用例名称长度在 1 到 200 个字符', trigger: 'blur' }
        ],
        usecaseType: [
          { required: true, message: '请选择用例类型', trigger: 'change' }
        ],
        usecaseNature: [
          { required: true, message: '请选择用例性质', trigger: 'change' }
        ],
        testStep: [
          { required: true, message: '请输入测试步骤', trigger: 'blur' }
        ],
        expectedResult: [
          { required: true, message: '请输入预期结果', trigger: 'blur' }
        ]
      },

      // 数据字典选项
      usecaseTypeOptions: [],
      testPointOptions: [],
      usecaseNatureOptions: [],
      prorityOptions: []
    }
  },

  computed: {
    // 用例类型文本
    usecaseTypeText() {
      const item = this.usecaseTypeOptions.find(option => option.dataValue === this.usecaseForm.usecaseType)
      return item ? item.dataName : (this.usecaseForm.usecaseTypeName || this.usecaseForm.usecaseType || '-')
    },

    // 测试要点文本
    testPointText() {
      const item = this.testPointOptions.find(option => option.dataValue === this.usecaseForm.testPoint)
      return item ? item.dataName : (this.usecaseForm.testPointName || this.usecaseForm.testPoint || '-')
    },

    // 用例性质文本
    usecaseNatureText() {
      const item = this.usecaseNatureOptions.find(option => option.dataValue === this.usecaseForm.usecaseNature)
      return item ? item.dataName : (this.usecaseForm.usecaseNatureName || this.usecaseForm.usecaseNature || '-')
    },

    // 优先级文本
    prorityText() {
      const item = this.prorityOptions.find(option => option.dataValue === this.usecaseForm.prority)
      return item ? item.dataName : (this.usecaseForm.prorityName || this.usecaseForm.prority || '-')
    },

    // 执行状态文本
    latestExeStatusText() {
      return this.usecaseForm.latestExeStatusName || this.usecaseForm.latestExeStatus || '-'
    }
  },

  async created() {
    // 获取路由参数
    this.parseRouteParams()

    // 加载数据字典
    await this.loadDictionaryData()

    // 根据模式加载数据
    if (this.mode === 'create') {
      this.initCreateForm()
    } else if (this.usecaseId) {
      await this.loadUsecaseDetail()
    }
  },

  methods: {
    // 解析路由参数
    parseRouteParams() {
      const { mode, id } = this.$route.query
      this.mode = mode || 'view'
      this.usecaseId = id || null
    },

    // 加载数据字典
    async loadDictionaryData() {
      try {
        const [usecaseTypeRes, testPointRes, usecaseNatureRes, prorityRes] = await Promise.all([
          dictionaryApi.getDictionaryList('usecaseType'),
          dictionaryApi.getDictionaryList('testPoint'),
          dictionaryApi.getDictionaryList('usecaseNature'),
          dictionaryApi.getDictionaryList('prority')
        ])

        this.usecaseTypeOptions = usecaseTypeRes.data || []
        this.testPointOptions = testPointRes.data || []
        this.usecaseNatureOptions = usecaseNatureRes.data || []
        this.prorityOptions = prorityRes.data || []
      } catch (error) {
        console.error('加载数据字典失败:', error)
        this.$message.error('加载数据字典失败')
      }
    },

    // 初始化新建表单
    initCreateForm() {
      const { directoryId, systemId } = this.$route.query
      this.usecaseForm = {
        usecaseId: '',
        directoryId: directoryId || '',
        usecaseName: '',
        usecaseType: '',
        testPoint: '',
        usecaseNature: '',
        prority: '',
        isSmokeTest: '',
        latestExeStatus: '',
        precondition: '',
        testData: '',
        testStep: '',
        expectedResult: '',
        creator: '',
        creatorId: '',
        createTime: '',
        modifier: '',
        modifierId: '',
        modifyTime: '',
        systemId: systemId || '',
        workPackageId: null
      }
    },

    // 加载用例详情
    async loadUsecaseDetail() {
      try {
        this.loading = true
        const response = await usecaseApi.getUsecaseDetail(this.usecaseId)
        if (response.code === 20000 && response.data) {
          // 直接使用后端返回的数据，确保所有字段都被正确映射
          this.usecaseForm = {
            ...this.usecaseForm,
            ...response.data
          }
        } else {
          this.$message.error(response.message || '加载用例详情失败')
        }
      } catch (error) {
        console.error('加载用例详情失败:', error)
        this.$message.error('加载用例详情失败: ' + (error.response?.data?.message || error.message))
      } finally {
        this.loading = false
      }
    },

    // 切换到编辑模式
    switchToEdit() {
      this.mode = 'edit'
      this.$router.replace({
        query: { ...this.$route.query, mode: 'edit' }
      })
    },

    // 保存用例
    async saveUsecase() {
      try {
        await this.$refs.usecaseForm.validate()

        this.saving = true
        const response = await usecaseApi.updateUsecase(this.usecaseId, this.usecaseForm)

        if (response.code === 20000) {
          this.$message.success('用例保存成功')
          this.mode = 'view'
          this.$router.replace({
            query: { ...this.$route.query, mode: 'view' }
          })
          // 重新加载数据
          await this.loadUsecaseDetail()
        } else {
          this.$message.error(response.message || '保存失败')
        }
      } catch (error) {
        if (error.message) {
          this.$message.error(error.message)
        } else {
          console.error('保存用例失败:', error)
          this.$message.error('保存失败: ' + (error.response?.data?.message || error.message))
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
        this.loadUsecaseDetail()
      }).catch(() => {
        // 用户取消
      })
    },

    // 创建用例
    async createUsecase() {
      try {
        await this.$refs.usecaseForm.validate()

        this.saving = true
        const response = await usecaseApi.createUsecase(this.usecaseForm)

        if (response.code === 20000) {
          this.$message.success('用例创建成功')
          // 跳转到查看页面
          if (response.data && response.data.usecaseId) {
            this.usecaseId = response.data.usecaseId
            this.mode = 'view'
            this.$router.replace({
              query: { ...this.$route.query, mode: 'view', id: this.usecaseId }
            })
            // 重新加载数据
            await this.loadUsecaseDetail()
          } else {
            // 如果没有返回ID，返回列表页
            this.goBack()
          }
        } else {
          this.$message.error(response.message || '创建失败')
        }
      } catch (error) {
        if (error.message) {
          this.$message.error(error.message)
        } else {
          console.error('创建用例失败:', error)
          this.$message.error('创建失败: ' + (error.response?.data?.message || error.message))
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

    // 返回用例管理页面
    goBack() {
      // 使用浏览器后退功能，保持原页面状态不刷新
      this.$router.go(-1)
    },

    // 格式化日期时间
    formatTime(dateTime) {
      return formatTime(dateTime)
    }
  }
}
</script>

<style lang="scss" scoped>
.usecase-detail-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 6px 14px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 36px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-button {
  font-size: 12px;
  color: #606266;
  padding: 0;
  height: auto;
  line-height: 1.2;

  &:hover {
    color: #409eff;
  }
}

.page-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;

  i {
    color: #409eff;
    font-size: 14px;
  }
}

.header-right {
  display: flex;
  gap: 6px;

  ::v-deep .el-button {
    font-size: 12px;
    padding: 5px 11px;
    height: 26px;
    line-height: 1.2;

    &.el-button--small {
      padding: 3px 9px;
      font-size: 11px;
      height: 22px;
      line-height: 1.2;
    }
  }
}

.detail-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-card {
  margin-bottom: 12px;
  border: 1px solid #ebeef5;

  &:last-child {
    margin-bottom: 0;
  }

  // 基本信息和其他信息卡片内容区域紧凑
  ::v-deep .el-card__body {
    padding: 10px 18px;
  }

  // 卡片头部高度减小
  ::v-deep .el-card__header {
    padding: 4px 18px;
    border-bottom: 1px solid #ebeef5;
  }

  // 减小行间距
  .el-row {
    margin-bottom: 0;
  }

  .el-col {
    margin-bottom: 0;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: #303133;
  font-size: 12px;
  line-height: 1.1;
  padding: 2px 0;
  min-height: 20px;

  i {
    color: #409eff;
    font-size: 13px;
  }
}

// 表单项样式优化 - 基本信息和其他信息部分紧凑
.info-card .el-form-item {
  margin-bottom: 8px;
}

// 使用 ::v-deep 穿透 scoped 样式，确保样式应用到 Element UI 组件
::v-deep .el-form-item__label {
  text-align: right;
  vertical-align: middle;
  float: left;
  font-weight: 600 !important;
  color: #606266;
  font-size: 12px !important;
  line-height: 40px !important;
  padding: 0 12px 0 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  height: auto;
}

// 确保基本信息部分的label字体大小与测试内容表格表头一致
.info-card ::v-deep .el-form-item__label {
  text-align: right;
  vertical-align: middle;
  float: left;
  font-weight: 600 !important;
  font-size: 12px ;
  line-height: 30px ;
  padding: 0 12px 0 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  height: auto;
}

// 查看模式文本样式 - 字体更小，行距更紧凑
.view-text {
  display: inline-block;
  padding: 4px 10px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  color: #606266;
  font-size: 11px;
  min-height: 28px;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;
  white-space: pre-wrap;
  word-break: break-word;

  // 标签字体也变小
  .el-tag {
    font-size: 12px;
    padding: 2px 8px;
    height: 22px;
    line-height: 18px;
  }
}

.view-textarea {
  min-height: 80px;
  white-space: pre-wrap;
  word-break: break-word;
}

// 输入框样式 - 基本信息和其他信息部分字体更小
.info-card .el-input__inner,
.info-card .el-textarea__inner {
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  font-size: 13px;
  padding: 4px 10px;
  height: 28px;
  line-height: 1.4;

  &:focus {
    border-color: #409eff;
  }
}

.info-card .el-textarea__inner {
  min-height: 60px;
  padding: 4px 10px;
  line-height: 1.4;
}

// 选择器样式
.el-select {
  width: 100%;

  .el-input__inner {
    font-size: 13px;
    height: 28px;
    line-height: 1.4;
  }

  // 下拉选项字体也变小
  ::v-deep .el-select-dropdown__item {
    font-size: 13px;
    height: 32px;
    line-height: 32px;
    padding: 0 20px;
  }
}

// 禁用状态样式
.el-form--disabled .el-input__inner,
.el-form--disabled .el-textarea__inner,
.el-form--disabled .el-select .el-input__inner {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
}

// 测试内容表格样式
.test-content-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.test-content-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #000;
  background: white;

  thead {
    background-color: #fff;

    th {
      padding: 5px 8px;
      text-align: center;
      font-weight: 500;
      color: #303133;
      background-color: #fff;
      border: 1px solid #000;
      font-size: 12px;
      white-space: nowrap;
      line-height: 1.2;
      height: 28px;
    }
  }

  tbody {
    td {
      padding: 0;
      border: 1px solid #000;
      vertical-align: top;
      position: relative;

      .table-cell-text {
        display: block;
        min-height: 40px;
        padding: 5px 8px;
        color: #606266;
        font-size: 12px;
        line-height: 1.2;
        white-space: pre-wrap;
        word-break: break-word;
        width: 100%;
        box-sizing: border-box;
      }

      .table-form-item {
        margin: 0;
        padding: 5px 8px;

        ::v-deep .el-form-item__content {
          margin-left: 0 !important;
        }

        ::v-deep .el-form-item__error {
          position: absolute;
          bottom: 2px;
          left: 8px;
          padding-top: 0;
          font-size: 10px;
          line-height: 1;
        }

        .table-cell-input {
          width: 100%;

          ::v-deep .el-textarea__inner {
            border: none;
            padding: 0;
            resize: vertical;
            min-height: 40px;
            font-size: 12px;
            line-height: 1.2;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .usecase-detail-container {
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
