<template>
  <div class="network-policy-list-process">
    <el-card>
      <div slot="header" class="card-header">
        <span class="title">网络策略清单加工</span>
      </div>

      <div class="process-content">
        <!-- 操作按钮区域 -->
        <div class="action-buttons">
          <el-button type="primary" icon="el-icon-download" @click="handleDownloadTemplate">
            下载模板
          </el-button>
          <el-button type="success" icon="el-icon-upload2" @click="handleOpenUploadDialog">
            上传加工
          </el-button>
        </div>
        <div class="upload-tip">
          仅支持 .xlsx 和 .xls 格式的 Excel 文件
        </div>

        <!-- 加工状态显示 -->
        <div v-if="processing" class="processing-status">
          <el-alert
            title="加工中......"
            type="info"
            :closable="false"
            show-icon>
          </el-alert>
        </div>

        <!-- 处理结果提示 -->
        <div v-if="processResult && !processing" class="process-result">
          <el-alert
            :title="processResult.message"
            :type="processResult.type"
            :closable="false"
            show-icon>
          </el-alert>
        </div>
      </div>

      <!-- 上传加工对话框 -->
      <el-dialog
        title="上传加工"
        :visible.sync="uploadDialogVisible"
        width="500px"
        :close-on-click-modal="false"
        @close="handleDialogClose">
        <el-upload
          ref="upload"
          :auto-upload="false"
          :limit="1"
          :accept="'.xlsx,.xls'"
          :on-change="handleFileChange"
          :before-upload="beforeUpload"
          :file-list="fileList"
          :on-remove="handleFileRemove"
          drag>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传xlsx/xls文件，且不超过10MB</div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleProcess" :disabled="!selectedFile || processing" :loading="processing">加工</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<style scoped>
.network-policy-list-process {
  padding: 20px;
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

.process-content {
  padding: 20px 0;
}

.action-buttons {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.action-buttons .el-upload {
  display: inline-block;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  margin-bottom: 20px;
}

.file-info {
  margin-top: 20px;
  margin-bottom: 20px;
}

.process-result {
  margin-top: 20px;
}

.processing-status {
  margin-top: 20px;
  margin-bottom: 20px;
}

.el-upload__tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>

<script>
import networkPolicyListApi from '@/api/tools/networkPolicyList'

export default {
  name: 'NetworkPolicyList',
  data() {
    return {
      uploadDialogVisible: false,
      fileList: [],
      selectedFile: null,
      processing: false,
      processResult: null
    }
  },
  computed: {
    hasFile() {
      return this.selectedFile !== null
    }
  },
  methods: {
    // 下载模板
    async handleDownloadTemplate() {
      try {
        const response = await networkPolicyListApi.downloadTemplate()

        // 检查响应数据
        if (!response || !response.data) {
          throw new Error('服务器返回空数据')
        }

        // 创建下载链接
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `网络策略清单模板_${new Date().getTime()}.xlsx`
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
        console.error('下载模板失败:', error)
        let errorMessage = '模板下载失败，请重试'
        if (error.message) {
          if (error.message.includes('Network Error') || error.message.includes('ERR_CONNECTION_REFUSED')) {
            errorMessage = '无法连接到服务器，请检查后端服务是否运行'
          } else {
            errorMessage = `模板下载失败: ${error.message}`
          }
        }
        this.$message.error(errorMessage)
      }
    },

    // 打开上传对话框
    handleOpenUploadDialog() {
      this.uploadDialogVisible = true
      // 清空之前选择的文件
      this.selectedFile = null
      this.fileList = []
      this.processResult = null
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
      }
    },

    // 对话框关闭处理
    handleDialogClose() {
      this.uploadDialogVisible = false
      // 清空选择的文件
      this.selectedFile = null
      this.fileList = []
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
      }
    },

    // 文件变化处理
    handleFileChange(file, fileList) {
      // 限制只能选择一个文件，如果选择了新文件，清除旧文件
      if (fileList.length > 1) {
        this.fileList = [fileList[fileList.length - 1]]
        this.$nextTick(() => {
          if (this.$refs.upload) {
            this.$refs.upload.fileList = this.fileList
          }
        })
      } else {
      this.fileList = fileList
      }
      this.selectedFile = file.raw || file
    },

    // 文件移除处理
    handleFileRemove() {
      this.selectedFile = null
      this.fileList = []
    },

    // 上传前验证
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.type === 'application/vnd.ms-excel' ||
                     file.name.endsWith('.xlsx') ||
                     file.name.endsWith('.xls')

      if (!isExcel) {
        this.$message.error('只能上传 Excel 文件（.xlsx 或 .xls 格式）!')
        return false
      }

      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB!')
        return false
      }

      return false // 阻止自动上传
    },

    // 加工处理
    async handleProcess() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择文件')
        return
      }

      this.processing = true
      this.processResult = null
      // 关闭对话框
      this.uploadDialogVisible = false

      try {
        const formData = new FormData()
        formData.append('file', this.selectedFile)

        const response = await networkPolicyListApi.processNetworkPolicyList(formData)

        // 检查响应数据
        if (!response || !response.data) {
          throw new Error('服务器返回空数据')
        }

        // 处理返回的文件流
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const timestamp = new Date().getTime()
        link.download = `网络策略清单_加工后_${timestamp}.xlsx`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 清理URL对象
        setTimeout(() => {
        window.URL.revokeObjectURL(url)
        }, 100)

        this.processResult = {
          type: 'success',
          message: '加工完成！文件已自动下载'
        }
        this.$message.success('加工完成，文件已下载')
        
        // 清空选择的文件
        this.selectedFile = null
        this.fileList = []
      } catch (error) {
        console.error('加工失败:', error)
        let errorMessage = '加工失败，请重试'
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
        this.processResult = {
          type: 'error',
          message: errorMessage
        }
        this.$message.error(errorMessage)
      } finally {
        this.processing = false
      }
    }
  }
}
</script>
