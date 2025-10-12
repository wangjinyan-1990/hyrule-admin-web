<template>
  <div class="character-analyzer-container">
    <div class="analyzer-header">
      <h2>字符出现次数统计</h2>
      <p>统计文本中每个字符的出现次数</p>
    </div>
    
    <div class="analyzer-form">
      <!-- 输入区域 -->
      <div class="input-section">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="6"
          placeholder="请输入要统计的文本内容..."
          class="text-input"
          @input="handleInput"
        />
        <div class="input-actions">
          <el-button type="primary" @click="analyzeCharacters" :disabled="!inputText.trim()">
            统计
          </el-button>
          <el-button type="danger" @click="clearAll">
            清除
          </el-button>
        </div>
      </div>
      
      <!-- 统计结果 -->
      <div class="results-section" v-if="characterStats.length > 0">
        <h3>字符统计结果</h3>
        
        <div class="stats-table">
          <div class="table-header">
            <div class="header-cell">字符</div>
            <div class="header-cell">出现次数</div>
          </div>
          
          <div 
            class="table-row" 
            v-for="(stat, index) in characterStats" 
            :key="index"
            @click="copyCharacterInfo(stat)"
          >
            <div class="cell character-cell">
              <span class="character-display">{{ stat.character }}</span>
              <span class="character-code">({{ stat.code }})</span>
            </div>
            <div class="cell count-cell">{{ stat.count }}</div>
          </div>
        </div>
        
        <!-- 统计摘要 -->
        <div class="summary-section">
          <div class="summary-item">
            <span class="summary-label">总字符数:</span>
            <span class="summary-value">{{ totalCharacters }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">唯一字符数:</span>
            <span class="summary-value">{{ characterStats.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">最高出现次数:</span>
            <span class="summary-value">{{ maxCount }}</span>
          </div>
        </div>
        
        <div class="tip-text">
          <i class="el-icon-info"></i>
          点击表格行可以复制字符信息
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CharacterCountAnalyzer',
  data() {
    return {
      inputText: '',
      characterStats: [],
      totalCharacters: 0,
      maxCount: 0
    }
  },
  methods: {
    handleInput(value) {
      this.inputText = value
      // 实时统计
      this.analyzeCharacters()
    },
    
    analyzeCharacters() {
      if (!this.inputText.trim()) {
        this.characterStats = []
        this.totalCharacters = 0
        this.maxCount = 0
        return
      }
      
      const text = this.inputText
      const charMap = new Map()
      
      // 统计每个字符的出现次数
      for (let i = 0; i < text.length; i++) {
        const char = text[i]
        charMap.set(char, (charMap.get(char) || 0) + 1)
      }
      
      // 转换为数组并排序
      this.characterStats = Array.from(charMap.entries())
        .map(([character, count]) => ({
          character: character,
          count: count,
          code: this.getCharacterCode(character)
        }))
        .sort((a, b) => {
          // 先按出现次数降序，再按字符Unicode编码升序
          if (b.count !== a.count) {
            return b.count - a.count
          }
          return a.character.charCodeAt(0) - b.character.charCodeAt(0)
        })
      
      // 计算统计信息
      this.totalCharacters = text.length
      this.maxCount = this.characterStats.length > 0 ? this.characterStats[0].count : 0
    },
    
    getCharacterCode(char) {
      const code = char.charCodeAt(0)
      if (code >= 32 && code <= 126) {
        // 可打印ASCII字符
        return `ASCII:${code}`
      } else if (code >= 0x4E00 && code <= 0x9FFF) {
        // 中文字符
        return `中文:0x${code.toString(16).toUpperCase()}`
      } else {
        // 其他Unicode字符
        return `U+${code.toString(16).toUpperCase().padStart(4, '0')}`
      }
    },
    
    copyCharacterInfo(stat) {
      const info = `字符: "${stat.character}" 出现次数: ${stat.count} 编码: ${stat.code}`
      
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(info).then(() => {
          this.$message.success(`已复制: ${info}`)
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
        this.$message.success('已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textArea)
    },
    
    clearAll() {
      this.inputText = ''
      this.characterStats = []
      this.totalCharacters = 0
      this.maxCount = 0
      this.$message.info('已清空所有内容')
    }
  }
}
</script>

<style scoped>
.character-analyzer-container {
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
  grid-template-columns: 1fr 120px;
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

.header-cell:first-child {
  text-align: left;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 120px;
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

.character-cell {
  justify-content: flex-start;
  gap: 8px;
}

.character-display {
  font-weight: 600;
  color: #303133;
  min-width: 20px;
  text-align: center;
}

.character-code {
  color: #909399;
  font-size: 12px;
  font-family: 'Courier New', monospace;
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
  .character-analyzer-container {
    padding: 20px;
  }
  
  .analyzer-form {
    padding: 20px;
  }
  
  .input-actions {
    flex-direction: column;
  }
  
  .input-actions .el-button {
    width: 100%;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr 80px;
  }
  
  .header-cell,
  .cell {
    padding: 10px 12px;
    font-size: 13px;
  }
  
  .character-code {
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
    grid-template-columns: 1fr 60px;
  }
  
  .header-cell,
  .cell {
    padding: 8px 10px;
    font-size: 12px;
  }
  
  .character-code {
    display: none; /* 在小屏幕上隐藏编码信息 */
  }
}
</style>
