<template>
  <div>
    <el-card>
      <el-form ref="deployFormRef" :model="deployForm" :rules="rules" label-width="120px">
        <!-- 第一行：Gitlab URL -->
        <el-form-item label="Gitlab URL:" prop="gitlabUrl" class="gitlab-url-item">
          <el-input v-model="deployForm.gitlabUrl" placeholder="填http地址" @input="handleGitlabUrlChange">
          </el-input>
          <div style="margin-top: 5px; color: #f56c6c; font-size: 12px; margin-left: 0;">
            *若只为登记 PAT版本,则填写'1'
          </div>
        </el-form-item>

        <!-- 第二行：系统和组件 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="系统:" prop="systemId">
              <el-input
                v-model="deployForm.systemName"
                placeholder="请选择系统"
                readonly
                @click.native="handleSelectSystem">
                <el-button slot="append" icon="el-icon-search" @click="handleSelectSystem"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组件:" prop="componentInfo">
              <el-input v-model="deployForm.componentInfo" placeholder="请输入组件信息"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：送测单编号和版本登记数 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="送测单编号:" prop="sendTestCode">
              <el-input v-model="deployForm.sendTestCode" placeholder="请输入送测单编号"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本登记数:" prop="recordNum">
              <el-input
                v-model="deployForm.recordNum"
                placeholder="请输入版本登记数（1-20）"
                type="number"
                :min="1"
                :max="20"
                @input="handleRecordNumInput">
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行：源分支和目标分支 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="源分支:" prop="sourceBranch">
              <el-input 
                v-model="deployForm.sourceBranch" 
                placeholder="请输入源分支"
                :disabled="isGitlabUrlOne"
                :readonly="isGitlabUrlOne">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="目标分支:" prop="targetBranch">
              <el-input 
                v-model="deployForm.targetBranch" 
                placeholder="请输入目标分支"
                :disabled="isGitlabUrlOne"
                :readonly="isGitlabUrlOne">
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第五行：是否执行sql和是否更新配置 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否执行sql:" prop="isRunSql">
              <el-switch
                v-model="deployForm.isRunSql"
                active-text="是"
                inactive-text="否">
              </el-switch>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否更新配置:" prop="isUpdateConfig">
              <el-switch
                v-model="deployForm.isUpdateConfig"
                active-text="是"
                inactive-text="否">
              </el-switch>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 代码清单 -->
        <el-form-item label="代码清单:" prop="codeList">
          <el-input
            v-model="deployForm.codeList"
            type="textarea"
            :rows="6"
            placeholder="请输入代码清单"
            :disabled="isGitlabUrlOne"
            class="code-list-textarea">
          </el-input>
        </el-form-item>

        <!-- 隐藏字段 -->
        <el-form-item v-if="false">
          <el-input v-model="deployForm.deployId"></el-input>
          <el-input v-model="deployForm.systemId"></el-input>
          <el-input v-model="deployForm.testStage"></el-input>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting" size="medium" style="width: 200px;">
            合并&登记
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 系统选择器 -->
    <TestSystemSingleSelector
      v-model="systemSelectorVisible"
      :selectedSystemId="deployForm.systemId"
      @confirm="handleSystemConfirm">
    </TestSystemSingleSelector>
  </div>
</template>

<style scoped>
.el-card {
  margin-bottom: 10px;
}

.el-form-item {
  margin-bottom: 22px;
}

/* Gitlab URL 行间距调整 */
.gitlab-url-item {
  margin-bottom: 10px !important;
}

/* 代码清单文本域滚动条样式 */
.code-list-textarea ::v-deep .el-textarea__inner {
  overflow-y: auto;
  resize: vertical;
}
</style>

<script>
import patDeployApi from '@/api/configuration/deploy/patDeploy'
import TestSystemSingleSelector from '@/views/sys/common/TestSystemSingleSelector'

export default {
  name: 'PatDeploy',
  components: {
    TestSystemSingleSelector
  },
  data() {
    return {
      submitting: false,
      systemSelectorVisible: false,
      deployForm: {
        deployId: null,
        testStage: 'PAT', // 默认为PAT
        systemId: '',
        systemName: '',
        componentInfo: '',
        recordNum: null,
        codeList: '',
        isRunSql: false, // 默认false，对应0
        isUpdateConfig: false, // 默认false，对应0
        sendTestCode: '',
        gitlabUrl: '',
        sourceBranch: '',
        targetBranch: ''
      },
      rules: {
        gitlabUrl: [
          { required: true, message: '请输入Gitlab URL', trigger: 'blur' }
        ],
        systemId: [
          { required: true, message: '请选择系统', trigger: 'change' }
        ],
        sendTestCode: [
          { required: true, message: '请输入送测单编号', trigger: 'blur' }
        ],
        recordNum: [
          { required: true, message: '请输入版本登记数', trigger: 'blur' },
          { type: 'number', message: '版本登记数必须为数字', trigger: 'blur', transform: value => Number(value) },
          { type: 'number', min: 1, max: 20, message: '版本登记数必须在1-20之间', trigger: 'blur', transform: value => Number(value) }
        ],
        codeList: [
          {
            validator: (rule, value, callback) => {
              const gitlabUrl = this.deployForm.gitlabUrl || ''
              // 如果 gitlabUrl 为 '1'，代码清单非必填
              if (gitlabUrl === '1') {
                callback()
              } else if (gitlabUrl.startsWith('http://')) {
                // 如果 gitlabUrl 是以 'http://' 开头的，代码清单必填
                if (!value || value.trim() === '') {
                  callback(new Error('请输入代码清单'))
                } else {
                  callback()
                }
              } else {
                // 其他情况，代码清单非必填
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        sourceBranch: [
          {
            validator: (rule, value, callback) => {
              const gitlabUrl = this.deployForm.gitlabUrl || ''
              // 如果 gitlabUrl 为 '1'，源分支非必填
              if (gitlabUrl === '1') {
                callback()
              } else if (gitlabUrl.startsWith('http://')) {
                // 如果 gitlabUrl 是以 'http://' 开头的，源分支必填
                if (!value || value.trim() === '') {
                  callback(new Error('请输入源分支'))
                } else {
                  callback()
                }
              } else {
                // 其他情况，源分支非必填
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        targetBranch: [
          {
            validator: (rule, value, callback) => {
              const gitlabUrl = this.deployForm.gitlabUrl || ''
              // 如果 gitlabUrl 为 '1'，目标分支非必填
              if (gitlabUrl === '1') {
                callback()
              } else if (gitlabUrl.startsWith('http://')) {
                // 如果 gitlabUrl 是以 'http://' 开头的，目标分支必填
                if (!value || value.trim() === '') {
                  callback(new Error('请输入目标分支'))
                } else {
                  callback()
                }
              } else {
                // 其他情况，目标分支非必填
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    // 检查 Gitlab URL 是否为 '1'
    isGitlabUrlOne() {
      return this.deployForm.gitlabUrl === '1'
    }
  },
  created() {
    // 检查路由参数，如果有deployId，则加载数据（编辑模式）
    const deployId = this.$route.params.deployId
    if (deployId) {
      this.loadDeployData(deployId)
    }
  },
  methods: {
    // Gitlab URL 变化处理
    handleGitlabUrlChange() {
      // 触发字段验证
      this.$nextTick(() => {
        if (this.$refs.deployFormRef) {
          this.$refs.deployFormRef.validateField('codeList')
          this.$refs.deployFormRef.validateField('sourceBranch')
          this.$refs.deployFormRef.validateField('targetBranch')
        }
      })
      
      if (this.deployForm.gitlabUrl === '1') {
        // 如果填的是'1'，清空并禁用源分支和目标分支
        this.deployForm.sourceBranch = ''
        this.deployForm.targetBranch = ''
        this.deployForm.codeList = ''
      } else if (this.deployForm.gitlabUrl && this.deployForm.gitlabUrl.startsWith('http://')) {
        // 如果是 http:// 开头，设置默认值
        if (!this.deployForm.sourceBranch) {
          this.deployForm.sourceBranch = 'sit'
        }
        if (!this.deployForm.targetBranch) {
          this.deployForm.targetBranch = 'pat'
        }
      }
    },

    // 选择系统
    handleSelectSystem() {
      this.systemSelectorVisible = true
    },

    // 系统选择确认
    handleSystemConfirm(systemId, systemName, system) {
      if (system) {
        this.deployForm.systemId = system.systemId
        this.deployForm.systemName = system.systemName
      } else if (systemId && systemName) {
        this.deployForm.systemId = systemId
        this.deployForm.systemName = systemName
      }
    },

    // 版本登记数输入限制（1-20）
    handleRecordNumInput(value) {
      if (value === '' || value === null || value === undefined) {
        this.deployForm.recordNum = null
        return
      }
      const numValue = Number(value)
      if (isNaN(numValue)) {
        this.deployForm.recordNum = null
        return
      }
      // 限制在1-20之间
      if (numValue < 1) {
        this.deployForm.recordNum = 1
      } else if (numValue > 20) {
        this.deployForm.recordNum = 20
      } else {
        this.deployForm.recordNum = numValue
      }
    },

    // 提交表单
    handleSubmit() {
      this.$refs.deployFormRef.validate(valid => {
        if (!valid) {
          return false
        }

        this.submitting = true

        // 构建提交数据，将布尔值转换为0/1
        const payload = {
          testStage: this.deployForm.testStage,
          systemId: this.deployForm.systemId,
          componentInfo: this.deployForm.componentInfo,
          recordNum: this.deployForm.recordNum,
          codeList: this.deployForm.codeList,
          isRunSql: this.deployForm.isRunSql ? 1 : 0, // 转换为1/0
          isUpdateConfig: this.deployForm.isUpdateConfig ? 1 : 0, // 转换为1/0
          sendTestCode: this.deployForm.sendTestCode,
          sourceBranch: this.deployForm.sourceBranch,
          targetBranch: this.deployForm.targetBranch,
          deployTime: new Date().toISOString()
        }

        // 调用创建接口
        patDeployApi.createPATDeployRecord(payload).then(response => {
          // 检查响应格式
          if (response.code === 20000 || response.code === 200 || response.success === true) {
            this.$message.success(response.message || '登记成功')
            this.submitting = false
            // 跳转回列表页
            this.$router.push('/configuration/deploy/record')
          } else {
            this.$message.error(response.message || '登记失败')
            this.submitting = false
          }
        }).catch(error => {
          const errorMsg = error.response?.data?.message || error.message || '登记失败，请重试'
          this.$message.error(errorMsg)
          this.submitting = false
        })
      })
    },

    // 重置表单
    resetForm() {
      if (this.$refs.deployFormRef) {
        this.$refs.deployFormRef.resetFields()
      }
      this.deployForm = {
        deployId: null,
        testStage: 'PAT',
        systemId: '',
        systemName: '',
        componentInfo: '',
        recordNum: null,
        codeList: '',
        isRunSql: false,
        isUpdateConfig: false,
        sendTestCode: '',
        gitlabUrl: '',
        sourceBranch: '',
        targetBranch: ''
      }
    }
  }
}
</script>
