<template>
  <div class="execution-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button
          type="text"
          icon="el-icon-arrow-left"
          @click="goBack"
          class="back-button"
        >
          返回执行库
        </el-button>
        <div class="page-title">
          <span>执行用例:{{ executionForm.usecaseExecutionId || executionForm.usecaseId }}</span>
        </div>
      </div>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
      <el-tab-pane label="执行用例" name="execution">
        <template slot="label">
          <span>执行用例</span>
        </template>
        
        <!-- 执行用例内容 -->
        <div class="execution-content" v-loading="loading">
          <!-- 基本信息表单 -->
          <el-card class="info-card" shadow="never">
            <el-form
              ref="executionFormRef"
              :model="executionForm"
              :rules="executionRules"
              label-width="120px"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用例编号" prop="usecaseExecutionId">
                    <el-input
                      v-model="executionForm.usecaseExecutionId"
                      :disabled="true"
                      placeholder="用例编号"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="用例名称" prop="usecaseName">
                    <el-input
                      v-model="executionForm.usecaseName"
                      :disabled="true"
                      placeholder="用例名称"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="前置条件" prop="precondition">
                    <el-input
                      v-model="executionForm.precondition"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入前置条件"
                      :disabled="isViewMode"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="用例概述" prop="usecaseOverview">
                    <el-input
                      v-model="executionForm.usecaseOverview"
                      :disabled="true"
                      placeholder="用例概述"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="备注" prop="remark">
                    <el-input
                      v-model="executionForm.remark"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入备注"
                      :disabled="isViewMode"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="执行备注" prop="executionRemark">
                    <el-input
                      v-model="executionForm.executionRemark"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入执行备注"
                      :disabled="isViewMode"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="执行过程附件">
                    <el-upload
                      ref="attachmentUpload"
                      :action="uploadAction"
                      :headers="uploadHeaders"
                      :file-list="fileList"
                      :on-success="handleUploadSuccess"
                      :on-error="handleUploadError"
                      :before-upload="beforeUpload"
                      :disabled="isViewMode"
                      :auto-upload="true"
                      multiple
                    >
                      <el-button size="small" type="primary" :disabled="isViewMode">上传</el-button>
                      <div slot="tip" class="el-upload__tip">支持上传多个文件</div>
                    </el-upload>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>

          <!-- 用例步骤列表 -->
          <el-card class="steps-card" shadow="never">
            <div slot="header" class="card-header">
              <span>用例步骤列表</span>
              <el-button
                v-if="!isViewMode"
                type="primary"
                size="small"
                icon="el-icon-plus"
                @click="handleAddStep"
                style="float: right;"
              >
                添加步骤
              </el-button>
            </div>

            <el-table
              :data="stepList"
              border
              stripe
              style="width: 100%"
              :max-height="400"
            >
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="testStep" label="步骤描述" min-width="200" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-input
                    v-if="!isViewMode"
                    v-model="scope.row.testStep"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入步骤描述"
                    @blur="handleStepChange(scope.$index)"
                  />
                  <span v-else>{{ scope.row.testStep || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="expectedResult" label="预期结果" min-width="200" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-input
                    v-if="!isViewMode"
                    v-model="scope.row.expectedResult"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入预期结果"
                    @blur="handleStepChange(scope.$index)"
                  />
                  <span v-else>{{ scope.row.expectedResult || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="testData" label="测试数据" min-width="150" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-input
                    v-if="!isViewMode"
                    v-model="scope.row.testData"
                    placeholder="请输入测试数据"
                    @blur="handleStepChange(scope.$index)"
                  />
                  <span v-else>{{ scope.row.testData || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="actualResult" label="实际结果" min-width="200" show-overflow-tooltip>
                <template slot-scope="scope">
                  <el-input
                    v-if="!isViewMode"
                    v-model="scope.row.actualResult"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入实际结果"
                    @blur="handleStepChange(scope.$index)"
                  />
                  <span v-else>{{ scope.row.actualResult || '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="runStatus" label="执行结果" width="120" align="center">
                <template slot-scope="scope">
                  <el-select
                    v-if="!isViewMode"
                    v-model="scope.row.runStatus"
                    placeholder="请选择"
                    size="small"
                    @change="handleStepChange(scope.$index)"
                  >
                    <el-option
                      v-for="item in runStatusOptions"
                      :key="item.dataValue"
                      :label="item.dataName"
                      :value="item.dataValue"
                    />
                  </el-select>
                  <el-tag v-else :type="getRunStatusType(scope.row.runStatus)" size="mini">
                    {{ getRunStatusName(scope.row.runStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center" v-if="!isViewMode">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    icon="el-icon-delete"
                    @click="handleDeleteStep(scope.$index)"
                    style="color: #f56c6c;"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="关联的缺陷" name="defects">
        <template slot="label">
          <span>关联的缺陷</span>
        </template>
        <div class="tab-content">
          <el-alert
            title="功能开发中"
            type="info"
            :closable="false"
            show-icon>
          </el-alert>
        </div>
      </el-tab-pane>

      <el-tab-pane label="历史运行记录" name="history">
        <template slot="label">
          <span>历史运行记录</span>
        </template>
        <div class="tab-content">
          <el-alert
            title="功能开发中"
            type="info"
            :closable="false"
            show-icon>
          </el-alert>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 底部操作栏 -->
    <div class="bottom-action-bar">
      <el-button
        type="primary"
        icon="el-icon-document"
        @click="handleSave"
        :loading="saving"
        :disabled="isViewMode"
      >
        保存
      </el-button>
      <el-button
        type="success"
        icon="el-icon-check"
        @click="handlePass"
        :loading="saving"
        :disabled="isViewMode"
      >
        通过
      </el-button>
      <el-button
        type="danger"
        icon="el-icon-close"
        @click="handleFail"
        :loading="saving"
        :disabled="isViewMode"
      >
        失败
      </el-button>
      <el-button
        type="info"
        icon="el-icon-data-line"
        @click="handleStatistics"
        :disabled="isViewMode"
      >
        统计
      </el-button>
    </div>
  </div>
</template>

<script>
import usecaseExecutionApi from '@/api/test/usecaseManage/usecaseExecution'
import dictionaryApi from '@/api/framework/dictionary'
import { getToken } from '@/utils/auth'

export default {
  name: 'executionDetail',
  data() {
    return {
      // 当前激活的标签页
      activeTab: 'execution',

      // 加载状态
      loading: false,
      saving: false,

      // 是否为查看模式
      isViewMode: false,

      // 执行表单数据
      executionForm: {
        usecaseExecutionId: '',
        usecaseId: '',
        directoryId: '',
        usecaseName: '',
        usecaseOverview: '',
        precondition: '',
        remark: '',
        executionRemark: '',
        planExecutionDate: '',
        actExecutionTime: '',
        runStatus: '',
        runStatusName: '',
        planExecutorId: '',
        planExecutorName: '',
        actExecutorId: '',
        actExecutorName: '',
        lastExecutionTime: ''
      },

      // 表单验证规则
      executionRules: {
        usecaseExecutionId: [
          { required: true, message: '用例编号不能为空', trigger: 'blur' }
        ]
      },

      // 用例步骤列表
      stepList: [],

      // 执行结果选项
      runStatusOptions: [],

      // 文件上传相关
      uploadAction: '/api/test/usecase/execution/upload',
      uploadHeaders: {
        Authorization: 'Bearer ' + getToken()
      },
      fileList: []
    }
  },

  created() {
    this.loadDictionaryData()
    this.loadExecutionDetail()
  },

  methods: {
    // 加载字典数据
    async loadDictionaryData() {
      try {
        const runStatusRes = await dictionaryApi.getDictionaryList('runStatus')
        this.runStatusOptions = runStatusRes.data || []
      } catch (error) {
        console.error('加载字典数据失败:', error)
      }
    },

    // 加载执行详情
    async loadExecutionDetail() {
      const usecaseExecutionId = this.$route.query.usecaseExecutionId
      const usecaseId = this.$route.query.usecaseId

      if (!usecaseExecutionId && !usecaseId) {
        this.$message.error('缺少必要参数')
        this.goBack()
        return
      }

      this.loading = true
      try {
        const params = {}
        if (usecaseExecutionId) {
          params.usecaseExecutionId = usecaseExecutionId
        }
        if (usecaseId) {
          params.usecaseId = usecaseId
        }

        const response = await usecaseExecutionApi.getExecutionDetail(params)
        if (response.code === 20000 || response.code === 200) {
          const data = response.data || {}
          
          // 填充表单数据
          this.executionForm = {
            usecaseExecutionId: data.usecaseExecutionId || data.usecaseId || '',
            usecaseId: data.usecaseId || '',
            directoryId: data.directoryId || '',
            usecaseName: data.usecaseName || '',
            usecaseOverview: data.usecaseOverview || '',
            precondition: data.precondition || '',
            remark: data.remark || '',
            executionRemark: data.executionRemark || data.remark || '',
            planExecutionDate: data.planExecutionDate || '',
            actExecutionTime: data.actExecutionTime || '',
            runStatus: data.runStatus || '',
            runStatusName: data.runStatusName || '',
            planExecutorId: data.planExecutorId || '',
            planExecutorName: data.planExecutorName || '',
            actExecutorId: data.actExecutorId || '',
            actExecutorName: data.actExecutorName || '',
            lastExecutionTime: data.lastExecutionTime || ''
          }

          // 加载用例步骤列表
          if (data.stepList && Array.isArray(data.stepList)) {
            this.stepList = data.stepList.map((step, index) => ({
              stepIndex: index + 1,
              testStep: step.testStep || '',
              expectedResult: step.expectedResult || '',
              testData: step.testData || '',
              actualResult: step.actualResult || '',
              runStatus: step.runStatus || ''
            }))
          } else if (data.testStep) {
            // 如果后端返回的是单个步骤字符串，需要解析
            this.stepList = this.parseSteps(data.testStep, data.expectedResult, data.testData)
          }

          // 加载附件列表
          if (data.attachments && Array.isArray(data.attachments)) {
            this.fileList = data.attachments.map(att => ({
              name: att.fileName || att.name,
              url: att.fileUrl || att.url
            }))
          }
        } else {
          this.$message.error(response.message || '加载执行详情失败')
        }
      } catch (error) {
        this.$message.error('加载执行详情失败')
        console.error('加载执行详情失败:', error)
      } finally {
        this.loading = false
      }
    },

    // 解析步骤（如果后端返回的是字符串格式）
    parseSteps(testStep, expectedResult, testData) {
      const steps = []
      if (testStep) {
        const stepArray = testStep.split(/\n+/).filter(s => s.trim())
        const resultArray = expectedResult ? expectedResult.split(/\n+/).filter(s => s.trim()) : []
        const dataArray = testData ? testData.split(/\n+/).filter(s => s.trim()) : []

        stepArray.forEach((step, index) => {
          steps.push({
            stepIndex: index + 1,
            testStep: step.trim(),
            expectedResult: resultArray[index] ? resultArray[index].trim() : '',
            testData: dataArray[index] ? dataArray[index].trim() : '',
            actualResult: '',
            runStatus: ''
          })
        })
      }
      return steps
    },

    // 标签页切换
    handleTabClick(tab) {
      if (tab.name === 'defects') {
        // 加载关联的缺陷
        this.loadDefects()
      } else if (tab.name === 'history') {
        // 加载历史运行记录
        this.loadHistory()
      }
    },

    // 加载关联的缺陷
    loadDefects() {
      // TODO: 实现加载关联缺陷的逻辑
    },

    // 加载历史运行记录
    loadHistory() {
      // TODO: 实现加载历史运行记录的逻辑
    },

    // 添加步骤
    handleAddStep() {
      this.stepList.push({
        stepIndex: this.stepList.length + 1,
        testStep: '',
        expectedResult: '',
        testData: '',
        actualResult: '',
        runStatus: ''
      })
    },

    // 删除步骤
    handleDeleteStep(index) {
      this.$confirm('确定要删除此步骤吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.stepList.splice(index, 1)
        // 重新编号
        this.stepList.forEach((step, idx) => {
          step.stepIndex = idx + 1
        })
      }).catch(() => {})
    },

    // 步骤变化处理
    handleStepChange(index) {
      // 可以在这里添加步骤变化的处理逻辑
    },

    // 保存
    async handleSave() {
      this.$refs.executionFormRef.validate(async (valid) => {
        if (!valid) {
          return false
        }

        this.saving = true
        try {
          const params = {
            ...this.executionForm,
            stepList: this.stepList
          }

          const response = await usecaseExecutionApi.saveExecution(params)
          if (response.code === 20000 || response.code === 200) {
            this.$message.success('保存成功')
            // 重新加载数据
            this.loadExecutionDetail()
          } else {
            this.$message.error(response.message || '保存失败')
          }
        } catch (error) {
          this.$message.error('保存失败')
          console.error('保存失败:', error)
        } finally {
          this.saving = false
        }
      })
    },

    // 通过
    async handlePass() {
      await this.updateRunStatus('1', '通过')
    },

    // 失败
    async handleFail() {
      await this.updateRunStatus('2', '失败')
    },

    // 更新执行状态
    async updateRunStatus(runStatus, statusName) {
      this.saving = true
      try {
        const params = {
          usecaseExecutionId: this.executionForm.usecaseExecutionId,
          runStatus: runStatus
        }

        const response = await usecaseExecutionApi.updateRunStatus(params)
        if (response.code === 20000 || response.code === 200) {
          this.$message.success(`${statusName}成功`)
          this.executionForm.runStatus = runStatus
          this.executionForm.runStatusName = statusName
        } else {
          this.$message.error(response.message || `${statusName}失败`)
        }
      } catch (error) {
        this.$message.error(`${statusName}失败`)
        console.error(`${statusName}失败:`, error)
      } finally {
        this.saving = false
      }
    },

    // 统计
    handleStatistics() {
      this.$message.info('统计功能开发中')
    },

    // 上传前检查
    beforeUpload(file) {
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB!')
        return false
      }
      return true
    },

    // 上传成功
    handleUploadSuccess(response) {
      this.$message.success('上传成功')
      if (response.data) {
        this.fileList.push({
          name: response.data.fileName || response.data.name,
          url: response.data.fileUrl || response.data.url
        })
      }
    },

    // 上传失败
    handleUploadError(error) {
      this.$message.error('上传失败')
      console.error('上传失败:', error)
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

    // 获取执行结果名称
    getRunStatusName(runStatus) {
      const option = this.runStatusOptions.find(item => item.dataValue === runStatus)
      return option ? option.dataName : '-'
    },

    // 返回
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.execution-detail-container {
  padding: 10px;
  padding-bottom: 80px; // 为底部操作栏留出空间
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #fff;
  border-radius: 4px;

  .header-left {
    display: flex;
    align-items: center;

    .back-button {
      margin-right: 15px;
      padding: 0;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
}

// 标签页样式
::v-deep .el-tabs--card > .el-tabs__header {
  border-bottom: 1px solid #e4e7ed;
  margin: 0 0 15px 0;
}

::v-deep .el-tabs--card > .el-tabs__header .el-tabs__nav {
  border: 1px solid #e4e7ed;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

::v-deep .el-tabs--card > .el-tabs__header .el-tabs__item {
  border-bottom: 1px solid #e4e7ed;
  border-left: 1px solid #e4e7ed;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

::v-deep .el-tabs--card > .el-tabs__header .el-tabs__item:first-child {
  border-left: none;
}

::v-deep .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
  border-bottom-color: #fff;
  background-color: #fff;
  color: #409eff;
}

.execution-content {
  flex: 1;
  overflow-y: auto;
}

.info-card,
.steps-card {
  margin-bottom: 15px;
  background-color: #fff;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
}

.tab-content {
  padding: 20px;
  background-color: #fff;
  min-height: 200px;
}

// 底部操作栏
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  .el-button {
    margin: 0 10px;
  }
}

// 表格样式
::v-deep .el-table {
  .el-textarea__inner {
    border: none;
    padding: 0;
  }

  .el-input__inner {
    border: none;
    padding: 0;
  }
}
</style>
