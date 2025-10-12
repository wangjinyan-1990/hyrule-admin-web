<template>
  <div class="expression-calculator-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" icon="el-icon-document" @click="createNew">
          新建
        </el-button>
        <el-button icon="el-icon-refresh" @click="clearHistory">
          清空历史
        </el-button>
        <el-button icon="el-icon-copy-document" @click="copyResult" :disabled="!currentResult">
          复制结果
        </el-button>
      </div>
      
      <div class="toolbar-right">
        <el-button icon="el-icon-full-screen" @click="toggleFullscreen">
          全屏
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧计算器区域 -->
      <div class="calculator-panel">
        <div class="panel-header">
          <span class="panel-title">表达式计算器</span>
        </div>
        <div class="panel-content">
          <!-- 显示屏 -->
          <div class="display-area">
            <div class="expression-display">
              <div class="expression-text">{{ currentExpression || '0' }}</div>
            </div>
            <div class="result-display">
              <div class="result-text">{{ currentResult || '0' }}</div>
            </div>
          </div>

          <!-- 按钮区域 -->
          <div class="buttons-area">
            <!-- 第一行：清空、删除、括号 -->
            <div class="button-row">
              <el-button class="calc-btn function-btn" @click="clear">C</el-button>
              <el-button class="calc-btn function-btn" @click="backspace">⌫</el-button>
              <el-button class="calc-btn function-btn" @click="insertText('(')">(</el-button>
              <el-button class="calc-btn function-btn" @click="insertText(')')">)</el-button>
            </div>

            <!-- 第二行：数字 7-9 和除法 -->
            <div class="button-row">
              <el-button class="calc-btn number-btn" @click="insertText('7')">7</el-button>
              <el-button class="calc-btn number-btn" @click="insertText('8')">8</el-button>
              <el-button class="calc-btn number-btn" @click="insertText('9')">9</el-button>
              <el-button class="calc-btn operator-btn" @click="insertText('/')">÷</el-button>
            </div>

            <!-- 第三行：数字 4-6 和乘法 -->
            <div class="button-row">
              <el-button class="calc-btn number-btn" @click="insertText('4')">4</el-button>
              <el-button class="calc-btn number-btn" @click="insertText('5')">5</el-button>
              <el-button class="calc-btn number-btn" @click="insertText('6')">6</el-button>
              <el-button class="calc-btn operator-btn" @click="insertText('*')">×</el-button>
            </div>

            <!-- 第四行：数字 1-3 和减法 -->
            <div class="button-row">
              <el-button class="calc-btn number-btn" @click="insertText('1')">1</el-button>
              <el-button class="calc-btn number-btn" @click="insertText('2')">2</el-button>
              <el-button class="calc-btn number-btn" @click="insertText('3')">3</el-button>
              <el-button class="calc-btn operator-btn" @click="insertText('-')">-</el-button>
            </div>

            <!-- 第五行：0、小数点、等于、加法 -->
            <div class="button-row">
              <el-button class="calc-btn number-btn wide-btn" @click="insertText('0')">0</el-button>
              <el-button class="calc-btn number-btn" @click="insertText('.')">.</el-button>
              <el-button class="calc-btn equals-btn" @click="calculate">=</el-button>
              <el-button class="calc-btn operator-btn" @click="insertText('+')">+</el-button>
            </div>

          </div>
        </div>
      </div>

      <!-- 右侧表达式输入和历史记录 -->
      <div class="expression-panel">
        <div class="panel-header">
          <span class="panel-title">表达式输入</span>
        </div>
        <div class="panel-content">
          <!-- 表达式输入区域 -->
          <div class="expression-input-area">
            <el-input
              v-model="currentExpression"
              type="textarea"
              :rows="4"
              placeholder="在此输入基础数学表达式，例如：2 + 3 * 4, 10 / 2, (5 + 3) * 2"
              @keyup.enter="calculate"
            ></el-input>
            <div class="input-actions">
              <el-button type="primary" @click="calculate" :disabled="!currentExpression.trim()">
                计算结果
              </el-button>
              <el-button @click="clear">清空</el-button>
            </div>
          </div>

          <!-- 历史记录 -->
          <div class="history-area">
            <div class="history-header">
              <h4>计算历史</h4>
              <el-button size="mini" @click="clearHistory">清空历史</el-button>
            </div>
            <div class="history-list">
              <div
                v-for="(record, index) in history"
                :key="index"
                class="history-item"
                @click="loadFromHistory(record)"
              >
                <div class="history-expression">{{ record.expression }}</div>
                <div class="history-result">= {{ record.result }}</div>
                <div class="history-time">{{ record.time }}</div>
              </div>
              <div v-if="history.length === 0" class="no-history">
                暂无计算历史
              </div>
            </div>
          </div>

          <!-- 常用表达式模板 -->
          <div class="templates-area">
            <div class="templates-header">
              <h4>常用表达式</h4>
            </div>
            <div class="templates-list">
              <el-button
                v-for="template in templates"
                :key="template.name"
                size="mini"
                class="template-btn"
                @click="insertTemplate(template.expression)"
              >
                {{ template.name }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExpressionCalculator',
  data() {
    return {
      currentExpression: '',
      currentResult: '',
      history: [],
      templates: [
        { name: '加法', expression: '2 + 3' },
        { name: '减法', expression: '10 - 5' },
        { name: '乘法', expression: '4 * 6' },
        { name: '除法', expression: '15 / 3' },
        { name: '混合运算', expression: '2 + 3 * 4' },
        { name: '括号运算', expression: '(5 + 3) * 2' },
        { name: '小数运算', expression: '3.14 * 2' },
        { name: '连续运算', expression: '100 - 25 + 15' }
      ]
    }
  },
  mounted() {
    this.loadHistory()
  },
  methods: {
    createNew() {
      this.$confirm('确定要清空当前表达式吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.clear()
        this.$message({
          message: '已清空',
          type: 'success',
          duration: 1500
        })
      })
    },
    
    clear() {
      this.currentExpression = ''
      this.currentResult = ''
    },
    
    backspace() {
      if (this.currentExpression.length > 0) {
        this.currentExpression = this.currentExpression.slice(0, -1)
      }
    },
    
    insertText(text) {
      this.currentExpression += text
    },
    
    insertTemplate(expression) {
      this.currentExpression = expression
    },
    
    calculate() {
      if (!this.currentExpression.trim()) {
        this.$message({
          message: '请输入表达式',
          type: 'warning',
          duration: 1500
        })
        return
      }
      
      try {
        // 预处理表达式，将一些常用的数学符号转换为JavaScript可执行的代码
        let processedExpression = this.currentExpression
          .replace(/÷/g, '/')   // 将 ÷ 替换为 /
          .replace(/×/g, '*')   // 将 × 替换为 *
        
        // 简单的安全检查：只允许数字、运算符、括号和空格
        const allowedChars = /^[0-9+\-*/().\s]+$/
        if (!allowedChars.test(processedExpression)) {
          throw new Error('表达式包含不支持的字符')
        }
        
        // 使用 Function 构造函数安全地执行表达式
        const result = new Function(`return ${processedExpression}`)()
        
        if (isNaN(result)) {
          throw new Error('计算结果不是数字')
        }
        
        if (!isFinite(result)) {
          throw new Error('计算结果超出范围')
        }
        
        this.currentResult = result.toString()
        
        // 添加到历史记录
        this.addToHistory(this.currentExpression, this.currentResult)
        
        this.$message({
          message: '计算完成',
          type: 'success',
          duration: 1500
        })
        
      } catch (error) {
        console.error('计算错误:', error)
        this.currentResult = '错误'
        this.$message({
          message: `计算错误: ${error.message}`,
          type: 'error',
          duration: 1500
        })
      }
    },
    
    addToHistory(expression, result) {
      const record = {
        expression: expression,
        result: result,
        time: new Date().toLocaleTimeString()
      }
      
      this.history.unshift(record)
      
      // 限制历史记录数量
      if (this.history.length > 50) {
        this.history = this.history.slice(0, 50)
      }
      
      this.saveHistory()
    },
    
    loadFromHistory(record) {
      this.currentExpression = record.expression
      this.currentResult = record.result
    },
    
    clearHistory() {
      this.$confirm('确定要清空所有历史记录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.history = []
        this.saveHistory()
        this.$message({
          message: '历史记录已清空',
          type: 'success',
          duration: 1500
        })
      })
    },
    
    saveHistory() {
      try {
        localStorage.setItem('expression-calculator-history', JSON.stringify(this.history))
      } catch (error) {
        console.error('保存历史记录失败:', error)
      }
    },
    
    loadHistory() {
      try {
        const saved = localStorage.getItem('expression-calculator-history')
        if (saved) {
          this.history = JSON.parse(saved)
        }
      } catch (error) {
        console.error('加载历史记录失败:', error)
        this.history = []
      }
    },
    
    copyResult() {
      if (!this.currentResult) {
        this.$message({
          message: '没有结果可复制',
          type: 'warning',
          duration: 1500
        })
        return
      }
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.currentResult).then(() => {
          this.$message({
            message: '结果已复制到剪贴板',
            type: 'success',
            duration: 1500
          })
        }).catch(() => {
          this.fallbackCopyText(this.currentResult)
        })
      } else {
        this.fallbackCopyText(this.currentResult)
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
          message: '结果已复制到剪贴板',
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
.expression-calculator-container {
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

.calculator-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e4e7ed;
  background: #fafafa;
}

.expression-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
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

.panel-content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

/* 显示屏样式 */
.display-area {
  background: #1e1e1e;
  color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.expression-display {
  margin-bottom: 10px;
  min-height: 30px;
}

.expression-text {
  font-size: 16px;
  color: #888;
  word-break: break-all;
}

.result-display {
  min-height: 40px;
}

.result-text {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  word-break: break-all;
}

/* 按钮区域样式 */
.buttons-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.button-row {
  display: flex;
  gap: 8px;
}

.calc-btn {
  flex: 1;
  height: 50px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.number-btn {
  background: #f0f0f0;
  color: #333;
}

.number-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.operator-btn {
  background: #409eff;
  color: white;
}

.operator-btn:hover {
  background: #337ecc;
  transform: translateY(-1px);
}

.function-btn {
  background: #67c23a;
  color: white;
}

.function-btn:hover {
  background: #5daf34;
  transform: translateY(-1px);
}

.equals-btn {
  background: #f56c6c;
  color: white;
}

.equals-btn:hover {
  background: #f78989;
  transform: translateY(-1px);
}

.wide-btn {
  flex: 2;
}

/* 表达式输入区域 */
.expression-input-area {
  margin-bottom: 20px;
}

.input-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

/* 历史记录区域 */
.history-area {
  margin-bottom: 20px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.history-header h4 {
  margin: 0;
  color: #303133;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.history-item {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.history-item:hover {
  background: #f5f7fa;
}

.history-item:last-child {
  border-bottom: none;
}

.history-expression {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.history-result {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.history-time {
  font-size: 12px;
  color: #909399;
}

.no-history {
  padding: 20px;
  text-align: center;
  color: #909399;
  font-style: italic;
}

/* 模板区域 */
.templates-area {
  margin-bottom: 20px;
}

.templates-header h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.templates-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.template-btn {
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
  
  .main-content {
    flex-direction: column;
  }
  
  .calculator-panel {
    width: 100%;
    order: -1;
  }
  
  .calc-btn {
    height: 40px;
    font-size: 16px;
  }
  
  .result-text {
    font-size: 20px;
  }
  
  .templates-list {
    flex-direction: column;
  }
}
</style>
