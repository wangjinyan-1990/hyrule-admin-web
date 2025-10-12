<template>
  <div class="text-deduplicator-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" icon="el-icon-document" @click="createNew">
          新建
        </el-button>
        <el-button icon="el-icon-upload2" @click="loadFile">
          加载文件
        </el-button>
        <el-dropdown @command="handleSettings" trigger="click">
          <el-button>
            设置<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="ignoreWhitespace">
              <el-checkbox v-model="settings.ignoreWhitespace">忽略空白字符</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item command="ignoreCase">
              <el-checkbox v-model="settings.ignoreCase">忽略大小写</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item command="ignoreEmptyLines">
              <el-checkbox v-model="settings.ignoreEmptyLines">忽略空行</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item command="preserveOrder">
              <el-checkbox v-model="settings.preserveOrder">保持原顺序</el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      
      <div class="toolbar-right">
        <el-button icon="el-icon-full-screen" @click="toggleFullscreen">
          全屏
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧输入区域 -->
      <div class="input-panel">
        <div class="panel-header">
          <span class="panel-title">原始文本</span>
          <div class="panel-actions">
            <el-button size="mini" icon="el-icon-edit" @click="toggleEditMode">
              {{ editMode ? '预览' : '编辑' }}
            </el-button>
          </div>
        </div>
        <div class="panel-content">
          <div v-if="editMode" class="edit-area">
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="25"
              placeholder="在此输入需要去重的文本内容..."
              @input="onTextChange"
            ></el-input>
          </div>
          <div v-else class="view-area">
            <div class="line-numbers">
              <div
                v-for="(line, index) in inputLines"
                :key="index"
                class="line-number"
                :class="{ 'duplicate-line': line.isDuplicate }"
              >
                {{ index + 1 }}
              </div>
            </div>
            <div class="text-content">
              <div
                v-for="(line, index) in inputLines"
                :key="index"
                class="text-line"
                :class="{ 'duplicate-line': line.isDuplicate }"
              >
                <span v-html="line.content"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间操作区域 -->
      <div class="operation-panel">
        <div class="operation-controls">
          <div class="action-buttons">
            <el-button 
              icon="el-icon-arrow-right" 
              @click="performDeduplication"
              :disabled="!inputText.trim()"
              size="small"
              class="arrow-only-btn"
            >
            </el-button>
          </div>
        </div>
      </div>

      <!-- 右侧结果区域 -->
      <div class="result-panel">
        <div class="panel-header">
          <span class="panel-title">去重结果</span>
          <div class="panel-actions">
            <el-button size="mini" icon="el-icon-copy-document" @click="copyResult" :disabled="!resultText">复制</el-button>
            <el-button size="mini" icon="el-icon-download" @click="downloadResult" :disabled="!resultText">下载</el-button>
          </div>
        </div>
        <div class="panel-content">
          <div class="result-area">
            <div class="line-numbers">
              <div
                v-for="(line, index) in resultLines"
                :key="index"
                class="line-number"
              >
                {{ index + 1 }}
              </div>
            </div>
            <div class="text-content">
              <div
                v-for="(line, index) in resultLines"
                :key="index"
                class="text-line"
              >
                <span>{{ line }}</span>
              </div>
              <div v-if="resultLines.length === 0" class="empty-result">
                去重结果将显示在这里
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件上传对话框 -->
    <el-dialog title="选择文件" :visible.sync="fileDialogVisible" width="400px">
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".txt,.md,.json,.xml,.html,.css,.js,.vue,.py,.java,.cpp,.c,.h,.hpp,.cs,.php,.rb,.go,.rs,.jsx,.tsx,.ts,.sql"
        :file-list="[]"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">支持文本文件格式</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="fileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmFileUpload">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TextDeduplicator',
  data() {
    return {
      inputText: `apple
banana
Apple
orange
banana
grape
apple
orange
kiwi
Banana`,
      inputLines: [],
      resultText: '',
      resultLines: [],
      uniqueLines: [],
      editMode: false,
      settings: {
        ignoreCase: false,
        ignoreWhitespace: false,
        ignoreEmptyLines: false,
        preserveOrder: true
      },
      fileDialogVisible: false,
      uploadFile: null
    }
  },
  computed: {
    duplicateCount() {
      return this.inputLines.length - this.uniqueLines.length
    }
  },
  watch: {
    inputText() {
      this.parseInputText()
    },
    settings: {
      handler() {
        this.parseInputText()
      },
      deep: true
    }
  },
  mounted() {
    this.parseInputText()
  },
  methods: {
    createNew() {
      this.$confirm('确定要清空所有内容吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.inputText = ''
        this.resultText = ''
        this.$message({
          message: '已清空',
          type: 'success',
          duration: 1500
        })
      })
    },
    
    loadFile() {
      this.fileDialogVisible = true
    },
    
    handleFileChange(file) {
      this.uploadFile = file
    },
    
    confirmFileUpload() {
      if (!this.uploadFile) {
        this.$message({
          message: '请选择文件',
          type: 'warning',
          duration: 1500
        })
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        this.inputText = e.target.result
        this.$message({
          message: '文件加载成功',
          type: 'success',
          duration: 1500
        })
        this.fileDialogVisible = false
        this.uploadFile = null
      }
      reader.readAsText(this.uploadFile.raw)
    },
    
    toggleEditMode() {
      this.editMode = !this.editMode
    },
    
    onTextChange() {
      // 延迟解析，避免频繁计算
      clearTimeout(this.parseTimeout)
      this.parseTimeout = setTimeout(() => {
        this.parseInputText()
      }, 300)
    },
    
    parseInputText() {
      if (!this.inputText.trim()) {
        this.inputLines = []
        this.resultLines = []
        this.uniqueLines = []
        return
      }
      
      const lines = this.inputText.split('\n')
      this.inputLines = lines.map((line, index) => {
        let processedLine = line
        
        // 应用设置
        if (this.settings.ignoreCase) {
          processedLine = processedLine.toLowerCase()
        }
        if (this.settings.ignoreWhitespace) {
          processedLine = processedLine.trim()
        }
        if (this.settings.ignoreEmptyLines && processedLine === '') {
          return {
            originalContent: line,
            content: line,
            processedContent: processedLine,
            isDuplicate: false
          }
        }
        
        return {
          originalContent: line,
          content: line,
          processedContent: processedLine,
          isDuplicate: false
        }
      })
      
      // 检测重复行
      this.detectDuplicates()
    },
    
    detectDuplicates() {
      const seen = new Set()
      
      this.inputLines.forEach(line => {
        if (line.processedContent !== '' || !this.settings.ignoreEmptyLines) {
          if (seen.has(line.processedContent)) {
            line.isDuplicate = true
          } else {
            seen.add(line.processedContent)
            line.isDuplicate = false
          }
        }
      })
      
      // 计算唯一行
      this.uniqueLines = this.inputLines.filter(line => !line.isDuplicate).map(line => line.originalContent)
    },
    
    performDeduplication() {
      if (!this.inputText.trim()) {
        this.$message({
          message: '请先输入文本内容',
          type: 'warning',
          duration: 1500
        })
        return
      }
      
      this.resultLines = [...this.uniqueLines]
      this.resultText = this.resultLines.join('\n')
      
      this.$message({
        message: `去重完成！删除了 ${this.duplicateCount} 行重复内容`,
        type: 'success',
        duration: 1500
      })
    },
    
    
    handleSettings(command) {
      // 设置项通过 v-model 自动处理
    },
    
    copyResult() {
      if (!this.resultText) {
        this.$message({
          message: '没有结果可复制',
          type: 'warning',
          duration: 1500
        })
        return
      }
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.resultText).then(() => {
          this.$message({
            message: '已复制到剪贴板',
            type: 'success',
            duration: 1500
          })
        }).catch(() => {
          this.fallbackCopyText(this.resultText)
        })
      } else {
        this.fallbackCopyText(this.resultText)
      }
    },
    
    fallbackCopyText(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message({
          message: '已复制到剪贴板',
          type: 'success',
          duration: 1500
        })
      } catch (err) {
        this.$message({
          message: '复制失败',
          type: 'error',
          duration: 1500
        })
      }
      document.body.removeChild(textArea)
    },
    
    downloadResult() {
      if (!this.resultText) {
        this.$message({
          message: '没有结果可下载',
          type: 'warning',
          duration: 1500
        })
        return
      }
      
      const blob = new Blob([this.resultText], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `deduplicated-text-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      this.$message({
        message: '去重结果已下载',
        type: 'success',
        duration: 1500
      })
    },
    
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        this.$el.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
  }
}
</script>

<style scoped>
.text-deduplicator-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.input-panel,
.result-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e4e7ed;
}

.result-panel {
  border-right: none;
}

.operation-panel {
  width: 80px;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.panel-title {
  font-weight: 600;
  color: #303133;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.edit-area {
  height: 100%;
  padding: 16px;
}

.edit-area .el-textarea {
  height: 100%;
}

.edit-area .el-textarea__inner {
  height: 100% !important;
  resize: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.view-area,
.result-area {
  height: 100%;
  display: flex;
  overflow: auto;
}

.empty-result {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #909399;
  font-style: italic;
  font-size: 14px;
}

.line-numbers {
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  padding: 16px 8px;
  min-width: 60px;
  text-align: right;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
}

.line-number {
  height: 21px;
  line-height: 21px;
  padding-right: 8px;
}

.line-number.duplicate-line {
  background: #fef0f0;
  color: #f56c6c;
}

.text-content {
  flex: 1;
  padding: 16px 16px 16px 60px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.text-line {
  height: 21px;
  line-height: 21px;
  padding: 0 8px;
  margin: 0 -8px;
}

.text-line.duplicate-line {
  background: #fef0f0;
  color: #f56c6c;
}



.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  align-items: center;
}

.arrow-only-btn {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  width: 40px !important;
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border-radius: 50% !important;
  transition: all 0.2s ease !important;
}

.arrow-only-btn:hover {
  background: rgba(64, 158, 255, 0.1) !important;
  transform: scale(1.1) !important;
}

.arrow-only-btn i {
  font-size: 20px !important;
  color: #409eff !important;
}

.arrow-only-btn:disabled i {
  color: #c0c4cc !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
  
  .toolbar-left {
    flex-wrap: wrap;
  }
  
  .main-content {
    flex-direction: column;
  }
  
  .operation-panel {
    width: 100%;
    order: -1;
  }
  
  .input-panel,
  .result-panel {
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }
  
  .result-panel {
    border-bottom: none;
  }
}
</style>
