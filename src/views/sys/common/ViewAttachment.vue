<template>
  <div class="view-attachment-container">
    <div class="attachment-header">
      <div class="file-info">
        <i :class="getFileIcon(currentFileName)" class="file-icon"></i>
        <div class="file-details">
          <h2 class="file-name">{{ currentFileName }}</h2>
          <div class="file-meta">
            <span class="file-size">{{ formatFileSize(currentAttachmentSize) }}</span>
            <span class="upload-time">{{ formatDate(currentUploadDate) }}</span>
          </div>
        </div>
      </div>
      <div class="file-actions">
        <el-button type="primary" icon="el-icon-download" @click="downloadFile">
          下载
        </el-button>
        <el-button icon="el-icon-refresh" @click="refreshPreview">
          刷新
        </el-button>
      </div>
    </div>

    <div class="attachment-content">
        <!-- 图片预览 -->
      <ViewImageFile
        v-if="isImage"
        :attachment-id="currentAttachmentId"
        :file-name="currentFileName"
        :attachment-size="currentAttachmentSize"
        :upload-date="currentUploadDate"
        ref="imageViewer"
      />

        <!-- PDF预览 -->
      <ViewPdfFile
        v-else-if="isPdf"
        :attachment-id="currentAttachmentId"
        :file-name="currentFileName"
        :attachment-size="currentAttachmentSize"
        :upload-date="currentUploadDate"
        ref="pdfViewer"
      />

        <!-- 文本预览 -->
      <ViewTextFile
        v-else-if="isText"
        :attachment-id="currentAttachmentId"
        :file-name="currentFileName"
        :attachment-size="currentAttachmentSize"
        :upload-date="currentUploadDate"
        ref="textViewer"
      />
      

      <!-- Office预览 -->
      <ViewOfficeFile
        v-else-if="isOffice"
        :attachment-id="currentAttachmentId"
        :file-name="currentFileName"
        :attachment-size="currentAttachmentSize"
        :upload-date="currentUploadDate"
        ref="officeViewer"
      />

      <!-- 不支持的文件类型 -->
        <div v-else class="unsupported-preview">
          <i class="el-icon-document"></i>
          <h3>{{ currentFileName }}</h3>
          <p>此文件类型不支持在线预览</p>
        <el-button type="primary" @click="downloadFile">
          <i class="el-icon-download"></i>
            下载文件
          </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import ViewImageFile from './viewImageFile.vue'
import ViewPdfFile from './viewPdfFile.vue'
import ViewTextFile from './viewTextFile.vue'
import ViewOfficeFile from './viewOfficeFile.vue'
import fileUploadService from '@/api/sys/common/fileUploadService'

export default {
  name: 'ViewAttachment',
  components: {
    ViewImageFile,
    ViewPdfFile,
    ViewTextFile,
    ViewOfficeFile
  },
  props: {
    attachmentId: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
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
      loading: true
    }
  },
  computed: {
    // 从路由参数或props中获取attachmentId
    currentAttachmentId() {
      return this.attachmentId || this.$route.params.attachmentId || ''
    },
    
    // 从路由查询参数或props中获取fileName
    currentFileName() {
      return this.fileName || this.$route.query.fileName || ''
    },
    
    // 从路由查询参数或props中获取attachmentSize
    currentAttachmentSize() {
      return this.attachmentSize || parseInt(this.$route.query.attachmentSize) || 0
    },
    
    // 从路由查询参数或props中获取uploadDate
    currentUploadDate() {
      return this.uploadDate || this.$route.query.uploadDate || ''
    },
    // 是否为图片文件
    isImage() {
      if (!this.currentFileName) return false
      const ext = this.currentFileName.split('.').pop().toLowerCase()
      return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)
    },
    
    // 是否为PDF文件
    isPdf() {
      if (!this.currentFileName) return false
      const ext = this.currentFileName.split('.').pop().toLowerCase()
      return ext === 'pdf'
    },
    
    // 是否为文本文件
    isText() {
      if (!this.currentFileName) return false
      const ext = this.currentFileName.split('.').pop().toLowerCase()
      return [
        'txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'vue', 'ts', 'jsx', 'tsx',
        'yml', 'yaml', 'ini', 'cfg', 'conf', 'log', 'sql', 'sh', 'bat', 'ps1',
        'py', 'java', 'cpp', 'c', 'h', 'hpp', 'php', 'rb', 'go', 'rs',
        'properties', 'env', 'gitignore', 'dockerfile', 'makefile'
      ].includes(ext)
    },
    
    // 是否为Office文件
    isOffice() {
      if (!this.currentFileName) return false
      const ext = this.currentFileName.split('.').pop().toLowerCase()
      return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)
    }
  },
  created() {
    this.initAttachment()
  },
  watch: {
    // 监听路由参数变化
    '$route.params.attachmentId': {
      handler() {
        this.initAttachment()
      }
    },
    '$route.query': {
      handler() {
        this.initAttachment()
      }
    }
  },
  methods: {
    // 初始化附件信息
    async initAttachment() {
      try {
        this.loading = true
        
        // 可以在这里添加获取附件详细信息的逻辑
        console.log('初始化附件:', {
          attachmentId: this.currentAttachmentId,
          fileName: this.currentFileName,
          attachmentSize: this.currentAttachmentSize,
          uploadDate: this.currentUploadDate
        })
        
        // 获取文件扩展名进行调试
        const ext = this.currentFileName ? this.currentFileName.split('.').pop().toLowerCase() : 'no extension'
        console.log('文件扩展名:', ext)
        
        console.log('文件类型判断:', {
          isImage: this.isImage,
          isPdf: this.isPdf,
          isText: this.isText,
          isOffice: this.isOffice
        })
        
        // 检查文本文件支持列表
        const textExtensions = [
          'txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'vue', 'ts', 'jsx', 'tsx',
          'yml', 'yaml', 'ini', 'cfg', 'conf', 'log', 'sql', 'sh', 'bat', 'ps1',
          'py', 'java', 'cpp', 'c', 'h', 'hpp', 'php', 'rb', 'go', 'rs',
          'properties', 'env', 'gitignore', 'dockerfile', 'makefile'
        ]
        console.log('文本文件扩展名是否在支持列表中:', textExtensions.includes(ext))
        
      } catch (error) {
        console.error('初始化附件失败:', error)
        this.$message.error('加载附件失败')
      } finally {
        this.loading = false
      }
    },

    // 获取文件图标
    getFileIcon(fileName) {
      if (!fileName) return 'el-icon-document'

      const ext = fileName.split('.').pop().toLowerCase()

      // 图片文件
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext)) {
        return 'el-icon-picture'
      }
      
      // PDF文件
      if (ext === 'pdf') {
        return 'el-icon-document'
      }
      
      // 文本文件
      if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'vue', 'ts', 'jsx', 'tsx'].includes(ext)) {
        return 'el-icon-document'
      }
      
      // Office文件
      if (['doc', 'docx'].includes(ext)) {
        return 'el-icon-document'
      }
      if (['xls', 'xlsx'].includes(ext)) {
        return 'el-icon-s-grid'
      }
      if (['ppt', 'pptx'].includes(ext)) {
        return 'el-icon-picture'
      }
      
      // 默认图标
      return 'el-icon-document'
    },

    // 下载文件
    downloadFile() {
      try {
        // 根据文件类型调用不同的下载方法
        if (this.isPdf && this.$refs.pdfViewer) {
          this.$refs.pdfViewer.openPdfInNewWindow()
        } else if (this.isOffice && this.$refs.officeViewer) {
          this.$refs.officeViewer.downloadFile()
        } else {
          // 默认下载方法
          this.downloadAttachment()
        }
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error('下载失败')
      }
    },

    // 默认下载方法
    async downloadAttachment() {
      try {
        const response = await fileUploadService.downloadAttachment(this.currentAttachmentId, this.currentFileName)
        if (response.success) {
          this.$message.success('文件下载成功')
        } else {
          this.$message.error(response.message || '下载失败')
        }
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error('下载失败')
      }
    },

    // 刷新预览
    refreshPreview() {
      // 根据当前文件类型调用对应组件的刷新方法
      if (this.isImage && this.$refs.imageViewer) {
        this.$refs.imageViewer.refreshPreview()
      } else if (this.isPdf && this.$refs.pdfViewer) {
        this.$refs.pdfViewer.refreshPreview()
      } else if (this.isText && this.$refs.textViewer) {
        this.$refs.textViewer.retryLoad()
      } else if (this.isOffice && this.$refs.officeViewer) {
        this.$refs.officeViewer.refreshPreview()
      }
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
.view-attachment-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.attachment-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-icon {
  font-size: 32px;
  color: #409eff;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  word-break: break-all;
}

.file-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #909399;
}

.file-actions {
  display: flex;
  gap: 12px;
}

.attachment-content {
  flex: 1;
  overflow: hidden;
}

.unsupported-preview {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 40px;
}

.unsupported-preview i {
  font-size: 64px;
  margin-bottom: 20px;
  color: #909399;
}

.unsupported-preview h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #303133;
}

.unsupported-preview p {
  margin: 0 0 20px 0;
  color: #606266;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .attachment-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .file-info {
    flex-direction: column;
    text-align: center;
  }
  
  .file-meta {
    justify-content: center;
  }
  
  .file-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .attachment-header {
    padding: 15px;
  }
  
  .file-name {
    font-size: 16px;
  }
  
  .file-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .file-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .file-actions .el-button {
    width: 100%;
  }
}
</style>