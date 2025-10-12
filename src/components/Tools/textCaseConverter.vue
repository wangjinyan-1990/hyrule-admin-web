<template>
  <div class="text-case-converter-container">
    <div class="converter-header">
      <h2>英文字母大小写转换</h2>
      <p>支持多种英文字母大小写转换方式</p>
    </div>
    
    <div class="converter-form">
      <!-- 输入区域 -->
      <div class="input-section">
        <label class="section-label">请输入相关内容</label>
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="6"
          placeholder="请输入需要转换的英文文本..."
          class="text-input"
          @input="handleInput"
        />
      </div>
      
      <!-- 转换方式选择 -->
      <div class="method-section">
        <label class="section-label">方式</label>
        <el-radio-group v-model="convertMethod" class="method-options">
          <el-radio label="uppercase" class="method-option">
            全部转换为大写
          </el-radio>
          <el-radio label="lowercase" class="method-option">
            全部转换为小写
          </el-radio>
          <el-radio label="title" class="method-option">
            每个单词首字母大写
          </el-radio>
          <el-radio label="sentence" class="method-option">
            句子首字母大写
          </el-radio>
        </el-radio-group>
        
        <div class="button-group">
          <el-button type="success" @click="convertText" icon="el-icon-paper-plane">
            提交
          </el-button>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="output-section">
        <label class="section-label">输出结果</label>
        <el-input
          v-model="outputText"
          type="textarea"
          :rows="6"
          readonly
          class="result-input"
          placeholder="转换结果将显示在这里..."
        />
        <div class="output-actions">
          <el-button type="primary" @click="copyResult" :disabled="!outputText" size="small">
            复制结果
          </el-button>
          <el-button type="info" @click="clearAll" size="small">
            清空全部
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextCaseConverter',
  data() {
    return {
      inputText: '',
      outputText: '',
      convertMethod: 'uppercase'
    }
  },
  methods: {
    handleInput(value) {
      this.inputText = value
      // 实时转换
      this.autoConvert()
    },
    
    convertText() {
      if (!this.inputText.trim()) {
        this.$message({
          message: '请输入要转换的文本',
          type: 'warning',
          duration: 1500
        })
        return
      }
      
      this.outputText = this.convertCase(this.inputText, this.convertMethod)
      this.$message({
        message: '转换完成',
        type: 'success',
        duration: 1500
      })
    },
    
    autoConvert() {
      if (this.inputText.trim()) {
        this.outputText = this.convertCase(this.inputText, this.convertMethod)
      } else {
        this.outputText = ''
      }
    },
    
    convertCase(text, method) {
      if (!text) return ''
      
      switch (method) {
        case 'uppercase':
          return text.toUpperCase()
        case 'lowercase':
          return text.toLowerCase()
        case 'title':
          return this.toTitleCase(text)
        case 'sentence':
          return this.toSentenceCase(text)
        default:
          return text
      }
    },
    
    toTitleCase(text) {
      return text.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      })
    },
    
    toSentenceCase(text) {
      // 先将整个文本转换为小写
      let result = text.toLowerCase()
      
      // 然后将首字母大写
      if (result.length > 0) {
        result = result.charAt(0).toUpperCase() + result.slice(1)
      }
      
      return result
    },
    
    copyResult() {
      if (!this.outputText) {
        this.$message({
          message: '没有可复制的内容',
          type: 'warning',
          duration: 1500
        })
        return
      }
      
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.outputText).then(() => {
          this.$message({
            message: '已复制到剪贴板',
            type: 'success',
            duration: 1500
          })
        }).catch(() => {
          this.fallbackCopy(this.outputText)
        })
      } else {
        this.fallbackCopy(this.outputText)
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
    
    clearAll() {
      this.inputText = ''
      this.outputText = ''
      this.$message({
        message: '已清空所有内容',
        type: 'info',
        duration: 1500
      })
    }
  },
  
  watch: {
    convertMethod() {
      // 当转换方式改变时，自动重新转换
      this.autoConvert()
    }
  }
}
</script>

<style scoped>
.text-case-converter-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.converter-header {
  text-align: center;
  margin-bottom: 40px;
}

.converter-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.converter-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.converter-form {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.input-section,
.method-section,
.output-section {
  margin-bottom: 30px;
}

.section-label {
  display: block;
  font-size: 16px;
  color: #303133;
  margin-bottom: 15px;
  font-weight: 600;
}

.text-input {
  width: 100%;
}

.text-input >>> .el-textarea__inner {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.method-options {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  justify-content: flex-start;
}

.method-option {
  font-size: 14px;
  white-space: nowrap;
  margin-right: 0;
}

.method-option >>> .el-radio__label {
  font-size: 14px;
  color: #606266;
}

.method-option >>> .el-radio__input {
  margin-right: 8px;
}

.method-option >>> .el-radio {
  margin-right: 0;
}

.button-group {
  text-align: center;
}

.button-group .el-button {
  min-width: 120px;
  height: 40px;
  font-size: 14px;
}

.result-input {
  width: 100%;
  margin-bottom: 15px;
}

.result-input >>> .el-textarea__inner {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.output-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.output-actions .el-button {
  min-width: 80px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .text-case-converter-container {
    padding: 20px;
  }
  
  .converter-form {
    padding: 20px;
  }
  
  .method-options {
    gap: 15px;
    flex-direction: row;
  }
  
  .method-option {
    flex-shrink: 0;
  }
  
  .output-actions {
    flex-direction: column;
  }
  
  .output-actions .el-button {
    width: 100%;
  }
}

/* 文本区域样式优化 */
.text-input >>> .el-textarea__inner,
.result-input >>> .el-textarea__inner {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.text-input >>> .el-textarea__inner:focus,
.result-input >>> .el-textarea__inner:focus {
  border-color: #409eff;
  outline: none;
}
</style>
