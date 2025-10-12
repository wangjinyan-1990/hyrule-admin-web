<template>
  <div class="office-preview-container">
    <div class="office-content">
      <div v-if="loading" class="loading-container">
        <i class="el-icon-loading"></i>
        <p>正在加载文件...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <i class="el-icon-warning"></i>
        <p>文件加载失败</p>
        <div class="error-actions">
          <el-button type="primary" @click="retryLoad">重新加载</el-button>
          <el-button @click="downloadFile">下载文件</el-button>
        </div>
      </div>
      
      <div v-else class="office-preview">
        <div class="preview-info">
          <i :class="getOfficeIcon(fileName)" class="preview-icon"></i>
          <h3>{{ fileName }}</h3>
          <p>文件大小: {{ formatFileSize(attachmentSize) }}</p>
          <p>上传时间: {{ formatDate(uploadDate) }}</p>
          <p>Office文件预览</p>
        </div>
        
        <div class="preview-actions">
          <el-button 
            type="primary" 
            icon="el-icon-view" 
            @click="openInBrowser"
            size="large"
          >
            在线预览文档
          </el-button>
          <el-button 
            type="success" 
            icon="el-icon-download" 
            @click="downloadFile"
            size="large"
          >
            下载到本地
          </el-button>
        </div>
        
        <div class="preview-note">
          <p><i class="el-icon-info"></i> 由于浏览器限制，无法在此页面直接预览Office文件</p>
          <p>请点击上方按钮在线预览或下载到本地查看</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fileUploadService from '@/api/sys/common/fileUploadService'

export default {
  name: 'ViewOfficeFile',
  props: {
    attachmentId: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    attachmentSize: {
      type: Number,
      default: 0
    },
    uploadDate: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: true,
      error: false,
      previewUrl: ''
    }
  },
  created() {
    this.initOfficePreview()
  },
  methods: {
    // 初始化Office预览
    async initOfficePreview() {
      try {
        this.loading = true
        this.error = false
        
        // 设置预览URL
        this.previewUrl = fileUploadService.getAttachmentPreviewUrl(this.attachmentId, this.fileName)
        
        console.log('Office预览URL:', this.previewUrl)
      } catch (error) {
        console.error('初始化Office预览失败:', error)
        this.error = true
      } finally {
        this.loading = false
      }
    },

    // 获取Office文件图标
    getOfficeIcon(fileName) {
      if (!fileName) return 'el-icon-document'
      
      const ext = fileName.split('.').pop().toLowerCase()
      
      switch (ext) {
        case 'doc':
        case 'docx':
          return 'el-icon-document'
        case 'xls':
        case 'xlsx':
          return 'el-icon-s-grid'
        case 'ppt':
        case 'pptx':
          return 'el-icon-picture'
        case 'pdf':
          return 'el-icon-document'
        default:
          return 'el-icon-document'
      }
    },

    // 在线预览
    openInBrowser() {
      try {
        // 使用Google Docs Viewer进行在线预览
        const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(this.previewUrl)}&embedded=true`
        window.open(googleViewerUrl, '_blank')
        
        this.$message.success('正在打开在线预览...')
      } catch (error) {
        console.error('打开在线预览失败:', error)
        this.$message.error('在线预览失败')
      }
    },

    // 下载文件
    downloadFile() {
      try {
        // 创建下载链接
        const link = document.createElement('a')
        link.href = this.previewUrl
        link.download = this.fileName
        link.click()
        
        this.$message.success('文件下载成功')
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error('文件下载失败')
      }
    },

    // 重新加载
    retryLoad() {
      this.initOfficePreview()
    },

    // 刷新预览
    refreshPreview() {
      this.initOfficePreview()
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 格式化日期
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.office-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}


.office-content {
  flex: 1;
  overflow: auto;
  background: #fff;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  text-align: center;
}

.loading-container i {
  font-size: 32px;
  margin-bottom: 16px;
  animation: rotating 2s linear infinite;
}

.error-container i {
  font-size: 32px;
  margin-bottom: 16px;
  color: #f56c6c;
}

.error-actions {
  display: flex;
  gap: 10px;
}

.office-preview {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 40px;
  text-align: center;
}

.preview-info {
  margin-bottom: 30px;
}

.preview-icon {
  font-size: 64px;
  color: #409eff;
  margin-bottom: 20px;
}

.preview-info h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #303133;
}

.preview-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.preview-actions {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.preview-note {
  background-color: #f0f9ff;
  border: 1px solid #e1f5fe;
  border-radius: 6px;
  padding: 15px;
  max-width: 500px;
}

.preview-note p {
  margin: 5px 0;
  color: #1976d2;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.preview-note .el-icon-info {
  color: #1976d2;
}


@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .preview-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .office-preview {
    padding: 20px;
  }
  
  .preview-info h3 {
    font-size: 18px;
  }
  
  .preview-icon {
    font-size: 48px;
  }
  
}
</style>
