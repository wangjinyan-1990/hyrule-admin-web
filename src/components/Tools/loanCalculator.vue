<template>
  <div class="loan-calculator-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" icon="el-icon-document" @click="resetForm">
          重置
        </el-button>
        <el-button icon="el-icon-full-screen" @click="toggleFullscreen">
          全屏
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 输入区域 -->
      <div class="input-section">
        <div class="form-container">
          <!-- 贷款参数 -->
          <div class="form-group">
            <label class="form-label">贷款金额</label>
            <div class="input-with-unit">
              <el-input
                v-model="loanAmount"
                type="number"
                placeholder="请输入贷款金额"
                @input="onInputChange"
              ></el-input>
              <span class="unit">元</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">贷款年限</label>
            <div class="input-with-unit">
              <el-input
                v-model="loanTerm"
                type="number"
                placeholder="请输入贷款年限"
                @input="onInputChange"
              ></el-input>
              <span class="unit">年</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">年利率</label>
            <div class="input-with-unit">
              <el-input
                v-model="annualRate"
                type="number"
                placeholder="请输入年利率"
                @input="onInputChange"
              ></el-input>
              <span class="unit">%</span>
            </div>
          </div>

          <!-- 还款方式 -->
          <div class="form-group">
            <label class="form-label">还款方式</label>
            <div class="radio-group">
              <el-radio v-model="repaymentMethod" label="equalPayment" @change="onInputChange">
                等额本息还款
              </el-radio>
              <el-radio v-model="repaymentMethod" label="equalPrincipal" @change="onInputChange">
                等额本金还款
              </el-radio>
            </div>
          </div>

          <!-- 计算按钮 -->
          <div class="calculate-section">
            <el-button 
              type="primary" 
              class="calculate-btn"
              @click="calculateLoan"
              :disabled="!isFormValid"
            >
              计算
            </el-button>
          </div>
        </div>
      </div>

      <!-- 结果区域 -->
      <div class="result-section">
        <div class="result-container">
          <div class="result-item">
            <span class="result-label">每月还款本金</span>
            <span class="result-value">{{ results.monthlyPrincipal }} 元</span>
          </div>
          <div class="result-item">
            <span class="result-label">每月支付利息</span>
            <span class="result-value">{{ results.monthlyInterest }} 元</span>
          </div>
          <div class="result-item">
            <span class="result-label">每月还款金额</span>
            <span class="result-value">{{ results.monthlyPayment }} 元</span>
          </div>
          <div class="result-item">
            <span class="result-label">累计支付利息</span>
            <span class="result-value">{{ results.totalInterest }} 元</span>
          </div>
          <div class="result-item">
            <span class="result-label">累计还款总额</span>
            <span class="result-value">{{ results.totalPayment }} 元</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示信息 -->
    <div class="hint-section">
      <span class="hint-text">提示：支持无息贷款，年利率为0。</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoanCalculator',
  data() {
    return {
      loanAmount: '86791',
      loanTerm: '2',
      annualRate: '3.6',
      repaymentMethod: 'equalPayment', // equalPayment: 等额本息, equalPrincipal: 等额本金
      results: {
        monthlyPrincipal: '0.00',
        monthlyInterest: '0.00',
        monthlyPayment: '0.00',
        totalInterest: '0.00',
        totalPayment: '0.00'
      }
    }
  },
  computed: {
    isFormValid() {
      return this.loanAmount && this.loanTerm && this.annualRate !== ''
    }
  },
  mounted() {
    // 页面加载时自动计算一次
    this.calculateLoan()
  },
  methods: {
    onInputChange() {
      // 输入变化时自动计算
      clearTimeout(this.calculateTimeout)
      this.calculateTimeout = setTimeout(() => {
        if (this.isFormValid) {
          this.calculateLoan()
        }
      }, 500)
    },
    
    calculateLoan() {
      if (!this.isFormValid) {
        this.$message({
          message: '请填写完整的贷款信息',
          type: 'warning',
          duration: 1500
        })
        return
      }

      const amount = parseFloat(this.loanAmount)
      const term = parseInt(this.loanTerm)
      const rate = parseFloat(this.annualRate)

      if (amount <= 0 || term <= 0 || rate < 0) {
        this.$message({
          message: '请输入有效的贷款参数',
          type: 'error',
          duration: 1500
        })
        return
      }

      const monthlyRate = rate / 100 / 12
      const totalMonths = term * 12

      if (this.repaymentMethod === 'equalPayment') {
        this.calculateEqualPayment(amount, monthlyRate, totalMonths)
      } else {
        this.calculateEqualPrincipal(amount, monthlyRate, totalMonths)
      }
    },

    // 等额本息计算
    calculateEqualPayment(amount, monthlyRate, totalMonths) {
      let monthlyPayment = 0
      
      if (monthlyRate === 0) {
        // 无息贷款
        monthlyPayment = amount / totalMonths
      } else {
        // 有息贷款
        monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / 
                        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      }

      const totalPayment = monthlyPayment * totalMonths
      const totalInterest = totalPayment - amount

      this.results = {
        monthlyPrincipal: this.formatNumber(amount / totalMonths),
        monthlyInterest: this.formatNumber(monthlyPayment - amount / totalMonths),
        monthlyPayment: this.formatNumber(monthlyPayment),
        totalInterest: this.formatNumber(totalInterest),
        totalPayment: this.formatNumber(totalPayment)
      }
    },

    // 等额本金计算
    calculateEqualPrincipal(amount, monthlyRate, totalMonths) {
      const monthlyPrincipal = amount / totalMonths
      const totalInterest = amount * monthlyRate * (totalMonths + 1) / 2
      const firstMonthInterest = amount * monthlyRate
      const totalPayment = amount + totalInterest

      this.results = {
        monthlyPrincipal: this.formatNumber(monthlyPrincipal),
        monthlyInterest: this.formatNumber(firstMonthInterest),
        monthlyPayment: this.formatNumber(monthlyPrincipal + firstMonthInterest),
        totalInterest: this.formatNumber(totalInterest),
        totalPayment: this.formatNumber(totalPayment)
      }
    },

    // 格式化数字
    formatNumber(num) {
      return num.toFixed(2)
    },

    // 重置表单
    resetForm() {
      this.loanAmount = '86791'
      this.loanTerm = '2'
      this.annualRate = '3.6'
      this.repaymentMethod = 'equalPayment'
      this.results = {
        monthlyPrincipal: '0.00',
        monthlyInterest: '0.00',
        monthlyPayment: '0.00',
        totalInterest: '0.00',
        totalPayment: '0.00'
      }
      this.$message({
        message: '表单已重置',
        type: 'success',
        duration: 1500
      })
    },

    // 全屏切换
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
.loan-calculator-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.main-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  overflow: hidden;
}

.input-section {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-container {
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-unit .el-input {
  flex: 1;
}

.unit {
  color: #909399;
  font-size: 14px;
  min-width: 20px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.calculate-section {
  text-align: center;
  margin-top: 30px;
}

.calculate-btn {
  width: 120px;
  height: 40px;
  font-size: 16px;
  font-weight: 500;
}

.result-section {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-container {
  max-width: 400px;
  margin: 0 auto;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  color: #606266;
  font-size: 14px;
}

.result-value {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.hint-section {
  padding: 15px 20px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  text-align: center;
}

.hint-text {
  color: #909399;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 15px;
    gap: 15px;
  }
  
  .input-section,
  .result-section {
    padding: 20px;
  }
  
  .form-container,
  .result-container {
    max-width: none;
  }
  
  .radio-group {
    flex-direction: row;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .toolbar {
    padding: 10px 15px;
  }
  
  .main-content {
    padding: 10px;
  }
  
  .input-section,
  .result-section {
    padding: 15px;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
