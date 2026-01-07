<template>
  <div>
    <el-card>
      <el-form ref="deployFormRef" :model="deployForm" :rules="rules" label-width="120px">
        <!-- 第一行：Merge_Request 和解析按钮 -->
        <el-form-item label="Merge_Request:" prop="mergeRequest">
          <el-input 
            v-model="deployForm.mergeRequest" 
            placeholder="请输入Merge_Request"
            style="width: calc(100% - 110px); display: inline-block; margin-right: 10px;">
          </el-input>
          <el-button type="primary" @click="handleParse" :loading="parsing" style="vertical-align: top;">解析</el-button>
          <div style="margin-top: 5px; color: #909399; font-size: 12px; margin-left: 0;">
            若无MR，只为登记版本请填'1'
          </div>
        </el-form-item>

        <!-- 第二行：合并状态和送测单编号 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合并状态:" prop="mergeState">
              <el-input v-model="deployForm.mergeState" placeholder="请输入合并状态"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="送测单编号:" prop="sendTestCode">
              <el-input v-model="deployForm.sendTestCode" placeholder="请输入送测单编号"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：系统和组件 -->
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

        <!-- 第四行：是否执行sql和是否更新配置 -->
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

        <!-- 第五行：版本数 -->
        <el-form-item label="版本数:" prop="recordNum">
          <el-input v-model="deployForm.recordNum" placeholder="请输入版本数" type="number"></el-input>
        </el-form-item>

        <!-- 代码清单 -->
        <el-form-item label="代码清单:" prop="codeList">
          <el-input
            v-model="deployForm.codeList"
            type="textarea"
            :rows="6"
            placeholder="请输入代码清单"
            class="code-list-textarea">
          </el-input>
        </el-form-item>

        <!-- 隐藏字段 -->
        <el-form-item v-if="false">
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

/* 代码清单文本域滚动条样式 */
.code-list-textarea ::v-deep .el-textarea__inner {
  overflow-y: auto;
  resize: vertical;
}
</style>

<script>
import deployRecordApi from '@/api/configuration/deploy/deployRecord'
import TestSystemSingleSelector from '@/views/sys/common/TestSystemSingleSelector'

export default {
  name: 'SitDeploy',
  components: {
    TestSystemSingleSelector
  },
  data() {
    return {
      parsing: false,
      submitting: false,
      systemSelectorVisible: false,
      deployForm: {
        deployId: null,
        testStage: 'SIT', // 默认为SIT
        systemId: '',
        systemName: '',
        componentInfo: '',
        versionCode: '',
        recordNum: null,
        codeList: '',
        isRunSql: false,
        isUpdateConfig: false,
        sendTestCode: '',
        mergeRequest: '',
        mergeState: ''
      },
      rules: {
        systemId: [
          { required: true, message: '请选择系统', trigger: 'change' }
        ],
        componentInfo: [
          { required: true, message: '请输入组件信息', trigger: 'blur' }
        ],
        recordNum: [
          { required: true, message: '请输入版本数', trigger: 'blur' },
          { type: 'number', message: '版本数必须为数字', trigger: 'blur', transform: value => Number(value) }
        ],
        codeList: [
          { required: true, message: '请输入代码清单', trigger: 'blur' }
        ]
      }
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
    // 加载发版登记数据（编辑模式）
    loadDeployData(deployId) {
      deployRecordApi.getDeployRecordDetail(deployId).then(response => {
        if (response.code === 20000 && response.data) {
          const data = response.data
          // 将后端返回的0/1转换为布尔值
          this.deployForm = {
            deployId: data.deployId,
            testStage: data.testStage || 'SIT',
            systemId: data.systemId || '',
            systemName: data.systemName || '',
            componentInfo: data.componentInfo || '',
            versionCode: data.versionCode || '',
            recordNum: data.recordNum,
            codeList: data.codeList || '',
            isRunSql: data.isRunSql === 1 || data.isRunSql === '1' || data.isRunSql === true,
            isUpdateConfig: data.isUpdateConfig === 1 || data.isUpdateConfig === '1' || data.isUpdateConfig === true,
            sendTestCode: data.sendTestCode || '',
            mergeRequest: data.mergeRequest || '',
            mergeState: data.mergeState || ''
          }
        } else {
          this.$message.error(response.message || '获取发版登记详情失败')
        }
      }).catch(() => {
        this.$message.error('获取发版登记详情失败')
      })
    },

    // 解析Merge_Request
    handleParse() {
      if (!this.deployForm.mergeRequest) {
        this.$message.warning('请输入Merge_Request')
        return
      }
      
      this.parsing = true
      // TODO: 调用解析接口，解析Merge_Request并填充表单
      // 这里暂时模拟解析逻辑
      setTimeout(() => {
        this.parsing = false
        this.$message.success('解析成功')
        // 解析后可以自动填充一些字段
        // 例如：this.deployForm.componentInfo = '解析出的组件信息'
      }, 1000)
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
          versionCode: this.deployForm.versionCode || '',
          recordNum: this.deployForm.recordNum,
          codeList: this.deployForm.codeList,
          isRunSql: this.deployForm.isRunSql ? 1 : 0,
          isUpdateConfig: this.deployForm.isUpdateConfig ? 1 : 0,
          sendTestCode: this.deployForm.sendTestCode,
          deployTime: new Date().toISOString()
        }

        // 如果有deployId，说明是编辑，否则是新增
        if (this.deployForm.deployId) {
          payload.deployId = this.deployForm.deployId
          deployRecordApi.updateDeployRecord(payload).then(() => {
            this.$message.success('更新成功')
            this.submitting = false
            // 可以跳转回列表页或清空表单
            this.resetForm()
          }).catch(() => {
            this.$message.error('更新失败')
            this.submitting = false
          })
        } else {
          // 调用创建接口
          deployRecordApi.createDeployRecord(payload).then(() => {
            this.$message.success('登记成功')
            this.submitting = false
            this.resetForm()
          }).catch(() => {
            this.$message.error('登记失败')
            this.submitting = false
          })
        }
      })
    },

    // 重置表单
    resetForm() {
      if (this.$refs.deployFormRef) {
        this.$refs.deployFormRef.resetFields()
      }
      this.deployForm = {
        deployId: null,
        testStage: 'SIT',
        systemId: '',
        systemName: '',
        componentInfo: '',
        versionCode: '',
        recordNum: null,
        codeList: '',
        isRunSql: false,
        isUpdateConfig: false,
        sendTestCode: '',
        mergeRequest: '',
        mergeState: ''
      }
    }
  }
}
</script>
