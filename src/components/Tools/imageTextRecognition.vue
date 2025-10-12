<template>
  <div class="ocr-container">
    <div class="ocr-header">
      <h2>图片文字识别</h2>
      <p>支持多种图片格式的OCR文字识别</p>
    </div>

    <div class="ocr-content">
      <!-- 图片上传区域 -->
      <div class="upload-section">
        <el-upload
          ref="upload"
          class="upload-dragger"
          drag
          action="#"
          :before-upload="beforeUpload"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept="image/*"
          :limit="1"
          :auto-upload="false"
        >
          <div class="upload-area">
            <i class="el-icon-upload"></i>
            <div class="upload-text">
              <p>拖放图片到这里上传</p>
              <p>或者选择图片上传</p>
            </div>
            <div class="upload-hint">
              支持 JPG、PNG、GIF、BMP 格式，文件大小不超过 10MB
            </div>
          </div>
        </el-upload>

        <!-- 图片预览 -->
        <div v-if="uploadedImage" class="image-preview">
          <h3>图片预览</h3>
          <div class="preview-container">
            <img :src="uploadedImage" alt="上传的图片" class="preview-image" />
            <div class="image-info">
              <p><strong>文件名：</strong>{{ imageInfo.name }}</p>
              <p><strong>大小：</strong>{{ formatFileSize(imageInfo.size) }}</p>
              <p><strong>尺寸：</strong>{{ imageInfo.dimensions }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 识别结果区域 -->
      <div class="result-section">
        <div class="result-header">
          <h3>识别结果</h3>
          <div class="result-actions">
            <el-button
              type="primary"
              @click="startRecognition"
              :disabled="!uploadedImage || recognizing"
              :loading="recognizing"
            >
              {{ recognizing ? '识别中...' : '开始识别' }}
            </el-button>
            <el-button
              @click="copyResult"
              :disabled="!recognitionResult"
            >
              复制结果
            </el-button>
            <el-button
              @click="clearAll"
            >
              清空
            </el-button>
          </div>
        </div>

        <div class="result-content">
          <el-input
            v-model="recognitionResult"
            type="textarea"
            :rows="12"
            placeholder="识别结果将显示在这里..."
            readonly
            class="result-textarea"
          />

          <!-- 识别统计信息 -->
          <div v-if="recognitionResult" class="result-stats">
            <div class="stats-item">
              <span class="stats-label">识别字符数：</span>
              <span class="stats-value">{{ recognitionResult.length }} 个字符</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">识别行数：</span>
              <span class="stats-value">{{ getLineCount(recognitionResult) }} 行</span>
            </div>
            <div class="stats-item">
              <span class="stats-label">识别准确度：</span>
              <span class="stats-value">{{ accuracy }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 识别历史 -->
      <div v-if="recognitionHistory.length > 0" class="history-section">
        <h3>识别历史</h3>
        <div class="history-list">
          <div
            v-for="(item, index) in recognitionHistory"
            :key="index"
            class="history-item"
            @click="loadHistoryItem(item)"
          >
            <div class="history-info">
              <span class="history-time">{{ formatTime(item.time) }}</span>
              <span class="history-text">{{ truncateText(item.result, 50) }}</span>
            </div>
            <el-button
              type="text"
              size="small"
              @click.stop="deleteHistoryItem(index)"
              class="delete-btn"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import toolsetApi from '@/api/tools/toolset'

export default {
  name: 'ImageTextRecognition',
  data() {
    return {
      uploadedImage: '',
      imageInfo: {
        name: '',
        size: 0,
        dimensions: ''
      },
      recognitionResult: '',
      recognizing: false,
      accuracy: 0,
      recognitionHistory: [],
      currentFile: null // 当前上传的文件
    }
  },
  methods: {
    beforeUpload(file) {
      // 检查文件类型
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件！')
        return false
      }

      // 检查文件大小
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isLt10M) {
        this.$message.error('图片大小不能超过 10MB！')
        return false
      }

      return false // 阻止自动上传，手动处理
    },

    handleFileChange(file, fileList) {
      if (fileList.length > 0) {
        this.currentFile = file.raw
        this.previewImage(file.raw)
      }
    },

    previewImage(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.uploadedImage = e.target.result

        // 获取图片尺寸
        const img = new Image()
        img.onload = () => {
          this.imageInfo = {
            name: file.name,
            size: file.size,
            dimensions: `${img.width} × ${img.height}`
          }
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    },


    async startRecognition() {
      if (!this.currentFile) {
        this.$message.warning('请先上传图片')
        return
      }
      this.recognizing = true
      this.recognitionResult = ''
      try {
        // 准备FormData
        const formData = new FormData()
        formData.append('file', this.currentFile)
        formData.append('userId', this.getCurrentUserId())
        formData.append('engine', 'aliyun');  // 明确指定使用阿里云
        // 调用OCR API
        const response = await toolsetApi.recognizeImageText(formData)
        if (response.code === 200 || response.code === 20000) {
          this.recognitionResult = response.data.text
          this.accuracy = response.data.confidence || 95
          // 添加到历史记录
          if (this.recognitionResult.trim()) {
            this.addToHistory()
          }
          this.$message.success('文字识别完成')
        } else {
          this.$message.error('识别失败：' + (response.message || '未知错误'))
        }
      } catch (error) {
        console.error('识别失败:', error)
        this.$message.error('文字识别失败，请重试')
      } finally {
        this.recognizing = false
      }
    },


    copyResult() {
      if (!this.recognitionResult.trim()) {
        this.$message.warning('没有可复制的内容')
        return
      }

      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.recognitionResult).then(() => {
          this.$message.success('识别结果已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopy(this.recognitionResult)
        })
      } else {
        this.fallbackCopy(this.recognitionResult)
      }
    },

    fallbackCopy(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message.success('识别结果已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textArea)
    },

    clearAll() {
      this.uploadedImage = ''
      this.recognitionResult = ''
      this.accuracy = 0
      this.currentFile = null
      this.imageInfo = {
        name: '',
        size: 0,
        dimensions: ''
      }
      this.$refs.upload.clearFiles()
      this.$message.info('已清空所有内容')
    },

    addToHistory() {
      const historyItem = {
        time: new Date(),
        result: this.recognitionResult,
        imageInfo: { ...this.imageInfo }
      }

      this.recognitionHistory.unshift(historyItem)

      // 限制历史记录数量
      if (this.recognitionHistory.length > 10) {
        this.recognitionHistory = this.recognitionHistory.slice(0, 10)
      }

      // 保存到本地存储
      this.saveHistoryToLocal()
    },

    loadHistoryItem(item) {
      this.recognitionResult = item.result
      this.imageInfo = { ...item.imageInfo }
      this.$message.success('已加载历史记录')
    },

    deleteHistoryItem(index) {
      this.recognitionHistory.splice(index, 1)
      this.saveHistoryToLocal()
      this.$message.success('已删除历史记录')
    },

    saveHistoryToLocal() {
      try {
        localStorage.setItem('ocr-history', JSON.stringify(this.recognitionHistory))
      } catch (error) {
        console.error('保存历史记录失败:', error)
      }
    },

    loadHistoryFromLocal() {
      try {
        const history = localStorage.getItem('ocr-history')
        if (history) {
          this.recognitionHistory = JSON.parse(history).map(item => ({
            ...item,
            time: new Date(item.time)
          }))
        }
      } catch (error) {
        console.error('加载历史记录失败:', error)
        this.recognitionHistory = []
      }
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    getLineCount(text) {
      return text.split('\n').length
    },

    formatTime(date) {
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)

      if (minutes < 1) return '刚刚'
      if (minutes < 60) return `${minutes}分钟前`

      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}小时前`

      return date.toLocaleDateString()
    },

    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    },

    getToken() {
      // 获取用户token
      return localStorage.getItem('token') || ''
    },

    getCurrentUserId() {
      // 获取当前用户ID
      return localStorage.getItem('userId') || 'anonymous'
    }
  },

  mounted() {
    this.loadHistoryFromLocal()
  }
}
</script>

<style scoped>
.ocr-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.ocr-header {
  text-align: center;
  margin-bottom: 40px;
}

.ocr-header h2 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.ocr-header p {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.ocr-content {
  max-width: 1000px;
  margin: 0 auto;
}

.upload-section {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.upload-dragger {
  width: 100%;
}

.upload-area {
  padding: 40px;
  text-align: center;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
  background-color: #f0f9ff;
}

.upload-area .el-icon-upload {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.upload-text {
  margin-bottom: 15px;
}

.upload-text p {
  margin: 5px 0;
  font-size: 16px;
  color: #606266;
}

.upload-hint {
  font-size: 14px;
  color: #909399;
}

.image-preview {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #e4e7ed;
}

.image-preview h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 20px 0;
}

.preview-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.preview-image {
  max-width: 300px;
  max-height: 200px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-info {
  flex: 1;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.image-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}

.result-section {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-header h3 {
  font-size: 18px;
  color: #303133;
  margin: 0;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.result-content {
  margin-top: 20px;
}

.result-textarea {
  width: 100%;
}

.result-textarea >>> .el-textarea__inner {
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.8;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #fafafa;
  color: #303133;
  resize: vertical;
}

.result-stats {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
  display: flex;
  gap: 30px;
}

.stats-item {
  display: flex;
  align-items: center;
}

.stats-label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
}

.stats-value {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.history-section {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.history-section h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 20px 0;
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  background-color: #f8f9fa;
  border-color: #409eff;
}

.history-info {
  flex: 1;
}

.history-time {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.history-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.delete-btn {
  color: #f56c6c;
}

.delete-btn:hover {
  color: #f78989;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ocr-container {
    padding: 20px;
  }

  .upload-section,
  .result-section,
  .history-section {
    padding: 20px;
  }

  .upload-area {
    padding: 30px 20px;
  }

  .upload-area .el-icon-upload {
    font-size: 36px;
  }

  .upload-text p {
    font-size: 14px;
  }

  .preview-container {
    flex-direction: column;
  }

  .preview-image {
    max-width: 100%;
    max-height: 250px;
  }

  .result-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .result-actions {
    justify-content: center;
  }

  .result-stats {
    flex-direction: column;
    gap: 15px;
  }

  .history-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .upload-area {
    padding: 20px 15px;
  }

  .upload-area .el-icon-upload {
    font-size: 32px;
    margin-bottom: 15px;
  }

  .upload-text p {
    font-size: 13px;
  }

  .upload-hint {
    font-size: 12px;
  }

  .result-actions {
    flex-direction: column;
  }

  .result-actions .el-button {
    width: 100%;
  }
}
</style>
