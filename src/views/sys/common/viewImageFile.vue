<template>
  <div class="image-preview-container">
    <div v-loading="loading" class="preview-container">
      <div v-if="loading" class="loading-container">
        <i class="el-icon-loading"></i>
        <p>正在加载图片...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <i class="el-icon-warning"></i>
        <p>图片加载失败</p>
        <el-button type="primary" @click="retryLoad">重新加载</el-button>
      </div>
      
      <div v-else class="image-preview">
        <img
          :src="previewUrl"
          :alt="fileName"
          @error="handleImageError"
          @load="handleImageLoad"
        />
      </div>
    </div>
    
    <div class="image-tips">
      <p><i class="el-icon-info"></i> 提示：支持 JPG、PNG、GIF、BMP、SVG 等图片格式</p>
    </div>
  </div>
</template>

<script>
import fileUploadService from '@/api/sys/common/fileUploadService'

export default {
  name: 'ViewImageFile',
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
    this.initImagePreview()
  },
  beforeDestroy() {
    // 清理Blob URL，避免内存泄漏
    if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.previewUrl)
    }
  },
  methods: {
    // 初始化图片预览
    async initImagePreview() {
      try {
        this.loading = true
        this.error = false
        
        console.log('开始加载图片文件:', {
          attachmentId: this.attachmentId,
          fileName: this.fileName
        })
        
        // 使用下载接口获取图片文件内容
        const response = await fileUploadService.downloadAttachment(this.attachmentId, this.fileName, false)
        
        console.log('图片文件下载响应:', response)
        
        if (response.success && response.data) {
          // 获取图片数据
          let blob
          if (response.data.data) {
            blob = response.data.data
          } else {
            blob = response.data
          }
          
          // 创建Blob URL用于图片显示
          this.previewUrl = URL.createObjectURL(blob)
          console.log('图片Blob URL创建成功:', this.previewUrl)
        } else {
          throw new Error(response.message || '图片文件加载失败')
        }
      } catch (error) {
        console.error('图片加载失败:', error)
        this.error = true
        this.$message.error('图片文件加载失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 图片加载成功
    handleImageLoad() {
      console.log('图片加载成功')
    },

    // 图片加载失败
    handleImageError() {
      console.error('图片加载失败')
      this.error = true
      this.loading = false
    },

    // 重新加载
    retryLoad() {
      this.refreshPreview()
    },

    // 刷新预览
    refreshPreview() {
      // 清理之前的Blob URL
      if (this.previewUrl && this.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.previewUrl)
      }
      
      // 重新初始化预览
      this.initImagePreview()
    }
  }
}
</script>

<style scoped>
.image-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  background: #f5f5f5;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

.image-preview {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-tips {
  padding: 10px 20px;
  background: #f0f9ff;
  border-top: 1px solid #e1f5fe;
  text-align: center;
}

.image-tips p {
  margin: 0;
  color: #1976d2;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.image-tips .el-icon-info {
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
  .preview-container {
    padding: 10px;
  }
  
  .image-preview img {
    border-radius: 2px;
  }
}
</style>
