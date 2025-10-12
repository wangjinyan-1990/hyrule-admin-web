<template>
  <div class="json-formatter-container">
    <div class="formatter-header">
      <h2>JSON格式化</h2>
      <p>将JSON字符串格式化，提高可读性</p>
    </div>
    
    <div class="formatter-form">
      <!-- 输入区域 -->
      <div class="input-section">
        <label class="section-label">请输入JSON字符串</label>
        <el-input
          v-model="inputJson"
          type="textarea"
          :rows="8"
          placeholder="请粘贴未格式化的JSON字符串..."
          class="json-input"
          @input="handleInput"
        />
        <div class="input-actions">
          <el-button type="warning" @click="clearInput" size="small">
            清空输入
          </el-button>
        </div>
      </div>
      
      <!-- 输出区域 -->
      <div class="output-section">
        <label class="section-label">格式化后的JSON</label>
        <el-input
          v-model="outputJson"
          type="textarea"
          :rows="8"
          readonly
          class="result-input"
          placeholder="格式化后的JSON将显示在这里..."
        />
        <div class="output-actions">
          <el-button type="primary" @click="copyResult" :disabled="!outputJson" size="small">
            复制结果
          </el-button>
          <el-button type="success" @click="formatJson" :disabled="!inputJson" size="small">
            格式化
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
  name: 'JsonFormatter',
  data() {
    return {
      inputJson: '',
      outputJson: '',
      isValidJson: true
    }
  },
  methods: {
    handleInput(value) {
      this.inputJson = value
      // 实时格式化（可选）
      this.autoFormat()
    },
    
    formatJson() {
      if (!this.inputJson.trim()) {
        this.$message.warning('请输入JSON字符串')
        return
      }
      
      try {
        // 解析JSON
        const parsed = JSON.parse(this.inputJson)
        // 格式化输出，缩进2个空格
        this.outputJson = JSON.stringify(parsed, null, 2)
        this.isValidJson = true
        this.$message.success('JSON格式化成功')
      } catch (error) {
        this.isValidJson = false
        this.outputJson = ''
        this.$message.error(`JSON格式错误: ${error.message}`)
      }
    },
    
    autoFormat() {
      // 自动格式化（如果JSON有效）
      if (this.inputJson.trim()) {
        try {
          const parsed = JSON.parse(this.inputJson)
          this.outputJson = JSON.stringify(parsed, null, 2)
          this.isValidJson = true
        } catch (error) {
          // 如果JSON无效，不显示错误，让用户手动点击格式化按钮
          this.outputJson = ''
          this.isValidJson = false
        }
      } else {
        this.outputJson = ''
        this.isValidJson = true
      }
    },
    
    copyResult() {
      if (!this.outputJson) {
        this.$message.warning('没有可复制的内容')
        return
      }
      
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.outputJson).then(() => {
          this.$message.success('已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopy(this.outputJson)
        })
      } else {
        this.fallbackCopy(this.outputJson)
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
        this.$message.success('已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textArea)
    },
    
    clearInput() {
      this.inputJson = ''
      this.outputJson = ''
      this.$message.info('已清空输入内容')
    },
    
    clearAll() {
      this.inputJson = ''
      this.outputJson = ''
      this.isValidJson = true
      this.$message.info('已清空所有内容')
    }
  }
}
</script>

<style scoped>
.json-formatter-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.formatter-header {
  text-align: center;
  margin-bottom: 40px;
}

.formatter-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.formatter-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.formatter-form {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.input-section,
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

.json-input {
  width: 100%;
  margin-bottom: 15px;
}

.json-input >>> .el-textarea__inner {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.json-input >>> .el-textarea__inner:focus {
  border-color: #409eff;
  outline: none;
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
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.input-actions,
.output-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

.input-actions .el-button,
.output-actions .el-button {
  min-width: 80px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .json-formatter-container {
    padding: 20px;
  }
  
  .formatter-form {
    padding: 20px;
  }
  
  .input-actions,
  .output-actions {
    flex-direction: column;
  }
  
  .input-actions .el-button,
  .output-actions .el-button {
    width: 100%;
  }
}

/* JSON语法高亮样式 */
.json-input >>> .el-textarea__inner {
  background-color: #fafafa;
}

.result-input >>> .el-textarea__inner {
  background: linear-gradient(90deg, #f8f9fa 0%, #f5f7fa 100%);
  border-left: 4px solid #409eff;
}
</style>
