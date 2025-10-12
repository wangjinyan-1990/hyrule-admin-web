<template>
  <div class="crontab-calculator">
    <div class="calculator-header">
      <h2>Crontab 执行时间计算器</h2>
      <p>输入 crontab 表达式，计算未来执行时间</p>
    </div>

    <div class="calculator-form">
      <div class="form-item">
        <label>Crontab表达式:</label>
        <el-input 
          v-model="cronExpression" 
          placeholder="例如: 0 */6 * * *"
          @input="onExpressionChange"
          class="cron-input"
        />
      </div>
      
      <div class="form-item">
        <el-button 
          type="primary" 
          @click="calculateExecutionTimes"
          :disabled="!cronExpression.trim()"
          class="calculate-btn"
        >
          生成执行时间
        </el-button>
      </div>
    </div>

    <div class="results-section" v-if="executionTimes.length > 0">
      <h3>未来{{ executionTimes.length }}次执行时间:</h3>
      <div class="results-container">
        <div 
          v-for="(time, index) in executionTimes" 
          :key="index"
          class="time-item"
        >
          {{ time }}
        </div>
      </div>
    </div>

    <div class="crontab-help">
      <h3>Crontab 表达式说明</h3>
      <div class="help-content">
        <div class="expression-format">
          <div class="format-item">
            <span class="field">分 (0-59)</span>
            <span class="field">时 (0-23)</span>
            <span class="field">日 (1-31)</span>
            <span class="field">月 (1-12)</span>
            <span class="field">星期 (0-7)</span>
          </div>
          <div class="format-example">
            <code>*</code>
            <code>*</code>
            <code>*</code>
            <code>*</code>
            <code>*</code>
          </div>
        </div>
        
        <div class="examples">
          <h4>常用示例:</h4>
          <div class="example-list">
            <div class="example-item">
              <code>0 */6 * * *</code>
              <span>每6小时执行一次</span>
            </div>
            <div class="example-item">
              <code>0 0 * * *</code>
              <span>每天午夜执行</span>
            </div>
            <div class="example-item">
              <code>0 9 * * 1</code>
              <span>每周一上午9点执行</span>
            </div>
            <div class="example-item">
              <code>*/15 * * * *</code>
              <span>每15分钟执行一次</span>
            </div>
            <div class="example-item">
              <code>0 0 1 * *</code>
              <span>每月1号午夜执行</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CrontabCalculator',
  data() {
    return {
      cronExpression: '0 */6 * * *',
      executionTimes: []
    }
  },
  mounted() {
    this.calculateExecutionTimes()
  },
  methods: {
    onExpressionChange() {
      // 输入变化时清除之前的结果
      this.executionTimes = []
    },
    
    calculateExecutionTimes() {
      if (!this.cronExpression.trim()) {
        this.$message.warning('请输入 crontab 表达式')
        return
      }

      try {
        this.executionTimes = this.parseCronExpression(this.cronExpression.trim())
        if (this.executionTimes.length === 0) {
          this.$message.warning('无法解析该 crontab 表达式')
        }
      } catch (error) {
        this.$message.error('表达式格式错误: ' + error.message)
        this.executionTimes = []
      }
    },

    parseCronExpression(expression) {
      const parts = expression.split(' ')
      if (parts.length !== 5) {
        throw new Error('crontab 表达式必须包含5个字段')
      }

      const [minute, hour, day, month, weekday] = parts
      const now = new Date()
      const times = []
      let currentTime = new Date(now.getTime())
      
      // 计算未来10次执行时间
      for (let i = 0; i < 10; i++) {
        const nextTime = this.getNextExecutionTime(currentTime, minute, hour, day, month, weekday)
        if (!nextTime) {
          throw new Error('无法找到下一个执行时间')
        }
        times.push(this.formatDateTime(nextTime))
        currentTime = new Date(nextTime.getTime() + 60000) // 加1分钟避免重复
      }

      return times
    },

    getNextExecutionTime(startTime, minute, hour, day, month, weekday) {
      const time = new Date(startTime)
      
      // 解析各个字段
      const minuteValues = this.parseField(minute, 0, 59)
      const hourValues = this.parseField(hour, 0, 23)
      const dayValues = this.parseField(day, 1, 31)
      const monthValues = this.parseField(month, 1, 12)
      const weekdayValues = this.parseField(weekday, 0, 7)

      // 从当前时间开始，逐分钟查找下一个匹配的时间
      let candidateTime = new Date(time.getTime())
      
      // 最多查找2年内的执行时间
      const maxTime = new Date(time.getFullYear() + 2, 0, 1)
      
      while (candidateTime < maxTime) {
        const year = candidateTime.getFullYear()
        const m = candidateTime.getMonth() + 1
        const d = candidateTime.getDate()
        const h = candidateTime.getHours()
        const min = candidateTime.getMinutes()
        const dayOfWeek = candidateTime.getDay()
        
        // 检查月份是否匹配
        if (!monthValues.includes('*') && !monthValues.includes(m)) {
          // 跳到下个月
          candidateTime.setMonth(candidateTime.getMonth() + 1)
          candidateTime.setDate(1)
          candidateTime.setHours(0, 0, 0, 0)
          continue
        }
        
        // 检查日期是否匹配（注意：当同时指定了day和weekday时，两者都匹配才算）
        let dayMatch = false
        if (dayValues.includes('*')) {
          dayMatch = true
        } else {
          dayMatch = dayValues.includes(d)
        }
        
        // 检查星期是否匹配
        let weekdayMatch = false
        if (weekdayValues.includes('*')) {
          weekdayMatch = true
        } else {
          weekdayMatch = weekdayValues.includes(dayOfWeek)
        }
        
        // 如果同时指定了日期和星期，需要至少一个匹配
        // 如果只指定了其中一个，则该字段匹配即可
        const hasDayConstraint = !dayValues.includes('*')
        const hasWeekdayConstraint = !weekdayValues.includes('*')
        
        let dateMatch = false
        if (hasDayConstraint && hasWeekdayConstraint) {
          // 同时指定了日期和星期，至少一个匹配即可
          dateMatch = dayMatch || weekdayMatch
        } else if (hasDayConstraint) {
          // 只指定了日期
          dateMatch = dayMatch
        } else if (hasWeekdayConstraint) {
          // 只指定了星期
          dateMatch = weekdayMatch
        } else {
          // 都没有指定，任何日期都可以
          dateMatch = true
        }
        
        if (!dateMatch) {
          candidateTime.setDate(d + 1)
          candidateTime.setHours(0, 0, 0, 0)
          continue
        }
        
        // 检查小时是否匹配
        if (!hourValues.includes('*') && !hourValues.includes(h)) {
          candidateTime.setHours(h + 1, 0, 0, 0)
          continue
        }
        
        // 检查分钟是否匹配
        if (!minuteValues.includes('*') && !minuteValues.includes(min)) {
          candidateTime.setMinutes(min + 1, 0, 0)
          continue
        }
        
        // 所有条件都匹配，返回这个时间
        return new Date(candidateTime.getTime())
      }
      
      return null
    },

    parseField(field, min, max) {
      if (field === '*') return ['*']
      
      const values = []
      const parts = field.split(',')
      
      for (const part of parts) {
        const trimmedPart = part.trim()
        if (!trimmedPart) continue
        
        if (trimmedPart.includes('/')) {
          const [range, step] = trimmedPart.split('/')
          const stepValue = parseInt(step.trim())
          
          if (isNaN(stepValue) || stepValue <= 0) {
            throw new Error(`无效的步长值: ${step}`)
          }
          
          let start, end
          
          if (range.trim() === '*') {
            start = min
            end = max
          } else if (range.includes('-')) {
            const [startStr, endStr] = range.split('-')
            start = parseInt(startStr.trim())
            end = parseInt(endStr.trim())
            
            if (isNaN(start) || isNaN(end)) {
              throw new Error(`无效的范围值: ${range}`)
            }
          } else {
            start = end = parseInt(range.trim())
            if (isNaN(start)) {
              throw new Error(`无效的值: ${range}`)
            }
          }
          
          for (let i = start; i <= end; i += stepValue) {
            if (i >= min && i <= max) {
              values.push(i)
            }
          }
        } else if (trimmedPart.includes('-')) {
          const [startStr, endStr] = trimmedPart.split('-')
          const start = parseInt(startStr.trim())
          const end = parseInt(endStr.trim())
          
          if (isNaN(start) || isNaN(end)) {
            throw new Error(`无效的范围值: ${trimmedPart}`)
          }
          
          for (let i = start; i <= end; i++) {
            if (i >= min && i <= max) {
              values.push(i)
            }
          }
        } else {
          const value = parseInt(trimmedPart)
          if (isNaN(value)) {
            throw new Error(`无效的值: ${trimmedPart}`)
          }
          if (value >= min && value <= max) {
            values.push(value)
          }
        }
      }
      
      return values.length > 0 ? values : ['*']
    },

    formatDateTime(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      const second = String(date.getSeconds()).padStart(2, '0')
      
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    }
  }
}
</script>

<style scoped>
.crontab-calculator {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.calculator-header {
  text-align: center;
  margin-bottom: 30px;
}

.calculator-header h2 {
  color: #303133;
  margin: 0 0 10px 0;
  font-size: 24px;
}

.calculator-header p {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.calculator-form {
  margin-bottom: 30px;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
}

.cron-input {
  width: 100%;
}

.calculate-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.results-section {
  margin-bottom: 30px;
}

.results-section h3 {
  color: #303133;
  margin: 0 0 15px 0;
  font-size: 18px;
}

.results-container {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.time-item {
  padding: 8px 12px;
  margin-bottom: 5px;
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #495057;
}

.time-item:last-child {
  margin-bottom: 0;
}

.crontab-help {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
}

.crontab-help h3 {
  color: #303133;
  margin: 0 0 15px 0;
  font-size: 18px;
}

.expression-format {
  margin-bottom: 20px;
}

.format-item {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.format-item .field {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #606266;
  background-color: #e9ecef;
  padding: 5px;
  border-radius: 3px;
}

.format-example {
  display: flex;
  gap: 15px;
}

.format-example code {
  flex: 1;
  text-align: center;
  background-color: #fff;
  border: 1px solid #dee2e6;
  padding: 8px;
  border-radius: 3px;
  font-size: 14px;
  color: #495057;
}

.examples h4 {
  color: #495057;
  margin: 0 0 10px 0;
  font-size: 16px;
}

.example-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.example-item code {
  background-color: #fff;
  border: 1px solid #dee2e6;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 13px;
  color: #495057;
  min-width: 120px;
  text-align: center;
}

.example-item span {
  color: #6c757d;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .crontab-calculator {
    padding: 15px;
    margin: 10px;
  }
  
  .format-item,
  .format-example {
    gap: 8px;
  }
  
  .format-item .field,
  .format-example code {
    font-size: 11px;
    padding: 4px;
  }
  
  .example-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .example-item code {
    min-width: auto;
  }
}
</style>
