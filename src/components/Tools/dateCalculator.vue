<template>
  <div class="date-calculator">
    <div class="calculator-header">
      <h2>天数计算器</h2>
      <p>计算两个日期之间的天数差</p>
    </div>

    <div class="calculator-form">
      <div class="date-inputs">
        <div class="date-input-group">
          <label>输入您的开始日期</label>
          <el-date-picker
            v-model="startDate"
            type="date"
            placeholder="选择开始日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            class="date-picker"
          />
        </div>
        
        <div class="date-input-group">
          <label>输入您的结束日期</label>
          <el-date-picker
            v-model="endDate"
            type="date"
            placeholder="选择结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            class="date-picker"
          />
        </div>
      </div>
      
      <div class="calculate-button">
        <el-button 
          type="primary" 
          @click="calculateDays"
          :disabled="!startDate || !endDate"
          class="calc-btn"
        >
          计算
        </el-button>
      </div>
    </div>

    <div class="results-section" v-if="result !== null">
      <div class="result-display">
        <span class="result-label">两个日期之间的天数:</span>
        <span class="result-value">{{ result }}天</span>
      </div>
      
      <div class="additional-info" v-if="additionalInfo">
        <div class="info-item">
          <span class="info-label">开始日期:</span>
          <span class="info-value">{{ formatDate(startDate) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">结束日期:</span>
          <span class="info-value">{{ formatDate(endDate) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">包含天数:</span>
          <span class="info-value">{{ result + 1 }}天</span>
          <span class="info-note">(包含开始和结束日期)</span>
        </div>
        <div class="info-item">
          <span class="info-label">工作日天数:</span>
          <span class="info-value">{{ workDays }}天</span>
          <span class="info-note">(排除周末)</span>
        </div>
      </div>
    </div>

    <div class="tips-section">
      <h3>使用说明</h3>
      <ul class="tips-list">
        <li>选择开始日期和结束日期</li>
        <li>点击"计算"按钮获取天数差</li>
        <li>结果不包含结束日期当天</li>
        <li>如需包含结束日期，请使用"包含天数"</li>
        <li>工作日天数已排除周末（周六、周日）</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DateCalculator',
  data() {
    return {
      startDate: '2025-10-02',
      endDate: '2025-10-18',
      result: null,
      additionalInfo: false,
      workDays: 0
    }
  },
  mounted() {
    this.calculateDays()
  },
  methods: {
    calculateDays() {
      if (!this.startDate || !this.endDate) {
        this.$message.warning('请选择开始日期和结束日期')
        return
      }

      const start = new Date(this.startDate)
      const end = new Date(this.endDate)
      
      if (start > end) {
        this.$message.warning('开始日期不能晚于结束日期')
        return
      }

      // 计算天数差（不包含结束日期）
      const timeDiff = end.getTime() - start.getTime()
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24))
      
      this.result = daysDiff
      this.additionalInfo = true
      
      // 计算工作日天数
      this.workDays = this.calculateWorkDays(start, end)
    },

    calculateWorkDays(startDate, endDate) {
      let workDays = 0
      const current = new Date(startDate)
      
      while (current < endDate) {
        const dayOfWeek = current.getDay()
        // 排除周末 (0=周日, 6=周六)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workDays++
        }
        current.setDate(current.getDate() + 1)
      }
      
      return workDays
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekday = weekdays[date.getDay()]
      
      return `${year}年${month}月${day}日 ${weekday}`
    }
  }
}
</script>

<style scoped>
.date-calculator {
  max-width: 600px;
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

.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.date-input-group {
  display: flex;
  flex-direction: column;
}

.date-input-group label {
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

.date-picker {
  width: 100%;
}

.calculate-button {
  text-align: center;
}

.calc-btn {
  width: 120px;
  height: 40px;
  font-size: 16px;
}

.results-section {
  margin-bottom: 30px;
}

.result-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 20px;
}

.result-label {
  color: #495057;
  font-size: 16px;
  font-weight: 500;
}

.result-value {
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
}

.additional-info {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #606266;
  min-width: 80px;
  margin-right: 10px;
}

.info-value {
  color: #303133;
  font-weight: 500;
  margin-right: 5px;
}

.info-note {
  color: #909399;
  font-size: 12px;
}

.tips-section {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 20px;
}

.tips-section h3 {
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

/* 响应式设计 */
@media (max-width: 768px) {
  .date-calculator {
    padding: 15px;
    margin: 10px;
  }
  
  .date-inputs {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .result-display {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .info-label {
    min-width: auto;
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .calculator-header h2 {
    font-size: 20px;
  }
  
  .calc-btn {
    width: 100%;
  }
  
  .result-label,
  .result-value {
    font-size: 14px;
  }
}
</style>
