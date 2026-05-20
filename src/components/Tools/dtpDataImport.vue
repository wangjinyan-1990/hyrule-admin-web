<template>
  <div class="dtp-data-import">
    <el-card>
      <div slot="header" class="card-header">
        <span class="title">分布式数据导入</span>
      </div>

      <div class="main-layout">
        <!-- 左侧：操作区域 30% -->
        <div class="left-section">
          <div class="process-content">
            <!-- 环境选择区域 -->
            <div class="env-select">
              <el-form :model="formData" label-width="100px">
                <el-form-item label="环境:" prop="env">
                  <el-select
                    v-model="formData.env"
                    placeholder="请选择环境"
                    clearable
                    @change="handleEnvChange"
                  >
                    <el-option
                      v-for="item in environments"
                      :key="item.id"
                      :label="item.name"
                      :value="item.name"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <!-- 文件上传区域 -->
                <el-form-item label="Excel文件:">
                  <el-upload
                    ref="attachmentUpload"
                    :file-list="fileList"
                    :before-upload="beforeUpload"
                    :on-change="handleFileChange"
                    :on-remove="handleFileRemove"
                    :disabled="isProcessing || !formData.env"
                    :auto-upload="false"
                    :limit="1"
                    :accept="excelAccept"
                    action="#"
                  >
                    <el-button size="mini" type="primary" :disabled="isProcessing || !formData.env">选择文件</el-button>
                  </el-upload>
                </el-form-item>
              </el-form>
            </div>

            <!-- 导入状态显示 -->
            <div v-if="isProcessing" class="processing-status">
              <el-alert
                title="数据导入处理中......"
                type="info"
                :closable="false"
                show-icon>
              </el-alert>
            </div>

            <!-- 处理结果提示 -->
            <div v-if="processResult && !isProcessing" class="process-result">
              <el-alert
                :title="processResult.message"
                :type="processResult.type"
                :closable="false"
                show-icon>
              </el-alert>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" @click="handleProcess" :disabled="!canSubmit || isProcessing" :loading="isProcessing">
              加工
            </el-button>
            <el-button @click="handleReset" :disabled="isProcessing">
              重置
            </el-button>
          </div>
        </div>

        <!-- 右侧：日志区域 70% -->
        <div class="right-section">
          <div class="log-section">
            <div class="log-header">
              <el-button @click="clearLog" size="mini">清理</el-button>
            </div>
            <div class="log-output" ref="logContainer">
              <p v-for="(log, index) in logs" :key="index">
              <pre v-html="log"></pre>
              </p>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
  .dtp-data-import {
    padding: 12px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  /* 主布局：左右分栏 */
  .main-layout {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    /* 确保 sticky 定位的参考容器 */
    position: relative;
  }

  /* 左侧区域 30% */
  .left-section {
    width: 30%;
    display: flex;
    flex-direction: column;
    /* 关键：sticky 定位，滚动时固定在顶部 */
    position: sticky;
    top: 12px;
    align-self: flex-start;
    /* 确保高度由内容决定，不撑满 */
    height: fit-content;
  }

  .process-content {
    padding: 4px 0;
  }

  .action-buttons {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 6px;
    flex-wrap: wrap;
  }

  .process-result {
    margin-top: 6px;
  }

  .processing-status {
    margin-top: 6px;
    margin-bottom: 6px;
  }

  .el-upload__tip {
    margin-top: 4px;
    color: #909399;
    font-size: 12px;
  }

  .env-select {
    margin-bottom: 0;
  }

  /* 右侧区域 70% */
  .right-section {
    width: 70%;
    border-left: 1px solid #ebeef5;
    padding-left: 12px;
    min-height: 300px;
    /* 关键：右侧区域独立滚动 */
    overflow-y: auto;
    /* 限制最大高度为视口高度减去上下padding和header高度 */
    max-height: calc(100vh - 116px);
  }

  .log-section {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .log-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 6px;
  }

  .log-output {
    flex: 1;
    background-color: #1e1e1e;
    color: #d4d4d4;
    padding: 12px;
    border-radius: 4px;
    overflow-y: auto;
    /* 改为相对高度，适应父容器 */
    height: calc(100vh - 200px);
    min-height: 300px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
  }

  .log-output p {
    margin: 0;
    padding: 2px 0;
  }

  .log-output pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
  }

  /* 响应式：小屏幕时堆叠 */
  @media screen and (max-width: 992px) {
    .main-layout {
      flex-direction: column;
    }

    .left-section,
    .right-section {
      width: 100%;
    }

    .left-section {
      /* 小屏幕时取消 sticky，恢复正常文档流 */
      position: static;
      top: auto;
      align-self: auto;
    }

    .right-section {
      border-left: none;
      border-top: 1px solid #ebeef5;
      padding-left: 0;
      padding-top: 12px;
      margin-top: 12px;
      /* 小屏幕时取消固定高度限制 */
      max-height: none;
      overflow-y: visible;
    }

    .log-output {
      /* 小屏幕时恢复固定高度 */
      height: 400px;
    }
  }
</style>

<script>
import axios from 'axios'
import api from '@/api/tools/dtpDataImport'

export default {
  name: 'DtpDataImport',
  data() {
    return {
      formData: {
        env: ''
      },
      // 环境选项
      environments: [
        { id: 1, name: 'UAT1', ip: '9.6.163.34' },
        { id: 2, name: 'UAT2', ip: '9.6.124.162' },
        { id: 3, name: 'CT4', ip: '9.6.164.234' },
        { id: 4, name: 'UAT4', ip: '9.6.124.87' },
        { id: 5, name: 'UAT5', ip: '9.1.33.224' },
        { id: 6, name: 'UAT3', ip: '9.6.165.226' }
      ],
      // Excel文件类型配置
      excelAccept: '.xlsx,.xls,.xlsm,.xlsb,.ods,.csv',
      excelMimeTypes: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
        'application/vnd.oasis.opendocument.spreadsheet',
        'text/csv',
        'application/csv',
        'text/x-csv',
        'text/comma-separated-values'
      ],
      fileList: [],
      selectedFile: null,
      isProcessing: false,
      processResult: null,
      isViewMode: false,
      // 执行IP
      execIp: '',
      // smartweb Cookie
      smartwebCookie: '',
      // 文件ID
      pkId: '',
      // 流水号
      flowNum: '',
      // 错误列表
      errList: [],
      // 日志列表
      logs: []
    }
  },
  computed: {
    // 判断是否可以提交（需要选择环境和文件）
    canSubmit() {
      return this.formData.env && this.selectedFile !== null
    }
  },
  methods: {
    // 环境变化处理
    handleEnvChange(value) {
      if (value) {
        const env = this.environments.find(item => item.name === value)
        if (env) {
          this.execIp = env.ip
          // 环境名称显示为红色
          this.addLog(`已选择环境: <span style="color: #ff6b6b; font-weight: bold;">${env.name}</span> (${env.ip})`, 'info')
        }
      } else {
        this.execIp = ''
        this.addLog('已清空环境选择', 'warning')
      }
    },

    // 添加日志
    addLog(message, type = 'info') {
      const timestamp = new Date().toLocaleString()
      let color = '#d4d4d4'
      if (type === 'success') color = '#4ec9b0'
      if (type === 'error') color = '#f44747'
      if (type === 'warning') color = '#dcdcaa'

      const logHtml = `<span style="color: #858585;">[${timestamp}]</span> <span style="color: ${color};">${message}</span>`
      this.logs.push(logHtml)

      // 自动滚动到底部
      this.$nextTick(() => {
        if (this.$refs.logContainer) {
          this.$refs.logContainer.scrollTop = this.$refs.logContainer.scrollHeight
        }
      })
    },

    // 清理日志
    clearLog() {
      this.logs = []
    },

    // 检查文件扩展名
    isExcelByExtension(fileName) {
      const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
      const allowedExts = this.excelAccept.split(',')
      return allowedExts.includes(ext)
    },

    // 检查文件 MIME 类型
    isExcelByMimeType(fileType) {
      return this.excelMimeTypes.includes(fileType)
    },

    // 文件上传前的验证
    beforeUpload(file) {
      const isExcel = this.isExcelByMimeType(file.type) || this.isExcelByExtension(file.name)

      if (!isExcel) {
        this.$message.error(`只能上传 Excel 文件（${this.excelAccept} 格式）!`)
        return false
      }

      const isLt50M = file.size / 1024 / 1024 < 50
      if (!isLt50M) {
        this.$message.error('文件大小不能超过 50MB!')
        return false
      }

      return true
    },

    // 文件变化处理（限制单个文件）
    handleFileChange(file, fileList) {
      if (fileList.length > 1) {
        fileList = [fileList[fileList.length - 1]]
        this.$nextTick(() => {
          if (this.$refs.attachmentUpload) {
            this.$refs.attachmentUpload.fileList = fileList
          }
        })
      }
      this.fileList = fileList
      this.selectedFile = file.raw || file
      this.addLog(`已选择文件: ${file.name}`, 'info')
    },

    // 文件移除处理
    handleFileRemove(file, fileList) {
      this.fileList = fileList
      this.selectedFile = fileList.length > 0 ? (fileList[0].raw || fileList[0]) : null
      this.addLog('已移除文件', 'warning')
    },

    // 获取 Cookie
    async getCookie() {
      try {
        const result = await axios({
          method: 'post',
          url: `http://${this.execIp}:7080/smartweb/a/sys/login`,
          data: {
            body: {
              loginName: 'domain',
              pwd: 'c1f8f69c22ee7d15ba6b2bf618f2c03c',
              vrfyNo: '',
              vrfyNoKey: ''
            },
            appHead: { pageUrl: '/login' }
          },
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000,
          responseType: 'json'
        })
        this.smartwebCookie = result.data.body.token
        this.addLog('登录成功，获取Token', 'success')
      } catch (error) {
        console.error('登录失败:', error)
        this.addLog('登录失败，请检查网络或环境配置', 'error')
        throw error
      }
    },

    // 上传文件
    async uploadFile(file) {
      const uploadUrl = `http://${this.execIp}:7080/smartweb/a/sys/file/upload`

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('filename', file.name)

        const response = await axios.post(uploadUrl, formData, {
          headers: {
            'X-Access-Token': this.smartwebCookie,
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        })

        this.pkId = response.data.body.pkId
        this.addLog(`文件上传成功，pkId: ${this.pkId}`, 'success')
        return response.data
      } catch (error) {
        console.error('上传失败:', error)
        this.addLog('文件上传失败', 'error')
        throw error
      }
    },

    // 导入数据
    async importData() {
      const importUrl = `http://${this.execIp}:7080/smartweb/a/sendTest/importData`
      const payload = {
        appHead: { pageUrl: '/mscrv/sendTest/list' },
        body: { fileId: this.pkId }
      }

      try {
        const response = await axios.post(importUrl, payload, {
          headers: {
            'X-Access-Token': this.smartwebCookie,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        })

        const message = response.data.body
        this.addLog(message, 'info')

        // 提取流水号 - 显示为蓝色
        const match = message.match(/\[(\d+)\]/)
        this.flowNum = match ? match[1] : null
        if (this.flowNum) {
          this.addLog(`获取流水号: <span style="color: #569cd6; font-weight: bold;">${this.flowNum}</span>`, 'success')
        }

        this.$message.success('数据导入成功')
        return this.flowNum
      } catch (error) {
        console.error('导入数据失败:', error)
        this.$message.error('导入数据失败')
        throw error
      }
    },

    // 流水查询
    async flowQuery() {
      const flowUrl = `http://${this.execIp}:7080/smartweb/a/sendTest/list`
      const payload = {
        appHead: { pageUrl: '/mscrv/sendTest/list' },
        sysHead: {
          strRecSer: 1,
          reqRecNum: 10
        },
        body: {
          importStat: '03',
          seq: this.flowNum
        }
      }

      try {
        const response = await axios.post(flowUrl, payload, {
          headers: {
            'X-Access-Token': this.smartwebCookie,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        })

        this.errList = response.data.body
        this.$message.success('流水查询成功')
        return this.errList
      } catch (error) {
        console.error('流水查询失败:', error)
        this.$message.error('流水查询失败')
        throw error
      }
    },

    // 发送流水查询并写入数据库
    async sendFlowQuery() {
      try {
        await this.flowQuery()

        const queryData = this.errList.map(item => ({ ...item }))
        const pushData = JSON.stringify(queryData[0] || {})

        // 判断 pushData 是否有内容，有内容则显示为紫色
        const hasContent = queryData.length > 0 && Object.keys(queryData[0] || {}).length > 0
        const pushDataColor = hasContent ? '#c586c0' : '#d4d4d4'
        const pushDataStyle = hasContent ? 'font-weight: bold;' : ''

        this.addLog(
          `导入报错查询(undefined=ok)，默认显示一条：<span style="color: ${pushDataColor}; ${pushDataStyle}">${pushData}</span>`,
          'info'
        )

        // 写入数据库
        const baseData = {
          file_name: this.selectedFile.name,
          flowNum: this.flowNum,
          env: this.formData.env
        }

        const formtData = new FormData()
        formtData.append('base_data', JSON.stringify(baseData))
        formtData.append('err_list', JSON.stringify(queryData))

        // await api.send_flow_err_insert(formtData)
        // this.addLog('错误数据写入数据库完成', 'success')
      } catch (error) {
        console.error('流水查询或写入失败:', error)
        this.addLog('流水查询或写入失败', 'error')
      }

      this.isProcessing = false
      this.addLog(`<<span style="color: #4ec9b0; font: bold 16px sans-serif;">------可以开始下一个了</span>`, 'success')
    },

    // 加工
    async handleProcess() {
      if (this.isProcessing) {
        this.$message.warning('请等待流水任务查询完成')
        return
      }

      if (!this.formData.env) {
        this.$message.info('请选择一个环境')
        return
      }

      if (!this.selectedFile) {
        this.$message.info('请选择一个Excel文件')
        return
      }

      this.isProcessing = true
      this.processResult = null

      try {
        // 1. 获取 Cookie
        await this.getCookie()

        // 2. 上传文件
        await this.uploadFile(this.selectedFile)

        // 3. 导入数据
        await this.importData()

        // 4. 15秒后查询流水
        this.addLog('------------------【15s】后开始查询，并且写入schema，按钮已禁用-------------------', 'warning')

        setTimeout(() => {
          this.sendFlowQuery()
        }, 15000)
      } catch (error) {
        this.isProcessing = false
        this.processResult = {
          message: error.message || '加工失败',
          type: 'error'
        }
        this.addLog(`加工失败: ${error.message || '未知错误'}`, 'error')
      }
    },

    // 重置
    handleReset() {
      this.formData.env = ''
      this.selectedFile = null
      this.fileList = []
      this.pkId = ''
      this.flowNum = ''
      this.errList = []
      this.smartwebCookie = ''
      this.execIp = ''

      if (this.$refs.attachmentUpload) {
        this.$refs.attachmentUpload.clearFiles()
      }

      this.processResult = null
      this.addLog('已重置', 'warning')
      this.$message.info('已重置')
    }
  }
}
</script>
