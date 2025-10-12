<template>
  <div class="image-base64-container">
    <div class="encoder-header">
      <h2>图片base64编码</h2>
      <p>将图片文件转换为base64编码格式</p>
    </div>
    
    <div class="encoder-form">
      <!-- 文件上传区域 -->
      <div class="upload-section">
        <div 
          class="upload-area"
          :class="{ 'is-dragover': isDragOver }"
          @click="triggerFileInput"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <div class="upload-icon">
            <i class="el-icon-upload"></i>
          </div>
          <div class="upload-text">
            <p>点击上传,或将文件拖拽到此处</p>
            <p class="upload-note">注:文件不宜过大(2M内)</p>
          </div>
        </div>
        
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileSelect"
        />
      </div>
      
      <!-- 转换结果显示 -->
      <div class="results-section" v-if="encodedData">
        <div class="result-group">
          <label class="result-label">Data Uri</label>
          <el-input
            v-model="dataUri"
            type="textarea"
            :rows="8"
            readonly
            class="result-textarea"
            placeholder="Data URI格式的base64编码将显示在这里..."
          />
          <el-button type="primary" @click="copyDataUri" :disabled="!dataUri">
            复制结果
          </el-button>
        </div>
        
        <div class="result-group">
          <label class="result-label">Base64 Data</label>
          <el-input
            v-model="base64Data"
            type="textarea"
            :rows="8"
            readonly
            class="result-textarea"
            placeholder="纯base64编码数据将显示在这里..."
          />
          <el-button type="primary" @click="copyBase64Data" :disabled="!base64Data">
            复制结果
          </el-button>
        </div>
        
        <!-- 图片预览 -->
        <div class="preview-section" v-if="imagePreview">
          <h4>图片预览</h4>
          <div class="image-preview">
            <img :src="imagePreview" alt="图片预览" />
          </div>
          <div class="image-info">
            <div class="info-item">
              <span class="info-label">文件名:</span>
              <span class="info-value">{{ fileName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">文件大小:</span>
              <span class="info-value">{{ formatFileSize(fileSize) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">图片尺寸:</span>
              <span class="info-value">{{ imageDimensions }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">MIME类型:</span>
              <span class="info-value">{{ mimeType }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageBase64Encoder',
  data() {
    return {
      isDragOver: false,
      encodedData: null,
      dataUri: '',
      base64Data: '',
      imagePreview: '',
      fileName: '',
      fileSize: 0,
      imageDimensions: '',
      mimeType: ''
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    
    handleDragOver(e) {
      this.isDragOver = true
    },
    
    handleDragLeave(e) {
      this.isDragOver = false
    },
    
    handleDrop(e) {
      this.isDragOver = false
      const files = e.dataTransfer.files
      if (files.length > 0) {
        this.processFile(files[0])
      }
    },
    
    handleFileSelect(e) {
      const file = e.target.files[0]
      if (file) {
        this.processFile(file)
      }
    },
    
    processFile(file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        this.$message.error('请选择图片文件')
        return
      }
      
      // 检查文件大小（2MB限制）
      const maxSize = 2 * 1024 * 1024 // 2MB
      if (file.size > maxSize) {
        this.$message.error('文件大小不能超过2MB')
        return
      }
      
      this.fileName = file.name
      this.fileSize = file.size
      this.mimeType = file.type
      
      // 读取文件并转换为base64
      const reader = new FileReader()
      reader.onload = (e) => {
        this.encodedData = e.target.result
        this.dataUri = this.encodedData
        this.base64Data = this.extractBase64Data(this.encodedData)
        
        // 创建图片预览
        this.createImagePreview()
        
        this.$message.success('图片编码完成')
      }
      
      reader.onerror = () => {
        this.$message.error('文件读取失败')
      }
      
      reader.readAsDataURL(file)
    },
    
    extractBase64Data(dataUri) {
      // 从Data URI中提取纯base64数据
      const commaIndex = dataUri.indexOf(',')
      if (commaIndex !== -1) {
        return dataUri.substring(commaIndex + 1)
      }
      return dataUri
    },
    
    createImagePreview() {
      if (this.encodedData) {
        const img = new Image()
        img.onload = () => {
          this.imageDimensions = `${img.width} × ${img.height}`
        }
        img.src = this.encodedData
        this.imagePreview = this.encodedData
      }
    },
    
    copyDataUri() {
      this.copyToClipboard(this.dataUri, 'Data URI')
    },
    
    copyBase64Data() {
      this.copyToClipboard(this.base64Data, 'Base64数据')
    },
    
    copyToClipboard(text, type) {
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          this.$message.success(`${type}已复制到剪贴板`)
        }).catch(() => {
          this.fallbackCopy(text, type)
        })
      } else {
        this.fallbackCopy(text, type)
      }
    },
    
    fallbackCopy(text, type) {
      // 兼容旧浏览器的复制方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message.success(`${type}已复制到剪贴板`)
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textArea)
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.image-base64-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.encoder-header {
  text-align: center;
  margin-bottom: 40px;
}

.encoder-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.encoder-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.encoder-form {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.upload-section {
  margin-bottom: 30px;
}

.upload-area {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.upload-area.is-dragover {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.upload-icon {
  font-size: 48px;
  color: #67c23a;
  margin-bottom: 20px;
}

.upload-text p {
  margin: 5px 0;
  color: #606266;
}

.upload-note {
  font-size: 12px;
  color: #909399;
}

.results-section {
  margin-bottom: 30px;
}

.result-group {
  margin-bottom: 25px;
}

.result-label {
  display: block;
  font-size: 16px;
  color: #303133;
  margin-bottom: 10px;
  font-weight: 600;
}

.result-textarea {
  width: 100%;
  margin-bottom: 15px;
}

.result-textarea >>> .el-textarea__inner {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #f5f7fa;
  color: #606266;
}

.result-group .el-button {
  min-width: 100px;
}

.preview-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #67c23a;
}

.preview-section h4 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
}

.image-preview {
  text-align: center;
  margin-bottom: 20px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.info-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-base64-container {
    padding: 20px;
  }
  
  .encoder-form {
    padding: 20px;
  }
  
  .upload-area {
    padding: 30px 20px;
  }
  
  .upload-icon {
    font-size: 36px;
  }
  
  .result-textarea >>> .el-textarea__inner {
    font-size: 11px;
  }
  
  .image-info {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

@media (max-width: 480px) {
  .upload-area {
    padding: 20px 15px;
  }
  
  .upload-icon {
    font-size: 28px;
  }
  
  .upload-text p {
    font-size: 14px;
  }
  
  .upload-note {
    font-size: 11px;
  }
  
  .result-group .el-button {
    width: 100%;
  }
}
</style>
