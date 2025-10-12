<template>
  <div class="base-converter-container">
    <div class="converter-header">
      <h2>数字进制转换</h2>
      <p>在不同进制之间进行数字转换</p>
    </div>
    
    <div class="converter-form">
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="input-row">
          <el-input
            v-model="inputNumber"
            placeholder="请输入要转换的数字"
            class="number-input"
            @input="handleInput"
            @keyup.enter="convertNumber"
          />
          <el-select v-model="inputBase" placeholder="选择进制" class="base-select" @change="handleBaseChange">
            <el-option label="2进制" :value="2"></el-option>
            <el-option label="3进制" :value="3"></el-option>
            <el-option label="4进制" :value="4"></el-option>
            <el-option label="5进制" :value="5"></el-option>
            <el-option label="6进制" :value="6"></el-option>
            <el-option label="7进制" :value="7"></el-option>
            <el-option label="8进制" :value="8"></el-option>
            <el-option label="9进制" :value="9"></el-option>
            <el-option label="10进制" :value="10"></el-option>
            <el-option label="11进制" :value="11"></el-option>
            <el-option label="12进制" :value="12"></el-option>
            <el-option label="13进制" :value="13"></el-option>
            <el-option label="14进制" :value="14"></el-option>
            <el-option label="15进制" :value="15"></el-option>
            <el-option label="16进制" :value="16"></el-option>
            <el-option label="17进制" :value="17"></el-option>
            <el-option label="18进制" :value="18"></el-option>
            <el-option label="19进制" :value="19"></el-option>
            <el-option label="20进制" :value="20"></el-option>
            <el-option label="21进制" :value="21"></el-option>
            <el-option label="22进制" :value="22"></el-option>
            <el-option label="23进制" :value="23"></el-option>
            <el-option label="24进制" :value="24"></el-option>
            <el-option label="25进制" :value="25"></el-option>
            <el-option label="26进制" :value="26"></el-option>
            <el-option label="27进制" :value="27"></el-option>
            <el-option label="28进制" :value="28"></el-option>
            <el-option label="29进制" :value="29"></el-option>
            <el-option label="30进制" :value="30"></el-option>
            <el-option label="31进制" :value="31"></el-option>
            <el-option label="32进制" :value="32"></el-option>
            <el-option label="33进制" :value="33"></el-option>
            <el-option label="34进制" :value="34"></el-option>
            <el-option label="35进制" :value="35"></el-option>
            <el-option label="36进制" :value="36"></el-option>
          </el-select>
          <el-button type="primary" @click="convertNumber" :disabled="!inputNumber.trim()">
            转换
          </el-button>
        </div>
      </div>
      
      <!-- 转换结果 -->
      <div class="results-section" v-if="conversionResults.length > 0">
        <h3>转换结果</h3>
        
        <div class="results-table">
          <div class="table-header">
            <div class="header-cell base-cell">进制</div>
            <div class="header-cell result-cell">转换结果</div>
          </div>
          
          <div 
            class="table-row" 
            v-for="(result, index) in conversionResults" 
            :key="index"
            @click="copyResult(result)"
          >
            <div class="table-cell base-cell">{{ result.base }}进制</div>
            <div class="table-cell result-cell">{{ result.value }}</div>
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div class="summary-section">
          <div class="summary-item">
            <span class="summary-label">输入数值:</span>
            <span class="summary-value">{{ inputNumber }} ({{ inputBase }}进制)</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">支持进制:</span>
            <span class="summary-value">2-36进制</span>
          </div>
        </div>
        
        <div class="tip-text">
          <i class="el-icon-info"></i>
          点击表格行可以复制转换结果
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseConverter',
  data() {
    return {
      inputNumber: '10',
      inputBase: 10,
      conversionResults: []
    }
  },
  methods: {
    handleInput(value) {
      this.inputNumber = value
      // 实时转换
      this.convertNumber()
    },
    
    handleBaseChange(value) {
      this.inputBase = value
      // 实时转换
      this.convertNumber()
    },
    
    convertNumber() {
      if (!this.inputNumber.trim()) {
        this.conversionResults = []
        return
      }
      
      try {
        // 将输入的数字转换为十进制
        const decimalValue = this.parseNumber(this.inputNumber, this.inputBase)
        
        if (isNaN(decimalValue)) {
          this.$message.error('输入的数字格式不正确')
          this.conversionResults = []
          return
        }
        
        // 转换到各种进制
        const results = []
        const commonBases = [2, 8, 10, 16, 32, 36]
        
        // 按图片显示的顺序添加结果
        commonBases.forEach(base => {
          const value = this.convertToBase(decimalValue, base)
          results.push({
            base: base,
            value: value
          })
        })
        
        this.conversionResults = results
      } catch (error) {
        this.$message.error('转换失败: ' + error.message)
        this.conversionResults = []
      }
    },
    
    parseNumber(numberStr, base) {
      // 移除空格
      numberStr = numberStr.trim()
      
      // 处理负号
      let isNegative = false
      if (numberStr.startsWith('-')) {
        isNegative = true
        numberStr = numberStr.substring(1)
      }
      
      // 处理进制前缀
      if (numberStr.startsWith('0x') || numberStr.startsWith('0X')) {
        base = 16
        numberStr = numberStr.substring(2)
      } else if (numberStr.startsWith('0b') || numberStr.startsWith('0B')) {
        base = 2
        numberStr = numberStr.substring(2)
      } else if (numberStr.startsWith('0o') || numberStr.startsWith('0O')) {
        base = 8
        numberStr = numberStr.substring(2)
      }
      
      // 转换为十进制
      let result = parseInt(numberStr, base)
      
      if (isNegative) {
        result = -result
      }
      
      return result
    },
    
    convertToBase(decimalValue, targetBase) {
      if (targetBase < 2 || targetBase > 36) {
        throw new Error('不支持的进制: ' + targetBase)
      }
      
      if (decimalValue === 0) {
        return '0'
      }
      
      const isNegative = decimalValue < 0
      let value = Math.abs(decimalValue)
      
      const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      let result = ''
      
      while (value > 0) {
        result = digits[value % targetBase] + result
        value = Math.floor(value / targetBase)
      }
      
      return isNegative ? '-' + result : result
    },
    
    copyResult(result) {
      const info = `${result.base}进制: ${result.value}`
      
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(result.value).then(() => {
          this.$message.success(`${info} 已复制到剪贴板`)
        }).catch(() => {
          this.fallbackCopy(result.value, info)
        })
      } else {
        this.fallbackCopy(result.value, info)
      }
    },
    
    fallbackCopy(text, info) {
      // 兼容旧浏览器的复制方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message.success(`${info} 已复制到剪贴板`)
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textArea)
    }
  },
  mounted() {
    // 初始化默认转换
    this.convertNumber()
  }
}
</script>

<style scoped>
.base-converter-container {
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

.input-section {
  margin-bottom: 30px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.number-input {
  flex: 1;
  max-width: 200px;
}

.number-input >>> .el-input__inner {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  text-align: center;
}

.base-select {
  width: 120px;
}

.base-select >>> .el-input__inner {
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.input-row .el-button {
  min-width: 80px;
}

.results-section {
  margin-bottom: 30px;
}

.results-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

.results-table {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.table-header {
  display: grid;
  grid-template-columns: 120px 1fr;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.header-cell {
  padding: 12px 16px;
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  text-align: center;
}

.base-cell {
  text-align: center;
}

.result-cell {
  text-align: left;
}

.table-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.table-row:hover {
  background-color: #f0f9ff;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 12px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.base-cell {
  justify-content: center;
  color: #606266;
  font-weight: 500;
}

.result-cell {
  justify-content: flex-start;
  color: #303133;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #67c23a;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.summary-value {
  font-size: 16px;
  color: #67c23a;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.tip-text {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .base-converter-container {
    padding: 20px;
  }
  
  .converter-form {
    padding: 20px;
  }
  
  .input-row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .number-input {
    max-width: 100%;
  }
  
  .base-select {
    width: 100%;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 100px 1fr;
  }
  
  .header-cell,
  .table-cell {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .summary-section {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .table-header,
  .table-row {
    grid-template-columns: 80px 1fr;
  }
  
  .header-cell,
  .table-cell {
    padding: 8px 10px;
    font-size: 12px;
  }
}
</style>
