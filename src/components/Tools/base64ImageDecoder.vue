<template>
  <div class="base64-decoder-container">
    <div class="decoder-header">
      <h2>base64还原图片</h2>
      <p>将base64编码字符串还原为图片</p>
    </div>
    
    <div class="decoder-form">
      <!-- 输入区域 -->
      <div class="input-section">
        <h3>录入图片base 64</h3>
        <el-input
          v-model="base64Input"
          type="textarea"
          :rows="12"
          placeholder="请输入base64编码的图片数据..."
          class="base64-textarea"
          @input="handleInput"
        />
        <div class="input-actions">
          <el-button type="primary" @click="convertImage" :disabled="!base64Input.trim()">
            转换
          </el-button>
          <el-button type="danger" @click="clearInput">
            清除
          </el-button>
        </div>
        <div class="format-note">
          注格式如 data:image/jpeg;base64,iVBORw...
        </div>
      </div>
      
      <!-- 转换结果显示 -->
      <div class="result-section" v-if="decodedImage">
        <h3>转换结果</h3>
        
        <div class="image-display">
          <div class="image-container">
            <img 
              :src="decodedImage" 
              alt="还原的图片" 
              @load="onImageLoad"
              @error="onImageError"
            />
          </div>
        </div>
        
        <!-- 图片信息 -->
        <div class="image-info-section">
          <h4>图片信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">图片尺寸:</span>
              <span class="info-value">{{ imageDimensions }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">MIME类型:</span>
              <span class="info-value">{{ mimeType }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">文件大小:</span>
              <span class="info-value">{{ formatFileSize(base64Size) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">编码长度:</span>
              <span class="info-value">{{ base64Length }} 字符</span>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="result-actions">
          <el-button type="success" @click="downloadImage" :disabled="!decodedImage">
            下载图片
          </el-button>
          <el-button type="primary" @click="copyBase64" :disabled="!base64Input">
            复制Base64
          </el-button>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div class="error-section" v-if="errorMessage">
        <el-alert
          :title="errorMessage"
          type="error"
          :closable="false"
          show-icon>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Base64ImageDecoder',
  data() {
    return {
      base64Input: '',
      decodedImage: '',
      imageDimensions: '',
      mimeType: '',
      base64Size: 0,
      base64Length: 0,
      errorMessage: ''
    }
  },
  methods: {
    handleInput(value) {
      this.base64Input = value
      this.errorMessage = ''
      // 清除之前的解码结果
      if (this.decodedImage) {
        this.decodedImage = ''
      }
    },
    
    convertImage() {
      if (!this.base64Input.trim()) {
        this.$message.warning('请输入base64编码数据')
        return
      }
      
      try {
        let base64Data = this.base64Input.trim()
        
        // 检查并处理Data URI格式
        if (base64Data.startsWith('data:')) {
          // 提取MIME类型
          const mimeMatch = base64Data.match(/data:([^;]+);base64,(.+)/)
          if (mimeMatch) {
            this.mimeType = mimeMatch[1]
            base64Data = mimeMatch[2]
          } else {
            throw new Error('无效的Data URI格式')
          }
        } else {
          // 纯base64数据，尝试推断MIME类型
          this.mimeType = this.detectMimeType(base64Data)
        }
        
        // 验证base64格式
        if (!this.isValidBase64(base64Data)) {
          throw new Error('无效的base64编码格式')
        }
        
        // 构建Data URI
        const dataUri = `data:${this.mimeType};base64,${base64Data}`
        
        // 计算大小
        this.base64Size = this.calculateBase64Size(base64Data)
        this.base64Length = base64Data.length
        
        // 设置解码后的图片
        this.decodedImage = dataUri
        this.errorMessage = ''
        
        this.$message.success('图片转换成功')
      } catch (error) {
        this.errorMessage = error.message
        this.decodedImage = ''
        this.$message.error('转换失败: ' + error.message)
      }
    },
    
    detectMimeType(base64Data) {
      // 根据base64数据的前几个字符推断MIME类型
      const header = base64Data.substring(0, 10)
      
      if (header.startsWith('/9j/') || header.startsWith('iVBORw0KGgo')) {
        return 'image/jpeg'
      } else if (header.startsWith('iVBORw0KGgo') || header.startsWith('UklGR')) {
        return 'image/png'
      } else if (header.startsWith('R0lGOD')) {
        return 'image/gif'
      } else if (header.startsWith('UklGR')) {
        return 'image/webp'
      } else {
        return 'image/jpeg' // 默认类型
      }
    },
    
    isValidBase64(str) {
      // 检查base64格式
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
      return base64Regex.test(str) && str.length % 4 === 0
    },
    
    calculateBase64Size(base64Data) {
      // 计算base64数据的原始字节大小
      return Math.floor((base64Data.length * 3) / 4)
    },
    
    onImageLoad(event) {
      const img = event.target
      this.imageDimensions = `${img.naturalWidth} × ${img.naturalHeight}`
    },
    
    onImageError() {
      this.errorMessage = '图片数据无效，无法显示'
    },
    
    downloadImage() {
      if (!this.decodedImage) {
        this.$message.warning('没有可下载的图片')
        return
      }
      
      try {
        // 创建下载链接
        const link = document.createElement('a')
        link.href = this.decodedImage
        
        // 根据MIME类型确定文件扩展名
        let extension = 'jpg'
        if (this.mimeType.includes('png')) extension = 'png'
        else if (this.mimeType.includes('gif')) extension = 'gif'
        else if (this.mimeType.includes('webp')) extension = 'webp'
        
        link.download = `decoded_image_${new Date().getTime()}.${extension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        this.$message.success('图片下载成功')
      } catch (error) {
        this.$message.error('下载失败: ' + error.message)
      }
    },
    
    copyBase64() {
      if (!this.base64Input.trim()) {
        this.$message.warning('没有可复制的内容')
        return
      }
      
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.base64Input).then(() => {
          this.$message.success('Base64数据已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopy(this.base64Input)
        })
      } else {
        this.fallbackCopy(this.base64Input)
      }
    },
    
    fallbackCopy(text) {
      // 兼容旧浏览器的复制方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message.success('Base64数据已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textArea)
    },
    
    clearInput() {
      this.base64Input = ''
      this.decodedImage = ''
      this.errorMessage = ''
      this.imageDimensions = ''
      this.mimeType = ''
      this.base64Size = 0
      this.base64Length = 0
      this.$message.info('已清空所有内容')
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
.base64-decoder-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.decoder-header {
  text-align: center;
  margin-bottom: 40px;
}

.decoder-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.decoder-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.decoder-form {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.input-section {
  margin-bottom: 30px;
}

.input-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 18px;
}

.base64-textarea {
  width: 100%;
  margin-bottom: 15px;
}

.base64-textarea >>> .el-textarea__inner {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.base64-textarea >>> .el-textarea__inner:focus {
  border-color: #409eff;
  outline: none;
}

.input-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.input-actions .el-button {
  min-width: 100px;
}

.format-note {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

.result-section {
  margin-bottom: 30px;
}

.result-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

.image-display {
  text-align: center;
  margin-bottom: 25px;
}

.image-container {
  display: inline-block;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 10px;
  background-color: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-container img {
  max-width: 100%;
  max-height: 500px;
  border-radius: 4px;
}

.image-info-section {
  margin-bottom: 25px;
}

.image-info-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #67c23a;
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
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.result-actions .el-button {
  min-width: 120px;
}

.error-section {
  margin-bottom: 30px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .base64-decoder-container {
    padding: 20px;
  }
  
  .decoder-form {
    padding: 20px;
  }
  
  .input-actions {
    flex-direction: column;
  }
  
  .input-actions .el-button {
    width: 100%;
  }
  
  .result-actions {
    flex-direction: column;
  }
  
  .result-actions .el-button {
    width: 100%;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .base64-textarea >>> .el-textarea__inner {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .image-container {
    padding: 5px;
  }
  
  .image-container img {
    max-height: 300px;
  }
  
  .info-item {
    padding: 10px 12px;
  }
}
</style>
