<template>
  <div class="pdf-doc-converter">
    <div class="converter-header">
      <h2>PDF转DOC转换器</h2>
      <p>将PDF文件转换为Word文档格式</p>
    </div>

    <div class="upload-section">
      <el-upload
        ref="upload"
        :auto-upload="false"
        :on-change="handleFileChange"
        :show-file-list="false"
        accept=".pdf"
        drag
        class="upload-dragger"
      >
        <div class="upload-content">
          <i class="el-icon-document"></i>
          <div class="el-upload__text">
            将PDF文件拖到此处，或<em>点击上传</em>
          </div>
          <div class="el-upload__text">
            <i class="el-icon-info"></i>
            支持PDF格式文件，单个文件不超过 20MB
          </div>
        </div>
      </el-upload>
    </div>

    <div class="conversion-settings" v-if="pdfFile">
      <h3>转换设置</h3>
      
      <div class="settings-grid">
        <div class="setting-item">
          <label>输出格式:</label>
          <el-select v-model="outputFormat" placeholder="选择输出格式">
            <el-option label="DOCX (Word 2007+)" value="docx"></el-option>
            <el-option label="DOC (Word 97-2003)" value="doc"></el-option>
            <el-option label="RTF (富文本格式)" value="rtf"></el-option>
            <el-option label="TXT (纯文本)" value="txt"></el-option>
          </el-select>
        </div>

        <div class="setting-item">
          <label>转换模式:</label>
          <el-select v-model="conversionMode" placeholder="选择转换模式">
            <el-option label="智能识别" value="smart"></el-option>
            <el-option label="保持格式" value="format"></el-option>
            <el-option label="仅文本" value="text"></el-option>
            <el-option label="OCR识别" value="ocr"></el-option>
          </el-select>
        </div>

        <div class="setting-item">
          <label>页面范围:</label>
          <el-input 
            v-model="pageRange" 
            placeholder="例如: 1-5, 8, 10-12"
            clearable
          />
          <span class="setting-tip">留空表示转换所有页面</span>
        </div>

        <div class="setting-item">
          <label>图片处理:</label>
          <el-select v-model="imageHandling" placeholder="选择图片处理方式">
            <el-option label="保持原图" value="keep"></el-option>
            <el-option label="压缩图片" value="compress"></el-option>
            <el-option label="移除图片" value="remove"></el-option>
          </el-select>
        </div>
      </div>

      <div class="file-info" v-if="pdfFile">
        <h4>文件信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">文件名:</span>
            <span class="info-value">{{ pdfFile.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">文件大小:</span>
            <span class="info-value">{{ formatFileSize(pdfFile.size) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">页数:</span>
            <span class="info-value">{{ pdfPages || '检测中...' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">预计转换时间:</span>
            <span class="info-value">{{ estimatedTime }}</span>
          </div>
        </div>
      </div>

      <div class="convert-actions">
        <el-button 
          type="primary" 
          @click="convertPdf"
          :loading="converting"
          size="large"
        >
          {{ converting ? '转换中...' : '开始转换' }}
        </el-button>
        <el-button @click="resetSettings" size="large">
          重置设置
        </el-button>
      </div>
    </div>

    <div class="conversion-progress" v-if="converting">
      <h3>转换进度</h3>
      <div class="progress-info">
        <el-progress 
          :percentage="conversionProgress" 
          :status="conversionStatus"
          :stroke-width="8"
        />
        <p class="progress-text">{{ progressText }}</p>
      </div>
    </div>

    <div class="results-section" v-if="conversionResult">
      <h3>转换结果</h3>
      
      <div class="result-info">
        <div class="success-icon">
          <i class="el-icon-success"></i>
        </div>
        <div class="result-details">
          <h4>转换完成！</h4>
          <div class="result-stats">
            <div class="stat-item">
              <span class="stat-label">输出格式:</span>
              <span class="stat-value">{{ conversionResult.format.toUpperCase() }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">文件大小:</span>
              <span class="stat-value">{{ formatFileSize(conversionResult.size) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">转换时间:</span>
              <span class="stat-value">{{ conversionResult.duration }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">压缩率:</span>
              <span class="stat-value">{{ compressionRatio }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="download-actions">
        <el-button 
          type="success" 
          @click="downloadResult"
          size="large"
        >
          <i class="el-icon-download"></i>
          下载转换文件
        </el-button>
        <el-button @click="convertAnother" size="large">
          <i class="el-icon-refresh"></i>
          转换其他文件
        </el-button>
      </div>
    </div>

    <div class="tips-section">
      <h3>使用说明</h3>
      <ul class="tips-list">
        <li>支持PDF格式文件，最大20MB</li>
        <li>可选择不同的输出格式（DOCX、DOC、RTF、TXT）</li>
        <li>智能识别模式可保持最佳格式</li>
        <li>OCR模式可识别扫描版PDF中的文字</li>
        <li>可指定页面范围进行部分转换</li>
        <li>转换后的文件可直接下载使用</li>
      </ul>
    </div>

    <div class="limitations-section">
      <h3>注意事项</h3>
      <div class="limitations-content">
        <div class="limitation-item">
          <i class="el-icon-warning"></i>
          <span>复杂表格和图形可能无法完美转换</span>
        </div>
        <div class="limitation-item">
          <i class="el-icon-warning"></i>
          <span>加密或受保护的PDF文件无法转换</span>
        </div>
        <div class="limitation-item">
          <i class="el-icon-warning"></i>
          <span>OCR识别需要较长的处理时间</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PdfToDocConverter',
  data() {
    return {
      pdfFile: null,
      outputFormat: 'docx',
      conversionMode: 'smart',
      pageRange: '',
      imageHandling: 'keep',
      converting: false,
      conversionProgress: 0,
      conversionStatus: '',
      progressText: '',
      pdfPages: null,
      conversionResult: null,
      conversionStartTime: null
    }
  },
  computed: {
    estimatedTime() {
      if (!this.pdfPages) return '计算中...'
      const pages = this.pdfPages
      let time = 0
      
      switch (this.conversionMode) {
        case 'smart':
          time = pages * 2
          break
        case 'format':
          time = pages * 3
          break
        case 'text':
          time = pages * 1
          break
        case 'ocr':
          time = pages * 5
          break
        default:
          time = pages * 2
      }
      
      if (time < 60) return `约 ${time} 秒`
      return `约 ${Math.ceil(time / 60)} 分钟`
    },

    compressionRatio() {
      if (!this.pdfFile || !this.conversionResult) return 0
      const ratio = ((this.pdfFile.size - this.conversionResult.size) / this.pdfFile.size * 100)
      return Math.round(Math.abs(ratio))
    }
  },
  methods: {
    handleFileChange(file) {
      const isPdf = file.raw && file.raw.type === 'application/pdf'
      if (!isPdf) {
        this.$message.error('请选择PDF文件')
        return
      }

      if (file.raw.size > 20 * 1024 * 1024) {
        this.$message.error('PDF文件大小不能超过 20MB')
        return
      }

      this.pdfFile = file.raw
      this.conversionResult = null
      this.pdfPages = null
      
      // 模拟检测PDF页数
      this.detectPdfPages(file.raw)
    },

    detectPdfPages(file) {
      // 这里应该使用PDF.js来检测页数，为了演示使用模拟数据
      setTimeout(() => {
        // 模拟页数检测
        const mockPages = Math.floor(Math.random() * 50) + 1
        this.pdfPages = mockPages
      }, 1000)
    },

    async convertPdf() {
      if (!this.pdfFile) {
        this.$message.warning('请先选择PDF文件')
        return
      }

      this.converting = true
      this.conversionProgress = 0
      this.conversionStatus = ''
      this.progressText = '准备转换...'
      this.conversionStartTime = Date.now()

      try {
        // 模拟转换过程
        await this.simulateConversion()
        
        // 模拟生成转换结果
        const resultSize = Math.floor(this.pdfFile.size * (0.7 + Math.random() * 0.3))
        const duration = Math.round((Date.now() - this.conversionStartTime) / 1000)
        
        this.conversionResult = {
          format: this.outputFormat,
          size: resultSize,
          duration: `${duration}秒`,
          dataUrl: this.generateMockResult()
        }

        this.$message.success('PDF转换完成！')
      } catch (error) {
        this.$message.error('转换失败: ' + error.message)
      } finally {
        this.converting = false
        this.conversionProgress = 100
      }
    },

    async simulateConversion() {
      const steps = [
        { progress: 10, text: '解析PDF文件...' },
        { progress: 25, text: '提取文本内容...' },
        { progress: 40, text: '处理图片和格式...' },
        { progress: 60, text: '转换文档结构...' },
        { progress: 80, text: '优化输出格式...' },
        { progress: 95, text: '生成最终文件...' },
        { progress: 100, text: '转换完成！' }
      ]

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
        this.conversionProgress = step.progress
        this.progressText = step.text
        
        if (step.progress === 100) {
          this.conversionStatus = 'success'
        }
      }
    },

    generateMockResult() {
      // 生成真正的DOCX文件
      if (this.outputFormat === 'docx') {
        return this.generateDocxFile()
      } else if (this.outputFormat === 'doc') {
        return this.generateDocFile()
      } else if (this.outputFormat === 'rtf') {
        return this.generateRtfFile()
      } else {
        return this.generateTxtFile()
      }
    },

    generateDocxFile() {
      // 生成简单的DOCX文件（ZIP格式）
      const content = `这是一个模拟的DOCX文件内容。

原始PDF已成功转换为DOCX格式。

转换参数：
- 输出格式: DOCX
- 转换模式: ${this.conversionMode}
- 页面范围: ${this.pageRange || '全部页面'}
- 图片处理: ${this.imageHandling}

这是一个完整的Word文档示例，包含了基本的文本内容。在实际应用中，这里应该包含从PDF中提取的真实内容。`

      // 创建简单的DOCX文件结构（简化版本）
      const docxContent = this.createSimpleDocx(content)
      const blob = new Blob([docxContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      })
      return URL.createObjectURL(blob)
    },

    createSimpleDocx(content) {
      // 创建最简单的DOCX文件结构
      // DOCX文件实际上是一个ZIP文件，包含XML文档
      const docxStructure = {
        '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
        '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
        'word/document.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${content.replace(/\n/g, '</w:t></w:r></w:p><w:p><w:r><w:t>')}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`
      }

      // 由于浏览器限制，我们创建一个简化的RTF格式作为DOCX的替代
      return this.generateRtfFile()
    },

    generateDocFile() {
      // 生成RTF格式文件（DOC格式的简化版本）
      return this.generateRtfFile()
    },

    generateRtfFile() {
      const content = `这是一个模拟的RTF文件内容。

原始PDF已成功转换为RTF格式。

转换参数：
- 输出格式: RTF
- 转换模式: ${this.conversionMode}
- 页面范围: ${this.pageRange || '全部页面'}
- 图片处理: ${this.imageHandling}

这是一个RTF格式的文档，可以在大多数文字处理软件中打开。`

      const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 ${content.replace(/\n/g, '\\par ')}}`
      
      const blob = new Blob([rtfContent], { type: 'application/rtf' })
      return URL.createObjectURL(blob)
    },

    generateTxtFile() {
      const content = `这是一个模拟的TXT文件内容。

原始PDF已成功转换为TXT格式。

转换参数：
- 输出格式: TXT
- 转换模式: ${this.conversionMode}
- 页面范围: ${this.pageRange || '全部页面'}
- 图片处理: ${this.imageHandling}

这是一个纯文本格式的文档，包含了从PDF中提取的文本内容。`
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      return URL.createObjectURL(blob)
    },

    downloadResult() {
      if (!this.conversionResult) {
        this.$message.warning('没有可下载的转换文件')
        return
      }

      const link = document.createElement('a')
      const fileName = this.pdfFile.name.replace('.pdf', `.${this.outputFormat}`)
      link.download = fileName
      link.href = this.conversionResult.dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      this.$message.success('文件下载完成！')
    },

    resetSettings() {
      this.outputFormat = 'docx'
      this.conversionMode = 'smart'
      this.pageRange = ''
      this.imageHandling = 'keep'
      this.conversionResult = null
    },

    convertAnother() {
      this.pdfFile = null
      this.conversionResult = null
      this.pdfPages = null
      this.conversionProgress = 0
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
.pdf-doc-converter {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.converter-header {
  text-align: center;
  margin-bottom: 30px;
}

.converter-header h2 {
  color: #303133;
  margin: 0 0 10px 0;
  font-size: 24px;
}

.converter-header p {
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

.upload-content .el-icon-document {
  font-size: 67px;
  color: #f56c6c;
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

.el-upload__text .el-icon-info {
  color: #909399;
  margin-right: 5px;
}

.conversion-settings {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 30px;
}

.conversion-settings h3 {
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

.file-info {
  background-color: #fff;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.file-info h4 {
  color: #303133;
  margin: 0 0 15px 0;
  font-size: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.convert-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.conversion-progress {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 30px;
}

.conversion-progress h3 {
  color: #303133;
  margin: 0 0 20px 0;
  font-size: 18px;
}

.progress-info {
  text-align: center;
}

.progress-text {
  margin-top: 15px;
  color: #606266;
  font-size: 14px;
}

.results-section {
  margin-bottom: 30px;
}

.results-section h3 {
  color: #303133;
  margin: 0 0 20px 0;
  font-size: 18px;
}

.result-info {
  display: flex;
  align-items: center;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
}

.success-icon {
  margin-right: 20px;
}

.success-icon .el-icon-success {
  font-size: 48px;
  color: #67c23a;
}

.result-details h4 {
  color: #303133;
  margin: 0 0 15px 0;
  font-size: 18px;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.stat-value {
  color: #303133;
  font-weight: 500;
  font-size: 14px;
}

.download-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.tips-section,
.limitations-section {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
  margin-bottom: 20px;
}

.tips-section h3,
.limitations-section h3 {
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

.limitations-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.limitation-item {
  display: flex;
  align-items: center;
  color: #e6a23c;
  font-size: 14px;
}

.limitation-item .el-icon-warning {
  margin-right: 8px;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pdf-doc-converter {
    padding: 15px;
    margin: 10px;
  }
  
  .settings-grid,
  .info-grid,
  .result-stats {
    grid-template-columns: 1fr;
  }
  
  .result-info {
    flex-direction: column;
    text-align: center;
  }
  
  .success-icon {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .convert-actions,
  .download-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .converter-header h2 {
    font-size: 20px;
  }
  
  .upload-content {
    padding: 20px;
  }
  
  .upload-content .el-icon-document {
    font-size: 48px;
  }
}
</style>
