<template>
  <div class="string-analyzer-container">
    <div class="analyzer-header">
      <h2>字符串出现次数统计</h2>
      <p>统计文本中每个字符串的出现次数</p>
    </div>
    
    <div class="analyzer-form">
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="input-group">
          <label class="input-label">要统计的文本内容:</label>
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="6"
            placeholder="请输入要统计的文本内容..."
            class="text-input"
            @input="handleInput"
          />
        </div>
        
        <div class="input-group">
          <label class="input-label">指定要统计的字符串:</label>
          <el-input
            v-model="searchString"
            placeholder="请输入要统计的字符串..."
            class="search-input"
            @input="handleSearchStringInput"
          />
        </div>
        
        <div class="input-actions">
          <el-button type="primary" @click="analyzeStrings" :disabled="!inputText.trim() || !searchString.trim()">
            统计
          </el-button>
          <el-button type="danger" @click="clearAll">
            清除
          </el-button>
          <el-checkbox v-model="ignoreCase" class="ignore-case-checkbox">
            忽略大小写
          </el-checkbox>
        </div>
      </div>
      
      <!-- 统计结果 -->
      <div class="results-section" v-if="stringStats.length > 0">
        <h3>统计结果</h3>
        
        <div class="stats-table">
          <div class="table-header">
            <div class="header-cell index-cell">#</div>
            <div class="header-cell substring-cell">子字符串</div>
            <div class="header-cell count-cell">出现次数</div>
          </div>
          
          <div 
            class="table-row" 
            v-for="(stat, index) in stringStats" 
            :key="index"
            @click="copyStringInfo(stat, index + 1)"
          >
            <div class="cell index-cell">{{ index + 1 }}</div>
            <div class="cell substring-cell">
              <span class="substring-display">{{ stat.substring }}</span>
              <span class="substring-length">({{ stat.substring.length }}字)</span>
            </div>
            <div class="cell count-cell">{{ stat.count }}</div>
          </div>
        </div>
        
        <!-- 统计摘要 -->
        <div class="summary-section">
          <div class="summary-item">
            <span class="summary-label">总字符串数:</span>
            <span class="summary-value">{{ totalStrings }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">唯一字符串数:</span>
            <span class="summary-value">{{ stringStats.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">最高出现次数:</span>
            <span class="summary-value">{{ maxCount }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">最长字符串长度:</span>
            <span class="summary-value">{{ maxLength }}</span>
          </div>
        </div>
        
        <div class="tip-text">
          <i class="el-icon-info"></i>
          点击表格行可以复制字符串信息
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StringCountAnalyzer',
  data() {
    return {
      inputText: '',
      searchString: '',
      stringStats: [],
      totalStrings: 0,
      maxCount: 0,
      maxLength: 0,
      ignoreCase: false
    }
  },
  methods: {
    handleInput(value) {
      this.inputText = value
      // 实时统计
      this.analyzeStrings()
    },
    
    handleSearchStringInput(value) {
      this.searchString = value
      // 实时统计
      this.analyzeStrings()
    },
    
    analyzeStrings() {
      if (!this.inputText.trim() || !this.searchString.trim()) {
        this.stringStats = []
        this.totalStrings = 0
        this.maxCount = 0
        this.maxLength = 0
        return
      }
      
      const text = this.inputText
      const searchStr = this.searchString
      
      // 统计指定字符串的出现次数
      let count = 0
      const searchText = this.ignoreCase ? text.toLowerCase() : text
      const searchString = this.ignoreCase ? searchStr.toLowerCase() : searchStr
      
      let index = 0
      while ((index = searchText.indexOf(searchString, index)) !== -1) {
        count++
        index += searchString.length
      }
      
      // 构建结果数组
      this.stringStats = count > 0 ? [{
        substring: searchStr,
        count: count
      }] : []
      
      // 计算统计信息
      this.totalStrings = count
      this.maxCount = count
      this.maxLength = searchStr.length
    },
    
    copyStringInfo(stat, index) {
      const info = `#${index} 子字符串: "${stat.substring}" 出现次数: ${stat.count} 长度: ${stat.substring.length}字`
      
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(info).then(() => {
          this.$message({
            message: `已复制: ${info}`,
            type: 'success',
            duration: 1500
          })
        }).catch(() => {
          this.fallbackCopy(info)
        })
      } else {
        this.fallbackCopy(info)
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
      this.searchString = ''
      this.stringStats = []
      this.totalStrings = 0
      this.maxCount = 0
      this.maxLength = 0
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
.string-analyzer-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.analyzer-header {
  text-align: center;
  margin-bottom: 40px;
}

.analyzer-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.analyzer-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.analyzer-form {
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

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.text-input {
  width: 100%;
}

.search-input {
  width: 100%;
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

.search-input >>> .el-input__inner {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.search-input >>> .el-input__inner:focus {
  border-color: #409eff;
  outline: none;
}

.input-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
}

.input-actions .el-button {
  min-width: 80px;
}

.ignore-case-checkbox {
  margin-left: 10px;
}

.ignore-case-checkbox >>> .el-checkbox__label {
  font-size: 14px;
  color: #606266;
}

.results-section {
  margin-bottom: 30px;
}

.results-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

.stats-table {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 1fr 120px;
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

.index-cell {
  text-align: center;
}

.substring-cell {
  text-align: left;
}

.count-cell {
  text-align: center;
}

.table-row {
  display: grid;
  grid-template-columns: 60px 1fr 120px;
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

.cell {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
}

.index-cell {
  justify-content: center;
  color: #909399;
  font-weight: 500;
}

.substring-cell {
  justify-content: flex-start;
  gap: 8px;
}

.substring-display {
  font-weight: 600;
  color: #303133;
  word-break: break-all;
}

.substring-length {
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
}

.count-cell {
  justify-content: center;
  font-weight: 600;
  color: #409eff;
}

.summary-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
  .string-analyzer-container {
    padding: 20px;
  }
  
  .analyzer-form {
    padding: 20px;
  }
  
  .input-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .input-actions .el-button {
    width: 100%;
  }
  
  .ignore-case-checkbox {
    margin-left: 0;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 50px 1fr 80px;
  }
  
  .header-cell,
  .cell {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .substring-length {
    font-size: 11px;
  }
  
  .summary-section {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .table-header,
  .table-row {
    grid-template-columns: 40px 1fr 60px;
  }
  
  .header-cell,
  .cell {
    padding: 8px 10px;
    font-size: 12px;
  }
  
  .substring-length {
    display: none; /* 在小屏幕上隐藏长度信息 */
  }
}
</style>
