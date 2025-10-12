<template>
  <div class="string-calculator-container">
    <div class="calculator-header">
      <h2>字符串长度计算</h2>
      <p>精确计算字符串的各种长度和字符统计</p>
    </div>
    
    <div class="calculator-form">
      <!-- 输入区域 -->
      <div class="input-section">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="6"
          placeholder="请输入要计算的文本内容..."
          class="text-input"
          @input="handleInput"
        />
        <div class="input-actions">
          <el-button type="primary" @click="calculateLength" :disabled="!inputText.trim()">
            计算
          </el-button>
          <el-button type="danger" @click="clearAll">
            清除
          </el-button>
        </div>
      </div>
      
      <!-- 计算结果 -->
      <div class="results-section" v-if="results">
        <h3>计算结果</h3>
        
        <div class="result-item" @click="copyToClipboard('总长1', results.totalLength1)">
          <span class="result-label">文本总长1 (不含换行):</span>
          <span class="result-value">{{ results.totalLength1 }}</span>
        </div>
        
        <div class="result-item" @click="copyToClipboard('总长2', results.totalLength2)">
          <span class="result-label">文本总长2 (不含换行,不区分全/半角):</span>
          <span class="result-value">{{ results.totalLength2 }}</span>
        </div>
        
        <div class="result-item" @click="copyToClipboard('字符统计', charStatsText)">
          <span class="result-label">字符统计:</span>
          <span class="result-value">{{ charStatsText }}</span>
        </div>
        
        <div class="result-item" @click="copyToClipboard('字符类型', charTypeText)">
          <span class="result-label">字符类型:</span>
          <span class="result-value">{{ charTypeText }}</span>
        </div>
        
        <div class="result-item" @click="copyToClipboard('行数统计', lineStatsText)">
          <span class="result-label">行数统计:</span>
          <span class="result-value">{{ lineStatsText }}</span>
        </div>
        
        <div class="tip-text">
          <i class="el-icon-info"></i>
          小技巧: 点击结果可以直接复制哦~
        </div>
      </div>
      
      <!-- 计算规则 -->
      <div class="rules-section">
        <h3>计算规则</h3>
        <ul class="rules-list">
          <li>1、一个半角字符算1个长度</li>
          <li>2、汉字和全角字符算2个长度</li>
          <li>3、换行符归属于半角;</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StringLengthCalculator',
  data() {
    return {
      inputText: '',
      results: null
    }
  },
  computed: {
    charStatsText() {
      if (!this.results) return ''
      const { chinese, letters, numbers, spaces } = this.results
      return `中文:${chinese}个,字母:${letters}个,数字:${numbers}个,空格:${spaces}个`
    },
    charTypeText() {
      if (!this.results) return ''
      const { halfWidth, fullWidth } = this.results
      return `半角:${halfWidth}个,全角:${fullWidth}个`
    },
    lineStatsText() {
      if (!this.results) return ''
      const { newlines, totalLines } = this.results
      return `换行:${newlines}个,总行数:${totalLines}行`
    }
  },
  methods: {
    handleInput(value) {
      this.inputText = value
      // 实时计算
      this.calculateLength()
    },
    
    calculateLength() {
      if (!this.inputText.trim()) {
        this.results = null
        return
      }
      
      const text = this.inputText
      let totalLength1 = 0
      let totalLength2 = 0
      let chinese = 0
      let letters = 0
      let numbers = 0
      let spaces = 0
      let halfWidth = 0
      let fullWidth = 0
      let newlines = 0
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const code = char.charCodeAt(0)
        
        // 计算总长2（不区分全/半角）
        totalLength2++
        
        // 换行符统计
        if (char === '\n') {
          newlines++
          halfWidth++
          totalLength1 += 1
          continue
        }
        
        // 空格统计
        if (char === ' ') {
          spaces++
          halfWidth++
          totalLength1 += 1
          continue
        }
        
        // 中文字符判断（包括汉字、中文标点等）
        if (this.isChinese(char)) {
          chinese++
          fullWidth++
          totalLength1 += 2
        }
        // 英文字母判断
        else if (this.isLetter(char)) {
          letters++
          halfWidth++
          totalLength1 += 1
        }
        // 数字判断
        else if (this.isNumber(char)) {
          numbers++
          halfWidth++
          totalLength1 += 1
        }
        // 其他字符判断（标点符号等）
        else if (this.isFullWidthPunctuation(char)) {
          fullWidth++
          totalLength1 += 2
        }
        else {
          halfWidth++
          totalLength1 += 1
        }
      }
      
      // 计算总行数
      const totalLines = text.split('\n').length
      
      this.results = {
        totalLength1,
        totalLength2,
        chinese,
        letters,
        numbers,
        spaces,
        halfWidth,
        fullWidth,
        newlines,
        totalLines
      }
    },
    
    isChinese(char) {
      const code = char.charCodeAt(0)
      // 汉字范围：4E00-9FFF
      return (code >= 0x4E00 && code <= 0x9FFF)
    },
    
    isLetter(char) {
      const code = char.charCodeAt(0)
      return (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
    },
    
    isNumber(char) {
      const code = char.charCodeAt(0)
      return code >= 48 && code <= 57
    },
    
    isFullWidthPunctuation(char) {
      const code = char.charCodeAt(0)
      // 全角标点符号范围：FF00-FFEF
      return (code >= 0xFF00 && code <= 0xFFEF)
    },
    
    copyToClipboard(type, value) {
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(value.toString()).then(() => {
          this.$message({
            message: `${type}: ${value} 已复制到剪贴板`,
            type: 'success',
            duration: 1500
          })
        }).catch(() => {
          this.fallbackCopy(value.toString(), type)
        })
      } else {
        this.fallbackCopy(value.toString(), type)
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
        this.$message({
          message: `${type}: ${text} 已复制到剪贴板`,
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
      this.results = null
      this.$message({
        message: '已清空所有内容',
        type: 'info',
        duration: 1500
      })
    }
  }
}
</script>

<style scoped>
.string-calculator-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.calculator-header {
  text-align: center;
  margin-bottom: 40px;
}

.calculator-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.calculator-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.calculator-form {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.input-section {
  margin-bottom: 30px;
}

.text-input {
  width: 100%;
  margin-bottom: 15px;
}

.text-input >>> .el-textarea__inner {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.text-input >>> .el-textarea__inner:focus {
  border-color: #409eff;
  outline: none;
}

.input-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.input-actions .el-button {
  min-width: 80px;
}

.results-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.results-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e4e7ed;
}

.result-item:hover {
  background-color: #f0f9ff;
  border-color: #409eff;
  transform: translateY(-1px);
}

.result-label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.result-value {
  font-weight: 600;
  color: #409eff;
  font-size: 16px;
}

.tip-text {
  margin-top: 15px;
  padding: 10px;
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  color: #1890ff;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tip-text i {
  font-size: 16px;
}

.rules-section {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 6px;
  border-left: 4px solid #67c23a;
}

.rules-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 18px;
}

.rules-list {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  line-height: 1.6;
}

.rules-list li {
  margin-bottom: 8px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .string-calculator-container {
    padding: 20px;
  }
  
  .calculator-form {
    padding: 20px;
  }
  
  .input-actions {
    flex-direction: column;
  }
  
  .input-actions .el-button {
    width: 100%;
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .result-value {
    font-size: 18px;
    font-weight: 700;
  }
}
</style>
