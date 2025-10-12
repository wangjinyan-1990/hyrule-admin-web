<template>
  <div class="pdf-preview-container">
    <div class="pdf-content">
      <!-- 加载状态 -->
      <div v-if="pdfLoading" class="loading-pdf">
        <i class="el-icon-loading"></i>
        <p>正在加载PDF文件预览...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="pdfError" class="error-pdf">
        <i class="el-icon-warning"></i>
        <p>PDF文件预览失败，请尝试下载文件</p>
        <el-button type="primary" @click="downloadPdfFile">下载PDF文件</el-button>
      </div>
      
      <!-- PDF预览内容 -->
      <div v-else class="pdf-pages-container">
        <!-- vue-pdf渲染的页面 -->
        <div v-if="pdfSrc" class="pdf-vue-container">
          <div 
            v-for="i in numPages" 
            :key="i" 
            class="pdf-page-wrapper"
          >
            <div class="page-number">第 {{ i }} 页</div>
            <pdf 
              :src="pdfSrc" 
              :page="i"
              class="pdf-vue-page"
              @loaded="onPageLoaded"
              @error="onPageError"
            ></pdf>
          </div>
        </div>
        
        <!-- 备选方案：下载提示 -->
        <div v-else class="pdf-fallback">
          <div class="pdf-preview-info">
            <i class="el-icon-document"></i>
            <h3>{{ fileName }}</h3>
            <p>文件大小: {{ formatFileSize(attachmentSize) }}</p>
            <p>PDF文件预览</p>
          </div>
          
          <div class="pdf-preview-actions">
            <el-button 
              type="primary" 
              icon="el-icon-download" 
              @click="downloadPdfFile"
              size="large"
            >
              下载PDF文件
            </el-button>
          </div>
          
          <div class="pdf-preview-note">
            <p><i class="el-icon-info"></i> 由于浏览器限制，无法在此页面直接预览PDF文件</p>
            <p>请点击上方按钮下载PDF文件到本地查看</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fileUploadService from '@/api/sys/common/fileUploadService'
import pdf from 'vue-pdf'

export default {
  name: 'ViewPdfFile',
  components: {
    pdf
  },
  props: {
    attachmentId: {
      type: String,
      required: true
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
      pdfLoading: false,
      pdfError: false,
      numPages: 1, // PDF文件总页数
      pdfUrl: null, // PDF文件地址
      pdfSrc: null // PDF源文件
    }
  },
  created() {
    this.setupPdfViewer()
  },
  methods: {
    // 设置PDF查看器
    async setupPdfViewer() {
      try {
        this.pdfLoading = true
        this.pdfError = false
        
        console.log('开始设置PDF查看器...')
        
        // 获取PDF文件内容
        const response = await fileUploadService.downloadAttachment(this.attachmentId, this.fileName, false)
        console.log('PDF文件下载响应:', response)
        
        if (response.success && response.data) {
          // 创建Blob URL
          const blob = response.data.data || response.data
          const pdfUrl = URL.createObjectURL(blob)
          console.log('PDF Blob URL创建成功:', pdfUrl)
          
          // 使用vue-pdf加载PDF
          this.pdfTask(pdfUrl)
        } else {
          throw new Error(response.message || 'PDF文件下载失败')
        }
        
      } catch (error) {
        console.error('PDF加载失败:', error)
        this.pdfError = true
        this.pdfLoading = false
      }
    },

    // 使用vue-pdf加载PDF（按照博客方法）
    pdfTask(src) {
      const self = this
      const loadingTask = pdf.createLoadingTask(src)
      loadingTask.promise.then(pdfDoc => {
        console.log('PDF文档加载成功，总页数:', pdfDoc.numPages)
        self.pdfUrl = loadingTask
        self.pdfSrc = loadingTask
        self.numPages = pdfDoc.numPages
        self.pdfLoading = false
      }).catch((err) => {
        console.error('PDF加载失败:', err)
        self.pdfError = true
        self.pdfLoading = false
      })
    },

    // PDF页面加载完成
    onPageLoaded() {
      console.log('PDF页面加载完成')
    },

    // PDF页面加载错误
    onPageError(error) {
      console.error('PDF页面加载错误:', error)
      this.pdfError = true
    },

    // 下载PDF文件
    async downloadPdfFile() {
      try {
        this.$message({
          message: '正在下载文件...',
          type: 'info',
          duration: 1000
        })
        const result = await fileUploadService.downloadAttachment(this.attachmentId, this.fileName, true)
        if (result.success) {
          this.$message.success('文件下载成功')
        } else {
          this.$message.error(result.message || '文件下载失败')
        }
      } catch (error) {
        console.error('下载文件失败:', error)
        this.$message.error('下载文件失败')
      }
    },

    // 刷新预览
    refreshPreview() {
      // 重置状态
      this.pdfSrc = null
      this.numPages = 1
      this.pdfError = false
      
      // 清理Blob URL
      if (this.pdfUrl && this.pdfUrl.src && this.pdfUrl.src.startsWith('blob:')) {
        URL.revokeObjectURL(this.pdfUrl.src)
      }
      
      // 重新设置PDF查看器
      this.setupPdfViewer()
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.pdf-preview-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.pdf-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.loading-pdf,
.error-pdf {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-pdf i,
.error-pdf i {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.error-pdf i {
  color: #f56c6c;
}

.loading-pdf p,
.error-pdf p {
  color: #666;
  margin: 8px 0;
}

.pdf-pages-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.pdf-vue-container {
  padding: 20px;
}

.pdf-page-wrapper {
  margin-bottom: 20px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}

.page-number {
  background: #f8f9fa;
  padding: 8px 12px;
  font-size: 14px;
  color: #666;
  border-bottom: 1px solid #e6e6e6;
  text-align: center;
}

.pdf-vue-page {
  width: 100%;
  display: block;
}

.pdf-fallback {
  padding: 40px 20px;
  text-align: center;
}

.pdf-preview-info {
  margin-bottom: 30px;
}

.pdf-preview-info i {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.pdf-preview-info h3 {
  margin: 8px 0;
  color: #333;
}

.pdf-preview-info p {
  color: #666;
  margin: 4px 0;
}

.pdf-preview-actions {
  margin-bottom: 30px;
}

.pdf-preview-note {
  color: #999;
  font-size: 14px;
}

.pdf-preview-note p {
  margin: 4px 0;
}
</style>
