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
          <span>执行用例:{{ executionForm.usecaseId || executionForm.usecaseExecutionId }}</span>
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
              label-width="100px"
            >
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="用例ID" prop="usecaseId">
                    <el-input
                      v-model="executionForm.usecaseId"
                      :disabled="true"
                      placeholder="用例ID"
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

              <el-row :gutter="16">
                <el-col :span="6">
                  <el-form-item label="用例类型" prop="usecaseType">
                    <el-input
                      v-model="executionForm.usecaseTypeName"
                      :disabled="true"
                      placeholder="用例类型"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="测试要点" prop="testPoint">
                    <el-input
                      v-model="executionForm.testPointName"
                      :disabled="true"
                      placeholder="测试要点"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="用例性质" prop="usecaseNature">
                    <el-input
                      v-model="executionForm.usecaseNatureName"
                      :disabled="true"
                      placeholder="用例性质"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item label="优先级" prop="prority">
                    <el-input
                      v-model="executionForm.prorityName"
                      :disabled="true"
                      placeholder="优先级"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="执行备注" prop="executionRemark">
                    <el-input
                      v-model="executionForm.executionRemark"
                      placeholder="请输入执行备注"
                      :disabled="isViewMode"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="执行过程附件">
                    <el-upload
                      ref="attachmentUpload"
                      :file-list="fileList"
                      :before-upload="beforeUpload"
                      :on-change="handleFileChange"
                      :on-remove="handleFileRemove"
                      :disabled="isViewMode"
                      :auto-upload="false"
                      :http-request="handleUploadRequest"
                      multiple
                    >
                      <el-button size="small" type="primary" :disabled="isViewMode">选择文件</el-button>
                      <div slot="tip" class="el-upload__tip">支持上传多个文件，文件将在点击'通过'或'失败'时上传</div>
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
            </div>

            <div class="test-content-table-wrapper">
              <table class="test-content-table" border="1">
                <thead>
                  <tr>
                    <th>前置条件</th>
                    <th>测试数据</th>
                    <th>测试步骤</th>
                    <th>预期结果</th>
                    <th>实际结果</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span class="table-cell-text">{{ executionForm.precondition || '-' }}</span>
                    </td>
                    <td>
                      <span class="table-cell-text">{{ mergedTestData }}</span>
                    </td>
                    <td>
                      <span class="table-cell-text">{{ mergedTestStep }}</span>
                    </td>
                    <td>
                      <span class="table-cell-text">{{ mergedExpectedResult }}</span>
                    </td>
                    <td>
                      <el-input
                        v-if="!isViewMode"
                        v-model="mergedActualResult"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入实际结果"
                        @blur="handleActualResultChange"
                        class="table-cell-input"
                      />
                      <span v-else class="table-cell-text">{{ mergedActualResult || '-' }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="关联的缺陷" name="defects">
        <template slot="label">
          <span>关联的缺陷</span>
        </template>
        <execution-related-bugs
          :usecase-execution-id="executionForm.usecaseExecutionId"
          :usecase-id="executionForm.usecaseId"
          :directory-id="executionForm.directoryId"
        />
      </el-tab-pane>

      <el-tab-pane label="历史执行记录" name="history">
        <template slot="label">
          <span>历史执行记录</span>
        </template>
        <execution-history
          v-if="activeTab === 'history'"
          :directory-id="executionForm.directoryId"
          :usecase-id="executionForm.usecaseId"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 底部操作栏 -->
    <div class="bottom-action-bar">
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
        type="warning"
        icon="el-icon-warning"
        @click="handleBlock"
        :loading="saving"
        :disabled="isViewMode"
      >
        阻塞
      </el-button>
      <el-button
        type="info"
        icon="el-icon-minus"
        @click="handleNotApplicable"
        :loading="saving"
        :disabled="isViewMode"
      >
        不适用
      </el-button>
    </div>
  </div>
</template>

<script>
import usecaseExecutionApi from '@/api/test/usecaseManage/usecaseExecution'
import dictionaryApi from '@/api/framework/dictionary'
import attachmentApi from '@/api/framework/attachment'
import ExecutionHistory from './components/executionHistory.vue'
import ExecutionRelatedBugs from './components/executionRelatedBugs.vue'

export default {
  name: 'executionDetail',
  components: {
    ExecutionHistory,
    ExecutionRelatedBugs
  },
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
        usecaseType: '',
        usecaseTypeName: '',
        testPoint: '',
        testPointName: '',
        usecaseNature: '',
        usecaseNatureName: '',
        prority: '',
        prorityName: '',
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
        lastExecutionTime: '',
        usecaseExecutionHistoryId: '' // 用例执行历史记录Id
      },

      // 表单验证规则
      executionRules: {},

      // 用例步骤列表
      stepList: [],

      // 执行结果选项
      runStatusOptions: [],

      // 文件上传相关
      fileList: [],
      // 待上传的文件列表（已选择但未上传的文件）
      pendingFiles: []
    }
  },

  computed: {
    // 合并测试数据
    mergedTestData() {
      if (!this.stepList || this.stepList.length === 0) {
        return '-'
      }
      const testDataList = this.stepList
        .map(step => step.testData)
        .filter(data => data && data.trim())
      return testDataList.length > 0 ? testDataList.join('; ') : '-'
    },

    // 合并测试步骤 - 使用换行符连接，在单元格内换行显示
    mergedTestStep() {
      if (!this.stepList || this.stepList.length === 0) {
        return '-'
      }
      const stepList = this.stepList
        .map(step => {
          if (step.testStep && step.testStep.trim()) {
            return step.testStep.trim()
          }
          return null
        })
        .filter(step => step !== null)
      return stepList.length > 0 ? stepList.join('\n') : '-'
    },

    // 合并预期结果 - 使用换行符连接，在单元格内换行显示
    mergedExpectedResult() {
      if (!this.stepList || this.stepList.length === 0) {
        return '-'
      }
      const resultList = this.stepList
        .map(step => {
          if (step.expectedResult && step.expectedResult.trim()) {
            return step.expectedResult.trim()
          }
          return null
        })
        .filter(result => result !== null)
      return resultList.length > 0 ? resultList.join('\n') : '-'
    },

    // 合并实际结果（用于显示和编辑）- 使用换行符连接，在单元格内换行显示
    mergedActualResult: {
      get() {
        if (!this.stepList || this.stepList.length === 0) {
          return ''
        }
        const resultList = this.stepList
          .map((step, index) => {
            if (step.actualResult && step.actualResult.trim()) {
              return `${index + 1}、${step.actualResult.trim()}`
            }
            return null
          })
          .filter(result => result !== null)
        return resultList.length > 0 ? resultList.join('\n') : ''
      },
      set(value) {
        // 当输入框值改变时，解析并更新到各个步骤中
        if (!value || !value.trim()) {
          // 如果为空，清空所有步骤的实际结果
          this.stepList.forEach(step => {
            step.actualResult = ''
          })
          return
        }

        // 解析输入的值（支持用换行符分隔的格式，可能带序号）
        const parts = value.split(/\n/).map(s => s.trim()).filter(s => s)

        // 更新到各个步骤中
        parts.forEach((part, index) => {
          // 移除序号前缀（如果存在，支持 "1、" 或 "1." 格式）
          const cleanPart = part.replace(/^\d+[、\.]\s*/, '').trim()
          if (this.stepList[index]) {
            this.stepList[index].actualResult = cleanPart
          }
        })

        // 如果输入的行数少于步骤数，清空剩余步骤的实际结果
        for (let i = parts.length; i < this.stepList.length; i++) {
          if (this.stepList[i]) {
            this.stepList[i].actualResult = ''
          }
        }
      }
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
        const [runStatusRes, usecaseTypeRes, testPointRes, usecaseNatureRes, prorityRes] = await Promise.all([
          dictionaryApi.getDictionaryList('runStatus'),
          dictionaryApi.getDictionaryList('usecaseType'),
          dictionaryApi.getDictionaryList('testPoint'),
          dictionaryApi.getDictionaryList('usecaseNature'),
          dictionaryApi.getDictionaryList('prority')
        ])
        this.runStatusOptions = runStatusRes.data || []
        // 这些字典数据用于显示，不需要存储，因为后端会返回Name字段
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
            usecaseType: data.usecaseType || '',
            usecaseTypeName: data.usecaseTypeName || '',
            testPoint: data.testPoint || '',
            testPointName: data.testPointName || '',
            usecaseNature: data.usecaseNature || '',
            usecaseNatureName: data.usecaseNatureName || '',
            prority: data.prority || '',
            prorityName: data.prorityName || '',
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

          // 执行过程附件只在上传时显示，加载详情页时不显示
          // 清空附件列表
          this.fileList = []
          this.pendingFiles = []
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
      // 组件内部会自动加载数据，这里不需要额外处理
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

    // 处理实际结果变化
    handleActualResultChange() {
      // 实际结果的变化已经在 computed 的 setter 中处理了
      // 这里可以添加额外的处理逻辑，比如验证等
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
      // 判断是否上传附件
      if (!this.fileList || this.fileList.length === 0) {
        this.$message.warning('请先上传附件')
        return
      }

      this.saving = true
      try {
        await this.updateRunStatus('通过', '通过')
      } catch (error) {
        // updateRunStatus 内部会处理错误提示
      } finally {
        this.saving = false
      }
    },

    // 失败
    async handleFail() {
      // 判断是否上传附件
      if (!this.fileList || this.fileList.length === 0) {
        this.$message.warning('请先上传附件')
        return
      }
      // 判断是否填写实际结果
      if (!this.stepList || this.stepList.length === 0) {
        this.$message.warning('请先填写用例步骤的实际结果')
        return
      }
      // 检查是否有步骤描述，以及实际结果是否已填写
      const hasSteps = this.stepList.some(step => step.testStep && step.testStep.trim() !== '')
      if (hasSteps) {
        // 检查所有有步骤描述的行，实际结果必须填写
        const stepsWithEmptyResult = this.stepList.filter(step => {
          if (step.testStep && step.testStep.trim() !== '') {
            return !step.actualResult || step.actualResult.trim() === ''
          }
          return false
        })
        if (stepsWithEmptyResult.length > 0) {
          this.$message.warning('请先填写所有步骤的实际结果')
          return
        }
      } else {
        // 如果没有步骤，检查合并的实际结果是否为空
        if (!this.mergedActualResult || this.mergedActualResult.trim() === '') {
          this.$message.warning('请先填写实际结果')
          return
        }
      }

      this.saving = true
      try {
        await this.updateRunStatus('失败', '失败')
      } catch (error) {
        // updateRunStatus 内部会处理错误提示
      } finally {
        this.saving = false
      }
    },

    // 阻塞
    async handleBlock() {
      // 判断是否填写执行备注
      if (!this.executionForm.executionRemark || this.executionForm.executionRemark.trim() === '') {
        this.$message.warning('请先填写执行备注')
        return
      }

      this.saving = true
      try {
        await this.updateRunStatus('阻塞', '阻塞')
      } catch (error) {
        // updateRunStatus 内部会处理错误提示
      } finally {
        this.saving = false
      }
    },

    // 不适用
    async handleNotApplicable() {
      // 判断是否填写执行备注
      if (!this.executionForm.executionRemark || this.executionForm.executionRemark.trim() === '') {
        this.$message.warning('请先填写执行备注')
        return
      }

      this.saving = true
      try {
        await this.updateRunStatus('不适用', '不适用')
      } catch (error) {
        // updateRunStatus 内部会处理错误提示
      } finally {
        this.saving = false
      }
    },

    // 更新执行状态
    async updateRunStatus(runStatus, statusName) {
      try {
        // 准备请求参数，不带附件内容
        const params = {
          usecaseExecutionId: this.executionForm.usecaseExecutionId,
          runStatus: runStatus,
          remark: this.executionForm.executionRemark || '' // 执行备注
        }

        // 调用 usecaseExecutionApi.updateRunStatus
        const response = await usecaseExecutionApi.updateRunStatus(params)

        if (response.code === 20000 || response.code === 200) {
          this.$message.success(`${statusName}成功`)
          this.executionForm.runStatus = runStatus
          this.executionForm.runStatusName = statusName

          // 处理后端返回的用例执行历史记录Id
          let usecaseExecutionHistoryId = null
          if (response.data && response.data.usecaseExecutionHistoryId) {
            usecaseExecutionHistoryId = response.data.usecaseExecutionHistoryId
            this.executionForm.usecaseExecutionHistoryId = usecaseExecutionHistoryId
            console.log('用例执行历史记录ID:', usecaseExecutionHistoryId)
          }

          // 如果有历史记录ID且有附件需要上传，则上传附件
          if (usecaseExecutionHistoryId && this.fileList && this.fileList.length > 0) {
            await this.uploadAttachments(usecaseExecutionHistoryId)
          }
        } else {
          this.$message.error(response.message || `${statusName}失败`)
          throw new Error(response.message || `${statusName}失败`)
        }
      } catch (error) {
        this.$message.error(error.message || `${statusName}失败`)
        console.error(`${statusName}失败:`, error)
        throw error
      }
    },

    // 上传附件到历史记录
    async uploadAttachments(usecaseExecutionHistoryId) {
      try {
        // 获取所有待上传的文件（有 raw 属性的文件）
        const filesToUpload = this.fileList.filter(file => file.raw && file.raw instanceof File)

        if (filesToUpload.length === 0) {
          return
        }

        // 批量上传文件
        const uploadPromises = filesToUpload.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file.raw)
          formData.append('module', 'usecaseExecution')
          formData.append('relateId', usecaseExecutionHistoryId)

          try {
            const response = await attachmentApi.uploadAttachment(formData)

            if (response.code === 20000 || response.code === 200) {
              // 更新文件列表，移除 raw 属性，添加 URL
              const fileIndex = this.fileList.findIndex(f => f.name === file.name && f.raw === file.raw)
              if (fileIndex !== -1) {
                this.fileList[fileIndex] = {
                  name: file.name,
                  url: response.data?.fileUrl || response.data?.url || '',
                  size: file.size,
                  type: file.type,
                  status: 'success'
                }
              }
              return { success: true, fileName: file.name }
            } else {
              console.error(`文件 ${file.name} 上传失败:`, response.message)
              return { success: false, fileName: file.name, error: response.message }
            }
          } catch (error) {
            console.error(`文件 ${file.name} 上传失败:`, error)
            return { success: false, fileName: file.name, error: error.message }
          }
        })

        const results = await Promise.all(uploadPromises)
        const successCount = results.filter(r => r.success).length
        const failCount = results.filter(r => !r.success).length

        if (successCount > 0) {
          this.$message.success(`成功上传 ${successCount} 个附件`)
        }
        if (failCount > 0) {
          this.$message.warning(`${failCount} 个附件上传失败`)
        }
      } catch (error) {
        console.error('上传附件失败:', error)
        this.$message.error('附件上传失败')
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

    // 文件选择变化（不立即上传）
    handleFileChange(file, fileList) {
      // 更新 fileList，确保所有选择的文件都显示在界面上
      // Element UI 的 el-upload 组件会自动管理 fileList，我们需要同步更新
      this.fileList = fileList.map(f => {
        // 如果文件已经有 URL（已上传），保留 URL
        if (f.url || (f.response && f.response.data)) {
          return {
            name: f.name,
            url: f.url || f.response?.data?.fileUrl || f.response?.data?.url,
            uid: f.uid,
            status: f.status || 'success'
          }
        }
        // 如果是新选择的文件（待上传），保留文件对象信息
        return {
          name: f.name,
          uid: f.uid,
          raw: f.raw || f,
          size: f.size,
          status: f.status || 'ready'
        }
      })

      // 更新待上传的文件列表（保存原始文件对象）
      this.pendingFiles = fileList
        .filter(f => !f.url && !f.response && (f.raw || f))
        .map(f => f.raw || f)
        .filter(f => f instanceof File)
    },

    // 自定义上传请求（不立即上传，只是占位）
    handleUploadRequest(options) {
      // 这个方法不会被调用，因为 auto-upload 为 false
      // 文件选择通过 handleFileChange 处理
    },

    // 删除文件
    handleFileRemove(file, fileList) {
      // 更新 fileList
      this.fileList = fileList

      // 从 pendingFiles 中移除对应的文件
      if (file.raw) {
        this.pendingFiles = this.pendingFiles.filter(pf => pf.name !== file.name)
      }

      // 如果文件有 URL，说明是已上传的文件，也需要从列表中移除
      // Element UI 会自动处理，这里只需要同步更新数据
    },

    // 上传待上传的文件（现在只是将文件添加到 fileList，实际上传在 updateRunStatus 中处理）
    async uploadPendingFiles() {
      if (!this.pendingFiles || this.pendingFiles.length === 0) {
        return Promise.resolve([])
      }

      // 将待上传的文件添加到 fileList，文件对象会保留 raw 属性供后续使用
      this.pendingFiles.forEach(file => {
        const fileObj = {
          name: file.name,
          raw: file, // 保存原始文件对象，用于后续上传
          size: file.size,
          type: file.type
        }
        // 检查是否已存在同名文件
        const exists = this.fileList.some(f => f.name === fileObj.name && !f.url)
        if (!exists) {
          this.fileList.push(fileObj)
        }
      })

      // 清空待上传列表
      this.pendingFiles = []
      return []
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
  padding: 8px;
  padding-bottom: 60px; // 为底部操作栏留出空间
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 10px;
  background-color: #fff;
  border-radius: 4px;

  .header-left {
    display: flex;
    align-items: center;

    .back-button {
      margin-right: 10px;
      padding: 0;
      font-size: 11px !important;
    }

    .page-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      line-height: 20px;
    }
  }
}

// 标签页样式
::v-deep .el-tabs--card > .el-tabs__header {
  border-bottom: 1px solid #e4e7ed;
  margin: 0 0 10px 0;
}

::v-deep .el-tabs--card > .el-tabs__header .el-tabs__item {
  font-size: 11px !important;
  height: 32px !important;
  line-height: 32px !important;
  padding: 0 15px !important;
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
  margin-bottom: 10px;
  background-color: #fff;

  ::v-deep .el-card__body {
    padding: 10px 15px !important;
  }

  ::v-deep .el-card__header {
    padding: 8px 15px !important;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 12px !important;
  }
}

// 表单样式
.info-card {
  ::v-deep .el-form-item {
    margin-bottom: 10px !important;
  }

  // 所有 label 基础样式
  ::v-deep .el-form-item__label {
    font-size: 11px !important;
    line-height: 24px !important;
    height: 24px !important;
    padding: 0 !important;
    padding-right: 8px !important;
    font-weight: 600 !important;
    display: flex !important;
    align-items: center !important;
    width: 100px !important;
  }

  // 所有 content 基础样式
  ::v-deep .el-form-item__content {
    line-height: 24px !important;
    display: flex !important;
    align-items: center !important;
  }

  // 单行输入框样式
  ::v-deep .el-input {
    line-height: 24px !important;
  }

  ::v-deep .el-input__inner {
    font-size: 11px !important;
    height: 24px !important;
    line-height: 24px !important;
    padding: 0 8px !important;
  }

  // 文本域样式
  ::v-deep .el-textarea__inner {
    font-size: 11px !important;
    line-height: 1.4 !important;
    padding: 4px 8px !important;
  }

  ::v-deep .el-form-item__error {
    font-size: 10px !important;
    padding-top: 2px !important;
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
  height: 50px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  ::v-deep .el-button {
    margin: 0 8px;
    padding: 0 15px !important;
    font-size: 11px !important;
    height: 28px !important;
    line-height: 28px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    vertical-align: middle !important;

    span {
      line-height: 28px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    i {
      line-height: 28px !important;
      vertical-align: middle !important;
    }
  }
}

// 表格样式 - 参照 usecaseDetail.vue 的表格结构
.steps-card {
  .test-content-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .test-content-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #dcdfe6;
    background: white;
    table-layout: fixed;

    thead {
      background-color: #fff;

      th {
        padding: 5px 8px;
        text-align: center;
        font-weight: 500;
        color: #303133;
        background-color: #fff;
        border: 1px solid #dcdfe6;
        font-size: 12px;
        white-space: nowrap;
        line-height: 1.2;
        height: 28px;
      }

      // 前置条件列
      th:nth-child(1) {
        width: 20%;
      }

      // 测试数据列
      th:nth-child(2) {
        width: 15%;
      }

      // 测试步骤列 - 调小宽度
      th:nth-child(3) {
        width: 20%;
      }

      // 预期结果列 - 调小宽度
      th:nth-child(4) {
        width: 20%;
      }

      // 实际结果列
      th:nth-child(5) {
        width: 25%;
      }
    }

    tbody {
      tr {
        // 移除固定高度，允许根据内容自适应高度
        height: auto !important;
      }

      td {
        padding: 0;
        border: 1px solid #dcdfe6;
        vertical-align: top;
        position: relative;

        .table-cell-text {
          display: block;
          min-height: 28px;
          padding: 5px 8px;
          color: #606266;
          font-size: 12px;
          line-height: 1.4;
          width: 100%;
          box-sizing: border-box;
        }

        .table-cell-input {
          width: 100%;
          height: 28px !important;
          max-height: 28px !important;

          ::v-deep .el-input {
            width: 100%;
            height: 28px !important;
            max-height: 28px !important;
          }

          ::v-deep .el-input__inner {
            border: none;
            padding: 0 8px;
            resize: none;
            min-height: 28px;
            height: 28px !important;
            max-height: 28px !important;
            font-size: 12px;
            line-height: 1.2;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
          }
        }
      }

      // 前置条件、测试数据列保持单行显示
      td:nth-child(1),
      td:nth-child(2) {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        height: 28px !important;
        max-height: 28px !important;

        .table-cell-text {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          word-break: keep-all !important;
          word-wrap: normal !important;
          height: 28px !important;
          max-height: 28px !important;
        }
      }

      // 实际结果列允许在单元格内换行显示全部内容
      td:nth-child(5) {
        white-space: pre-wrap !important; // 保留换行符并允许自动换行
        word-wrap: break-word !important;
        vertical-align: top !important;
        height: auto !important;

        .table-cell-text {
          white-space: pre-wrap !important; // 保留换行符并允许自动换行
          word-wrap: break-word !important;
          min-height: 28px;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          display: block;
        }

        .table-cell-input {
          width: 100%;
          height: auto !important;
          min-height: 28px;

          ::v-deep .el-textarea {
            width: 100%;
            height: auto !important;
            min-height: 28px;
          }

          ::v-deep .el-textarea__inner {
            border: none;
            padding: 5px 8px;
            resize: vertical;
            min-height: 28px;
            height: auto !important;
            font-size: 12px;
            line-height: 1.4;
            white-space: pre-wrap !important; // 保留换行符并允许自动换行
            word-wrap: break-word !important;
            overflow: visible !important;
          }
        }
      }

      // 测试步骤和预期结果列允许在单元格内换行显示全部内容
      td:nth-child(3),
      td:nth-child(4) {
        white-space: pre-wrap !important; // 保留换行符并允许自动换行
        word-wrap: break-word !important;
        word-break: break-all !important;
        vertical-align: top !important;
        height: auto !important;

        .table-cell-text {
          white-space: pre-wrap !important; // 保留换行符并允许自动换行
          word-wrap: break-word !important;
          word-break: break-all !important;
          min-height: 28px;
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          // 允许在单元格内换行
          display: block;
        }
      }
    }
  }
}
</style>
