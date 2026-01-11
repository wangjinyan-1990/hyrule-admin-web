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
          <el-upload
            ref="upload"
            :action="uploadAction"
            :auto-upload="false"
            :limit="1"
            :accept="'.xlsx,.xls'"
            :on-change="handleFileChange"
            :before-upload="beforeUpload"
            :file-list="fileList"
            :on-remove="handleFileRemove">
            <el-button slot="trigger" type="success" icon="el-icon-upload2">
              上传文件
            </el-button>
            <div slot="tip" class="el-upload__tip">
              仅支持 .xlsx 和 .xls 格式的 Excel 文件
            </div>
          </el-upload>
          <el-button 
            type="warning" 
            icon="el-icon-setting" 
            @click="handleProcess"
            :disabled="!hasFile || processing"
            :loading="processing">
            加工
          </el-button>
        </div>

        <!-- 文件信息显示 -->
        <div v-if="uploadedFile" class="file-info">
          <el-alert
            :title="`已上传文件: ${uploadedFile.name}`"
            type="success"
            :closable="false"
            show-icon>
          </el-alert>
        </div>

        <!-- 处理结果提示 -->
        <div v-if="processResult" class="process-result">
          <el-alert
            :title="processResult.message"
            :type="processResult.type"
            :closable="false"
            show-icon>
          </el-alert>
        </div>
      </div>
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
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.file-info {
  margin-top: 20px;
  margin-bottom: 20px;
}

.process-result {
  margin-top: 20px;
}

.el-upload__tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>

<script>
import networkPolicyListProcessApi from '@/api/tools/networkPolicyListProcess'

export default {
  name: 'NetworkPolicyListProcess',
  data() {
    return {
      uploadAction: '#',
      fileList: [],
      uploadedFile: null,
      processing: false,
      processResult: null
    }
  },
  computed: {
    hasFile() {
      return this.uploadedFile !== null
    }
  },
  methods: {
    // 下载模板
    async handleDownloadTemplate() {
      try {
        const response = await networkPolicyListProcessApi.downloadTemplate()
        
        // 创建下载链接
        const blob = new Blob([response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `网络策略清单模板_${new Date().getTime()}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        this.$message.success('模板下载成功')
      } catch (error) {
        console.error('下载模板失败:', error)
        this.$message.error('模板下载失败，请重试')
      }
    },

    // 文件变化处理
    handleFileChange(file, fileList) {
      this.fileList = fileList
      this.uploadedFile = file.raw || file
      this.processResult = null
    },

    // 文件移除处理
    handleFileRemove() {
      this.uploadedFile = null
      this.fileList = []
      this.processResult = null
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
      if (!this.uploadedFile) {
        this.$message.warning('请先上传文件')
        return
      }

      this.processing = true
      this.processResult = null

      try {
        const formData = new FormData()
        formData.append('file', this.uploadedFile)

        const response = await networkPolicyListProcessApi.processNetworkPolicyList(formData)

        // 处理返回的文件流
        const blob = new Blob([response], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const timestamp = new Date().getTime()
        link.download = `网络策略清单_加工后_${timestamp}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        this.processResult = {
          type: 'success',
          message: '加工完成！文件已自动下载'
        }
        this.$message.success('加工完成，文件已下载')
      } catch (error) {
        console.error('加工失败:', error)
        this.processResult = {
          type: 'error',
          message: error.response?.data?.message || error.message || '加工失败，请重试'
        }
        this.$message.error('加工失败，请重试')
      } finally {
        this.processing = false
      }
    }
  }
}
</script>
