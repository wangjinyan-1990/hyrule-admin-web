<template>
  <div class="image-compressor">
    <div class="compressor-header">
      <h2>图片压缩工具</h2>
      <p>支持多种格式图片压缩，减小文件大小</p>
    </div>

    <div class="upload-section">
      <el-upload
        ref="upload"
        :auto-upload="false"
        :on-change="handleFileChange"
        :show-file-list="false"
        accept="image/*"
        drag
        class="upload-dragger"
      >
        <div class="upload-content">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            将图片拖到此处，或<em>点击上传</em>
          </div>
          <div class="el-upload__tip">
            支持 JPG、PNG、GIF、WebP 格式，单个文件不超过 10MB
          </div>
        </div>
      </el-upload>
    </div>

    <div class="compression-settings" v-if="originalFile">
      <h3>压缩设置</h3>

      <div class="settings-grid">
        <div class="setting-item">
          <label>图片质量:</label>
          <el-slider
            v-model="quality"
            :min="10"
            :max="100"
            :step="5"
            show-input
            show-input-controls
            input-size="small"
          />
          <span class="setting-tip">数值越高质量越好，文件越大</span>
        </div>

        <div class="setting-item">
          <label>输出格式:</label>
          <el-select v-model="outputFormat" placeholder="选择输出格式">
            <el-option label="保持原格式" value="original"></el-option>
            <el-option label="JPEG" value="jpeg"></el-option>
            <el-option label="PNG" value="png"></el-option>
            <el-option label="WebP" value="webp"></el-option>
          </el-select>
        </div>

        <div class="setting-item">
          <label>最大宽度:</label>
          <el-input-number
            v-model="maxWidth"
            :min="100"
            :max="4000"
            :step="50"
            placeholder="不限制"
            controls-position="right"
          />
          <span class="setting-tip">像素，0表示不限制</span>
        </div>

        <div class="setting-item">
          <label>最大高度:</label>
          <el-input-number
            v-model="maxHeight"
            :min="100"
            :max="4000"
            :step="50"
            placeholder="不限制"
            controls-position="right"
          />
          <span class="setting-tip">像素，0表示不限制</span>
        </div>
      </div>

      <div class="compress-actions">
        <el-button
          type="primary"
          @click="compressImage"
          :loading="compressing"
          size="large"
        >
          {{ compressing ? '压缩中...' : '开始压缩' }}
        </el-button>
        <el-button @click="resetSettings" size="large">
          重置设置
        </el-button>
      </div>
    </div>

    <div class="results-section" v-if="compressedResult">
      <h3>压缩结果</h3>

      <div class="result-comparison">
        <div class="image-preview">
          <h4>原始图片</h4>
          <div class="preview-container">
            <img :src="originalPreview" alt="原始图片" />
            <div class="image-info">
              <p><strong>文件大小:</strong> {{ formatFileSize(originalFile.size) }}</p>
              <p><strong>尺寸:</strong> {{ originalDimensions.width }} × {{ originalDimensions.height }}</p>
              <p><strong>格式:</strong> {{ originalFile.type }}</p>
            </div>
          </div>
        </div>

        <div class="vs-divider">
          <span>VS</span>
        </div>

        <div class="image-preview">
          <h4>压缩后</h4>
          <div class="preview-container">
            <img :src="compressedResult.dataUrl" alt="压缩后图片" />
            <div class="image-info">
              <p><strong>文件大小:</strong> {{ formatFileSize(compressedResult.size) }}</p>
              <p><strong>尺寸:</strong> {{ compressedResult.width }} × {{ compressedResult.height }}</p>
              <p><strong>压缩率:</strong> {{ compressionRatio }}%</p>
            </div>
          </div>
        </div>
      </div>

      <div class="download-actions">
        <el-button
          type="success"
          @click="downloadCompressed"
          size="large"
        >
          下载压缩图片
        </el-button>
        <el-button @click="compressAnother" size="large">
          压缩其他图片
        </el-button>
      </div>
    </div>

    <div class="tips-section">
      <h3>使用说明</h3>
      <ul class="tips-list">
        <li>支持拖拽上传或点击选择图片文件</li>
        <li>可调整压缩质量，平衡文件大小和图片质量</li>
        <li>支持改变输出格式，WebP格式压缩效果最佳</li>
        <li>可设置最大尺寸，自动按比例缩放</li>
        <li>压缩后的图片可直接下载使用</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageCompressor',
  data() {
    return {
      originalFile: null,
      originalPreview: null,
      originalDimensions: { width: 0, height: 0 },
      quality: 90,
      outputFormat: 'original',
      maxWidth: 1200,
      maxHeight: 700,
      compressing: false,
      compressedResult: null
    }
  },
  computed: {
    compressionRatio() {
      if (!this.originalFile || !this.compressedResult) return 0
      const ratio = ((this.originalFile.size - this.compressedResult.size) / this.originalFile.size * 100)
      return Math.round(ratio)
    }
  },
  methods: {
    handleFileChange(file) {
      const isImage = file.raw && file.raw.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('请选择图片文件')
        return
      }

      if (file.raw.size > 20 * 1024 * 1024) {
        this.$message.error('图片文件大小不能超过 20MB')
        return
      }

      this.originalFile = file.raw
      this.compressedResult = null

      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        this.originalPreview = e.target.result
        this.getImageDimensions(e.target.result)
      }
      reader.readAsDataURL(file.raw)
    },

    getImageDimensions(dataUrl) {
      const img = new Image()
      img.onload = () => {
        this.originalDimensions = {
          width: img.width,
          height: img.height
        }
      }
      img.src = dataUrl
    },

    async compressImage() {
      if (!this.originalFile) {
        this.$message.warning('请先选择图片')
        return
      }

      this.compressing = true

      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = this.originalPreview
        })

        // 计算新尺寸
        let { width, height } = this.calculateNewDimensions(img.width, img.height)

        canvas.width = width
        canvas.height = height

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)

        // 确定输出格式
        const outputFormat = this.outputFormat === 'original'
          ? this.originalFile.type
          : `image/${this.outputFormat}`

        // 压缩并生成结果
        const quality = this.quality / 100
        const dataUrl = canvas.toDataURL(outputFormat, quality)

        // 计算压缩后文件大小
        const base64Length = dataUrl.length - dataUrl.indexOf(',') - 1
        const size = Math.round(base64Length * 0.75) // Base64 到二进制的大小转换

        this.compressedResult = {
          dataUrl,
          size,
          width,
          height,
          format: outputFormat
        }

        this.$message.success('图片压缩完成！')
      } catch (error) {
        this.$message.error('压缩失败: ' + error.message)
      } finally {
        this.compressing = false
      }
    },

    calculateNewDimensions(originalWidth, originalHeight) {
      let width = originalWidth
      let height = originalHeight

      // 如果设置了最大尺寸，按比例缩放
      if (this.maxWidth > 0 || this.maxHeight > 0) {
        const maxW = this.maxWidth || originalWidth
        const maxH = this.maxHeight || originalHeight

        const ratioW = maxW / originalWidth
        const ratioH = maxH / originalHeight
        const ratio = Math.min(ratioW, ratioH, 1) // 不放大图片

        width = Math.round(originalWidth * ratio)
        height = Math.round(originalHeight * ratio)
      }

      return { width, height }
    },

    downloadCompressed() {
      if (!this.compressedResult) {
        this.$message.warning('没有可下载的压缩图片')
        return
      }

      const link = document.createElement('a')
      link.download = `compressed_${this.originalFile.name}`
      link.href = this.compressedResult.dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      this.$message.success('图片下载完成！')
    },

    resetSettings() {
      this.quality = 90
      this.outputFormat = 'original'
      this.maxWidth = 1200
      this.maxHeight = 700
      this.compressedResult = null
    },

    compressAnother() {
      this.originalFile = null
      this.originalPreview = null
      this.originalDimensions = { width: 0, height: 0 }
      this.compressedResult = null
      this.$refs.upload.clearFiles()
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.image-compressor {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.compressor-header {
  text-align: center;
  margin-bottom: 30px;
}

.compressor-header h2 {
  color: #303133;
  margin: 0 0 10px 0;
  font-size: 24px;
}

.compressor-header p {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.upload-section {
  margin-bottom: 30px;
}

.upload-dragger {
  width: 100%;
}

.upload-content {
  padding: 40px;
  text-align: center;
}

.upload-content .el-icon-upload {
  font-size: 67px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.el-upload__text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 10px;
}

.el-upload__text em {
  color: #409eff;
  font-style: normal;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
}

.compression-settings {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 30px;
}

.compression-settings h3 {
  color: #303133;
  margin: 0 0 20px 0;
  font-size: 18px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
}

.setting-item label {
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

.setting-tip {
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
}

.compress-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.results-section {
  margin-bottom: 30px;
}

.results-section h3 {
  color: #303133;
  margin: 0 0 20px 0;
  font-size: 18px;
}

.result-comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: start;
  margin-bottom: 20px;
}

.image-preview h4 {
  color: #606266;
  margin: 0 0 15px 0;
  text-align: center;
  font-size: 16px;
}

.preview-container {
  text-align: center;
}

.preview-container img {
  max-width: 100%;
  max-height: 300px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  margin-bottom: 15px;
}

.image-info {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 10px;
  text-align: left;
}

.image-info p {
  margin: 5px 0;
  font-size: 13px;
  color: #606266;
}

.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
}

.vs-divider span {
  background-color: #409eff;
  color: white;
  padding: 8px 16px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
}

.download-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.tips-section {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
}

.tips-section h3 {
  color: #303133;
  margin: 0 0 15px 0;
  font-size: 16px;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.tips-list li {
  margin-bottom: 5px;
  font-size: 14px;
  line-height: 1.5;
}

.tips-list li:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-compressor {
    padding: 15px;
    margin: 10px;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  .result-comparison {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .vs-divider {
    height: auto;
    padding: 10px 0;
  }

  .compress-actions,
  .download-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .compressor-header h2 {
    font-size: 20px;
  }

  .upload-content {
    padding: 20px;
  }

  .upload-content .el-icon-upload {
    font-size: 48px;
  }
}
</style>
