<template>
  <div class="bug-detail-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button
          type="text"
          icon="el-icon-arrow-left"
          @click="goBack"
          class="back-button"
        >
          返回缺陷管理
        </el-button>
        <div class="page-title">
          <span v-if="mode === 'view'">缺陷详情</span>
          <span v-else-if="mode === 'edit'">缺陷编辑</span>
          <span v-else-if="mode === 'create'">新增缺陷</span>
          <span v-if="bugForm.bugId" class="bug-id">[{{ bugForm.bugId }}]</span>
        </div>
      </div>
      <div class="header-right">
        <!-- 状态栏 -->
        <div class="status-bar">
          <span class="status-label">当前状态:</span>
          <el-tag :type="getBugStateTagType(bugForm.bugState)" size="small">
            {{ bugForm.bugStateName || '-' }}
          </el-tag>
          <span class="status-label" style="margin-left: 16px;">更改状态:</span>
          <el-select
            v-if="mode !== 'view'"
            v-model="bugForm.bugState"
            size="small"
            style="width: 120px; margin-left: 8px;"
            @change="handleStateChange"
          >
            <el-option
              v-for="item in bugStateOptions"
              :key="item.dataValue"
              :label="item.dataName"
              :value="item.dataValue"
            />
          </el-select>
          <el-tag v-else :type="getBugStateTagType(bugForm.bugState)" size="small" style="margin-left: 8px;">
            {{ bugForm.bugStateName || '-' }}
          </el-tag>
        </div>
        <el-button
          v-if="mode === 'view'"
          type="primary"
          icon="el-icon-edit"
          @click="switchToEdit"
        >
          编辑
        </el-button>
        <el-button
          v-if="mode === 'edit' || mode === 'create'"
          type="primary"
          icon="el-icon-check"
          @click="handleSave"
          :loading="saving"
        >
          保存
        </el-button>
        <el-button
          v-if="mode === 'edit' || mode === 'create'"
          icon="el-icon-close"
          @click="handleCancel"
        >
          取消
        </el-button>
      </div>
    </div>

    <!-- 缺陷详情内容 -->
    <div class="detail-content" v-loading="loading">
      <el-form
        ref="bugFormRef"
        :model="bugForm"
        :rules="bugRules"
        label-width="120px"
        :disabled="mode === 'view'"
      >
        <el-row :gutter="20">
          <!-- 左侧列 -->
          <el-col :span="12">
            <!-- 缺陷编号 -->
            <el-form-item label="缺陷编号">
              <el-input v-model="bugForm.bugId" readonly />
            </el-form-item>

            <!-- 提交人 -->
            <el-form-item label="提交人">
              <el-input v-model="bugForm.submitterName" readonly />
            </el-form-item>

            <!-- 测试集路径 -->
            <el-form-item label="测试集路径">
              <el-input v-model="bugForm.directoryPath" readonly />
            </el-form-item>

            <!-- 缺陷类型 -->
            <el-form-item label="缺陷类型">
              <el-select v-model="bugForm.bugType" placeholder="请选择缺陷类型" style="width: 100%">
                <el-option
                  v-for="item in bugTypeOptions"
                  :key="item.dataValue"
                  :label="item.dataName"
                  :value="item.dataValue"
                />
              </el-select>
            </el-form-item>

            <!-- 开发组长 -->
            <el-form-item label="开发组长">
              <el-input v-model="bugForm.devLeaderName" placeholder="请输入开发组长">
                <el-button slot="append" icon="el-icon-more" @click="handleSelectDevLeader"></el-button>
              </el-input>
            </el-form-item>

            <!-- 缺陷来源 -->
            <el-form-item label="缺陷来源">
              <el-input v-model="bugForm.bugSourceName" readonly />
            </el-form-item>
          </el-col>

          <!-- 右侧列 -->
          <el-col :span="12">
            <!-- 标题 -->
            <el-form-item label="标题" prop="bugName">
              <el-input v-model="bugForm.bugName" placeholder="请输入标题" />
            </el-form-item>

            <!-- 提交时间 -->
            <el-form-item label="提交时间">
              <el-input :value="formatDateTime(bugForm.commitTime)" readonly />
            </el-form-item>

            <!-- 所属系统 -->
            <el-form-item label="所属系统" prop="systemId">
              <el-input v-model="bugForm.systemName" placeholder="请选择所属系统">
                <el-button slot="append" icon="el-icon-more" @click="handleSelectSystem"></el-button>
              </el-input>
            </el-form-item>

            <!-- 测试用例 -->
            <el-form-item label="测试用例">
              <el-input v-model="bugForm.usecaseId" placeholder="请输入测试用例">
                <el-button slot="append" icon="el-icon-more" @click="handleSelectTestCase"></el-button>
              </el-input>
            </el-form-item>

            <!-- 严重级别 -->
            <el-form-item label="严重级别" prop="bugSeverityLevel">
              <el-select v-model="bugForm.bugSeverityLevel" placeholder="请选择严重级别" style="width: 100%">
                <el-option
                  v-for="item in bugSeverityLevelOptions"
                  :key="item.dataValue"
                  :label="item.dataName"
                  :value="item.dataValue"
                />
              </el-select>
            </el-form-item>

            <!-- 优先级 -->
            <el-form-item label="优先级" prop="prority">
              <el-select v-model="bugForm.prority" placeholder="请选择优先级" style="width: 100%">
                <el-option
                  v-for="item in prorityOptions"
                  :key="item.dataValue"
                  :label="item.dataName"
                  :value="item.dataValue"
                />
              </el-select>
            </el-form-item>

            <!-- 开发责任人 -->
            <el-form-item label="开发责任人">
              <el-input v-model="bugForm.developerName" placeholder="请输入开发责任人">
                <el-button slot="append" icon="el-icon-more" @click="handleSelectDeveloper"></el-button>
              </el-input>
            </el-form-item>

            <!-- 验证人 -->
            <el-form-item label="验证人">
              <el-input v-model="bugForm.checkerName" placeholder="请输入验证人">
                <el-button slot="append" icon="el-icon-more" @click="handleSelectChecker"></el-button>
              </el-input>
            </el-form-item>

            <!-- 关闭原因 -->
            <el-form-item label="关闭原因">
              <el-input v-model="bugForm.closeReason" type="textarea" :rows="2" placeholder="请输入关闭原因" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 缺陷描述 -->
        <el-form-item label="缺陷描述">
          <el-input
            v-model="bugForm.bugDescription"
            type="textarea"
            :rows="8"
            placeholder="请输入缺陷描述"
          />
        </el-form-item>

        <!-- 注释 -->
        <el-form-item label="注释">
          <el-input
            v-model="bugForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入注释"
          />
        </el-form-item>
      </el-form>

      <!-- 附件和历史记录 -->
      <el-card class="attachment-history-card" shadow="never">
        <div slot="header" class="card-header">
          <span>附件和历史记录</span>
        </div>

        <!-- 附件列表 -->
        <div class="attachment-section">
          <div class="attachment-list">
            <div
              v-for="attachment in attachmentList"
              :key="attachment.attachmentId"
              class="attachment-item"
            >
              <el-link
                type="primary"
                :underline="false"
                @click="handleDownloadAttachment(attachment)"
              >
                <i class="el-icon-document"></i>
                {{ attachment.originalFileName }}
              </el-link>
              <span class="attachment-info">
                {{ attachment.uploaderName }} 上传于 {{ formatDateTime(attachment.uploadTime) }}
              </span>
            </div>
            <div v-if="attachmentList.length === 0" class="empty-tip">暂无附件</div>
          </div>
          <div class="attachment-actions" v-if="mode !== 'view'">
            <el-upload
              ref="upload"
              :action="uploadAction"
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :file-list="fileList"
              :limit="10"
            >
              <el-button size="small" type="primary" icon="el-icon-upload">上传附件</el-button>
            </el-upload>
          </div>
        </div>

        <!-- 标签页 -->
        <el-tabs v-model="activeTab" type="card">
          <!-- 历史记录 -->
          <el-tab-pane label="历史记录" name="history">
            <el-table
              :data="historyList"
              border
              stripe
              style="width: 100%"
              v-loading="historyLoading"
            >
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="operatorName" label="操作人" width="120" />
              <el-table-column prop="operateTime" label="操作时间" width="180">
                <template slot-scope="scope">
                  {{ formatDateTime(scope.row.operateTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="operationDesc" label="操作描述" min-width="300" />
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
          </el-tab-pane>

          <!-- 关联系统协同处理缺陷 -->
          <el-tab-pane label="关联系统协同处理缺陷" name="related">
            <div class="empty-tip">暂无关联系统协同处理缺陷</div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script>
import bugManageApi from '@/api/test/bugManage/bugManage'
import attachmentApi from '@/api/framework/attachment'
import dictionaryApi from '@/api/framework/dictionary'
import testSystemApi from '@/api/test/baseManage/testSystem'
import usecaseRepositoryApi from '@/api/test/usecaseManage/usecaseRepository'
import testDirectoryApi from '@/api/test/baseManage/testDirectory'
import { formatTime } from '@/utils/index'

export default {
  name: 'bugDetail',
  data() {
    return {
      mode: 'view', // view, edit, create
      bugId: null,
      loading: false,
      saving: false,
      historyLoading: false,
      activeTab: 'history',
      bugForm: {
        bugId: '',
        bugName: '',
        systemId: '',
        systemName: '',
        bugState: '',
        bugStateName: '',
        usecaseId: '',
        bugSource: '',
        bugSourceName: '',
        prority: '',
        prorityName: '',
        bugDescription: '',
        bugSeverityLevel: '',
        bugSeverityLevelName: '',
        closeReason: '',
        submitterId: '',
        submitterName: '',
        developerId: '',
        developerName: '',
        devLeaderId: '',
        devLeaderName: '',
        checkerId: '',
        checkerName: '',
        bugType: '',
        bugTypeName: '',
        directoryId: '',
        directoryPath: '',
        bugModule: '',
        lineResponsiblePerson: '',
        testOrderId: '',
        testManagementPost: '',
        remark: '',
        commitTime: null
      },
      bugRules: {
        bugName: [
          { required: true, message: '请输入标题', trigger: 'blur' }
        ],
        systemId: [
          { required: true, message: '请选择所属系统', trigger: 'change' }
        ],
        bugSeverityLevel: [
          { required: true, message: '请选择严重级别', trigger: 'change' }
        ],
        prority: [
          { required: true, message: '请选择优先级', trigger: 'change' }
        ]
      },
      // 数据字典选项
      bugStateOptions: [],
      bugTypeOptions: [],
      bugSeverityLevelOptions: [],
      bugSourceOptions: [],
      prorityOptions: [],
      // 附件相关
      attachmentList: [],
      fileList: [],
      pendingFiles: [],
      uploadAction: '',
      // 历史记录
      historyList: [],
      historyPagination: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      // 是否来自执行库
      fromExecution: false
    }
  },
  async created() {
    this.parseRouteParams()
    await this.loadDictionaryData()
    if (this.mode === 'create') {
      await this.initCreateForm()
      // 如果来自执行库，加载用例信息和目录路径
      if (this.fromExecution && this.bugForm.usecaseId && this.bugForm.directoryId) {
        await this.loadUsecaseInfo()
        await this.loadDirectoryPath()
      }
    } else if (this.bugId) {
      await this.loadBugDetail()
      await this.loadAttachmentList()
      await this.loadBugHistory()
    }
  },
  methods: {
    // 解析路由参数
    parseRouteParams() {
      const { mode, id, usecaseId, directoryId, fromExecution } = this.$route.query
      this.mode = mode || 'view'
      this.bugId = id || null
      this.fromExecution = fromExecution === 'true'
      // 如果是新建模式，从路由参数中获取 usecaseId 和 directoryId
      if (mode === 'create') {
        if (usecaseId) {
          this.bugForm.usecaseId = usecaseId
        }
        if (directoryId) {
          this.bugForm.directoryId = directoryId
        }
      }
    },

    // 加载数据字典
    async loadDictionaryData() {
      try {
        const [bugStateRes, bugTypeRes, bugSeverityLevelRes, bugSourceRes, prorityRes] = await Promise.all([
          dictionaryApi.getDictionaryList('bugState'),
          dictionaryApi.getDictionaryList('bugType'),
          dictionaryApi.getDictionaryList('bugSeverityLevel'),
          dictionaryApi.getDictionaryList('bugSource'),
          dictionaryApi.getDictionaryList('prority')
        ])
        this.bugStateOptions = bugStateRes.data || []
        this.bugTypeOptions = bugTypeRes.data || []
        this.bugSeverityLevelOptions = bugSeverityLevelRes.data || []
        this.bugSourceOptions = bugSourceRes.data || []
        this.prorityOptions = prorityRes.data || []
      } catch (error) {
        console.error('加载数据字典失败:', error)
        this.$message.error('加载数据字典失败')
      }
    },

    // 初始化新建表单
    async initCreateForm() {
      // 设置默认值
      this.bugForm = {
        ...this.bugForm,
        bugState: '新建', // 默认状态
        commitTime: new Date(),
        // 保留从路由参数中获取的 usecaseId 和 directoryId
        usecaseId: this.bugForm.usecaseId || '',
        directoryId: this.bugForm.directoryId || ''
      }
    },

    // 加载用例信息（用于填充缺陷描述）
    async loadUsecaseInfo() {
      if (!this.bugForm.usecaseId) return
      try {
        const response = await usecaseRepositoryApi.getUsecaseById(this.bugForm.usecaseId)
        if (response.code === 20000 && response.data) {
          const usecaseData = response.data
          const stepList = usecaseData.stepList || []
          
          // 构建缺陷描述内容
          let description = ''
          
          // 前置条件
          const preconditions = stepList
            .filter(step => step.precondition && step.precondition.trim())
            .map(step => step.precondition.trim())
            .join('\n')
          if (preconditions) {
            description += `[前置条件:]\n${preconditions}\n\n`
          }
          
          // 测试数据
          const testData = stepList
            .filter(step => step.testData && step.testData.trim())
            .map(step => step.testData.trim())
            .join('\n')
          if (testData) {
            description += `[测试数据:]\n${testData}\n\n`
          }
          
          // 执行步骤
          const testSteps = stepList
            .filter(step => step.testStep && step.testStep.trim())
            .map((step, index) => `${index + 1}、${step.testStep.trim()}`)
            .join('\n')
          if (testSteps) {
            description += `[用例步骤:]\n${testSteps}\n\n`
          }
          
          // 预期结果
          const expectedResults = stepList
            .filter(step => step.expectedResult && step.expectedResult.trim())
            .map((step, index) => `${index + 1}、${step.expectedResult.trim()}`)
            .join('\n')
          if (expectedResults) {
            description += `[期望结果:]\n${expectedResults}\n\n`
          }
          
          // 实际结果（如果有）
          const actualResults = stepList
            .filter(step => step.actualResult && step.actualResult.trim())
            .map((step, index) => `${index + 1}、${step.actualResult.trim()}`)
            .join('\n')
          if (actualResults) {
            description += `[实际结果:]\n${actualResults}`
          }
          
          // 设置缺陷描述
          if (description) {
            this.bugForm.bugDescription = description.trim()
          }
        }
      } catch (error) {
        console.error('加载用例信息失败:', error)
      }
    },

    // 加载目录完整路径
    async loadDirectoryPath() {
      if (!this.bugForm.directoryId) return
      try {
        const response = await testDirectoryApi.getDirectoryById(this.bugForm.directoryId)
        if ((response.code === 20000 || response.code === 200) && response.data) {
          const directoryData = response.data
          // 后端返回的完整路径
          if (directoryData.fullPath) {
            this.bugForm.directoryPath = directoryData.fullPath
          } else if (directoryData.directoryName) {
            // 如果没有 fullPath，使用 directoryName 作为备用
            this.bugForm.directoryPath = directoryData.directoryName
          }
          // 设置 systemId
          if (directoryData.systemId) {
            this.bugForm.systemId = directoryData.systemId
            // 加载系统名称
            await this.loadSystemName(directoryData.systemId)
          }
        }
      } catch (error) {
        console.error('加载目录路径失败:', error)
      }
    },

    // 根据 systemId 加载系统名称
    async loadSystemName(systemId) {
      if (!systemId) return
      try {
        const response = await testSystemApi.getTestSystemList({ pageNo: 1, pageSize: 1000 })
        if (response.code === 20000 && response.data) {
          const systemList = response.data.rows || response.data || []
          const system = systemList.find(s => s.systemId === systemId)
          if (system && system.systemName) {
            this.bugForm.systemName = system.systemName
          }
        } else if (response.code === 200 && response.data) {
          const systemList = Array.isArray(response.data) ? response.data : (response.data.rows || [])
          const system = systemList.find(s => s.systemId === systemId)
          if (system && system.systemName) {
            this.bugForm.systemName = system.systemName
          }
        }
      } catch (error) {
        console.error('加载系统名称失败:', error)
      }
    },

    // 加载缺陷详情
    async loadBugDetail() {
      if (!this.bugId) return
      this.loading = true
      try {
        const response = await bugManageApi.getBugDetail(this.bugId)
        if (response.code === 20000 && response.data) {
          this.bugForm = {
            ...this.bugForm,
            ...response.data
          }
        } else {
          this.$message.error(response.message || '加载缺陷详情失败')
        }
      } catch (error) {
        console.error('加载缺陷详情失败:', error)
        this.$message.error('加载缺陷详情失败')
      } finally {
        this.loading = false
      }
    },

    // 加载附件列表
    async loadAttachmentList() {
      if (!this.bugId) return
      try {
        const response = await attachmentApi.getAttachmentList({
          module: 'bug',
          relateId: this.bugId
        })
        if (response.code === 20000 && response.data) {
          this.attachmentList = Array.isArray(response.data) ? response.data : []
        }
      } catch (error) {
        console.error('加载附件列表失败:', error)
      }
    },

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

    // 切换到编辑模式
    switchToEdit() {
      this.mode = 'edit'
      this.$router.replace({
        query: { ...this.$route.query, mode: 'edit' }
      })
    },

    // 保存缺陷
    async handleSave() {
      try {
        await this.$refs.bugFormRef.validate()

        // 上传附件
        if (this.pendingFiles.length > 0) {
          await this.uploadAttachments()
        }

        this.saving = true
        let response
        if (this.mode === 'create') {
          response = await bugManageApi.createBug(this.bugForm)
        } else {
          response = await bugManageApi.updateBug(this.bugId, this.bugForm)
        }

        if (response.code === 20000) {
          this.$message.success(this.mode === 'create' ? '创建成功' : '保存成功')
          if (this.mode === 'create' && response.data?.bugId) {
            this.bugId = response.data.bugId
            this.$router.replace({
              query: { ...this.$route.query, id: this.bugId, mode: 'view' }
            })
          } else {
            this.mode = 'view'
            this.$router.replace({
              query: { ...this.$route.query, mode: 'view' }
            })
          }
          await this.loadBugDetail()
          await this.loadAttachmentList()
          await this.loadBugHistory()
        } else {
          this.$message.error(response.message || '保存失败')
        }
      } catch (error) {
        if (error.message) {
          this.$message.error(error.message)
        } else {
          console.error('保存缺陷失败:', error)
          this.$message.error('保存失败')
        }
      } finally {
        this.saving = false
      }
    },

    // 取消操作
    handleCancel() {
      this.$confirm('确定要取消吗？未保存的修改将丢失。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        if (this.mode === 'create') {
          this.goBack()
        } else {
          this.mode = 'view'
          this.$router.replace({
            query: { ...this.$route.query, mode: 'view' }
          })
          this.loadBugDetail()
        }
      }).catch(() => {})
    },

    // 状态变更
    handleStateChange(value) {
      const item = this.bugStateOptions.find(opt => opt.dataValue === value)
      if (item) {
        this.bugForm.bugStateName = item.dataName
      }
    },

    // 选择模块
    handleSelectModule() {
      this.$message.info('选择模块功能开发中')
    },

    // 选择系统
    async handleSelectSystem() {
      // TODO: 实现系统选择对话框
      this.$message.info('选择系统功能开发中')
    },

    // 选择测试用例
    handleSelectTestCase() {
      this.$message.info('选择测试用例功能开发中')
    },

    // 选择送测单
    handleSelectTestOrder() {
      this.$message.info('选择送测单功能开发中')
    },

    // 选择开发组长
    handleSelectDevLeader() {
      this.$message.info('选择开发组长功能开发中')
    },

    // 选择责任人
    handleSelectDeveloper() {
      this.$message.info('选择责任人功能开发中')
    },

    // 选择验证人
    handleSelectChecker() {
      this.$message.info('选择验证人功能开发中')
    },

    // 文件变化
    handleFileChange(file, fileList) {
      this.fileList = fileList
      if (file.raw) {
        this.pendingFiles.push(file.raw)
      }
    },

    // 文件移除
    handleFileRemove(file, fileList) {
      this.fileList = fileList
      if (file.raw) {
        const index = this.pendingFiles.indexOf(file.raw)
        if (index > -1) {
          this.pendingFiles.splice(index, 1)
        }
      }
    },

    // 上传附件
    async uploadAttachments() {
      if (!this.bugId) {
        this.$message.warning('请先保存缺陷')
        return
      }
      for (const file of this.pendingFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('module', 'bug')
        formData.append('relateId', this.bugId)
        try {
          await attachmentApi.uploadAttachment(formData)
        } catch (error) {
          console.error('上传附件失败:', error)
          this.$message.error('上传附件失败')
        }
      }
      this.pendingFiles = []
      this.fileList = []
    },

    // 下载附件
    async handleDownloadAttachment(attachment) {
      try {
        const response = await attachmentApi.downloadAttachment(attachment.attachmentId, attachment.originalFileName)
        // response.data 是 blob
        const blob = response.data
        if (blob.type === 'application/json' || blob.size < 500) {
          const text = await blob.text()
          try {
            const errorData = JSON.parse(text)
            if (errorData && (errorData.code !== 20000 && errorData.code !== 200)) {
              this.$message.error(errorData.message || '下载失败')
              return
            }
          } catch (e) {
            // 不是 JSON，继续下载
          }
        }
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', attachment.originalFileName || '附件')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('下载附件失败:', error)
        this.$message.error('下载附件失败')
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

    // 格式化日期时间
    formatDateTime(dateTime) {
      return formatTime(dateTime) || '-'
    },

    // 返回
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.bug-detail-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
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

  .bug-id {
    color: #909399;
    font-weight: normal;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-bar {
  display: flex;
  align-items: center;
  margin-right: 16px;

  .status-label {
    font-size: 14px;
    color: #606266;
  }
}

.detail-content {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 12px;
}

.attachment-history-card {
  margin-top: 12px;
  border: 1px solid #ebeef5;
}

.card-header {
  font-weight: 600;
  color: #303133;
}

.attachment-section {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.attachment-list {
  margin-bottom: 16px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  .attachment-info {
    font-size: 12px;
    color: #909399;
  }
}

.attachment-actions {
  margin-top: 12px;
}

.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

.pagination-container {
  margin-top: 12px;
  text-align: right;
}

::v-deep .el-form-item {
  margin-bottom: 12px !important;
}

::v-deep .el-form-item__label {
  font-weight: 500;
  color: #606266;
  font-size: 12px !important;
  line-height: 1.5 !important;
  padding-bottom: 0 !important;
}

::v-deep .el-input__inner {
  font-size: 12px !important;
  height: 28px !important;
  line-height: 28px !important;
}

::v-deep .el-textarea__inner {
  font-size: 12px !important;
  line-height: 1.5 !important;
}

::v-deep .el-select .el-input__inner {
  font-size: 12px !important;
  height: 28px !important;
  line-height: 28px !important;
}

::v-deep .el-input__inner[readonly] {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #606266;
  cursor: not-allowed;
  font-size: 12px !important;
  height: 28px !important;
  line-height: 28px !important;
}
</style>
