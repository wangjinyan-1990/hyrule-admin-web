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
  methods: {
    // 初始化图片预览
    async initImagePreview() {
      try {
        this.loading = true
        this.error = false
        
        // 设置预览URL
        this.previewUrl = fileUploadService.getAttachmentPreviewUrl(this.attachmentId, this.fileName)
        
        console.log('图片预览URL:', this.previewUrl)
      } catch (error) {
        console.error('初始化图片预览失败:', error)
        this.error = true
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
      this.initImagePreview()
    },

    // 刷新预览
    refreshPreview() {
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
