<template>
  <div class="prime-factorization-container">
    <div class="factorization-header">
      <h2>分解质因数</h2>
      <p>将一个合数分解成若干个质数的积形式</p>
    </div>

    <div class="factorization-content">
      <!-- 计算规则说明 -->
      <div class="rules-section">
        <h3>计算规则:</h3>
        <div class="rule-text">
          <p>把一个合数分解成若干个质因数的积形式，即求质因数的过程，叫做分解质因数。</p>
          <p>分解质因数只针对合数。（分解质因数也叫做分解素因数）求一个数分解质因数，要从最小的质数除起，一直除到结果为质数为止。分解质因数的算式叫短除法，和除法的性质差不多，还可以用来求多个数的公因式。</p>
        </div>
      </div>

      <!-- 输入和计算区域 -->
      <div class="calculation-section">
        <div class="input-group">
          <label class="input-label">请输入要分解的数字：</label>
          <el-input
            v-model="inputNumber"
            type="number"
            placeholder="请输入一个大于1的正整数"
            class="number-input"
            @keyup.enter="calculate"
          >
            <template slot="append">
              <el-button type="primary" @click="calculate">计算</el-button>
              <el-button @click="clear">清空</el-button>
            </template>
          </el-input>
        </div>

        <!-- 分解结果 -->
        <div class="result-section" v-if="result">
          <h3>分解结果：</h3>
          <div class="result-box">
            <div class="result-item">
              <span class="result-label">原数字：</span>
              <span class="result-value">{{ originalNumber }}</span>
            </div>
            <div class="result-item">
              <span class="result-label">质因数分解：</span>
              <span class="result-value prime-factors">{{ result }}</span>
            </div>
            <div class="result-item" v-if="primeFactorsList.length > 0">
              <span class="result-label">质因数列表：</span>
              <span class="result-value">{{ primeFactorsList.join(', ') }}</span>
            </div>
            <div class="result-item" v-if="uniquePrimeFactors.length > 0">
              <span class="result-label">不同的质因数：</span>
              <span class="result-value">{{ uniquePrimeFactors.join(', ') }}</span>
            </div>
          </div>

          <!-- 分解步骤 -->
          <div class="steps-section" v-if="steps.length > 0">
            <h3>分解步骤：</h3>
            <div class="steps-box">
              <div class="step-item" v-for="(step, index) in steps" :key="index">
                <span class="step-number">步骤 {{ index + 1 }}：</span>
                <span class="step-content">{{ step }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 示例说明 -->
      <div class="example-section">
        <h3>示例：</h3>
        <div class="examples">
          <div class="example-item" @click="inputNumber = '8'">
            <span class="example-num">8</span>
            <span class="example-arrow">→</span>
            <span class="example-result">2 × 2 × 2</span>
          </div>
          <div class="example-item" @click="inputNumber = '12'">
            <span class="example-num">12</span>
            <span class="example-arrow">→</span>
            <span class="example-result">2 × 2 × 3</span>
          </div>
          <div class="example-item" @click="inputNumber = '60'">
            <span class="example-num">60</span>
            <span class="example-arrow">→</span>
            <span class="example-result">2 × 2 × 3 × 5</span>
          </div>
          <div class="example-item" @click="inputNumber = '100'">
            <span class="example-num">100</span>
            <span class="example-arrow">→</span>
            <span class="example-result">2 × 2 × 5 × 5</span>
          </div>
        </div>
        <p class="example-tip">点击示例可快速填入</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PrimeFactorization',
  data() {
    return {
      inputNumber: '',
      originalNumber: '',
      result: '',
      primeFactorsList: [],
      uniquePrimeFactors: [],
      steps: []
    }
  },
  methods: {
    calculate() {
      const num = parseInt(this.inputNumber)

      // 验证输入
      if (!this.inputNumber || isNaN(num)) {
        this.$message.warning('请输入有效的数字')
        return
      }

      if (num < 2) {
        this.$message.warning('请输入大于1的正整数')
        return
      }

      if (num > 10000000) {
        this.$message.warning('数字过大，请输入小于1000万的数字')
        return
      }

      this.originalNumber = num

      // 判断是否为质数
      if (this.isPrime(num)) {
        this.result = `${num} 是质数，无法分解`
        this.primeFactorsList = [num]
        this.uniquePrimeFactors = [num]
        this.steps = [`${num} 是质数，不需要分解`]
        return
      }

      // 分解质因数
      this.factorize(num)
    },

    isPrime(n) {
      if (n <= 1) return false
      if (n <= 3) return true
      if (n % 2 === 0 || n % 3 === 0) return false
      
      for (let i = 5; i * i <= n; i += 6) {
        if (n % i === 0 || n % (i + 2) === 0) return false
      }
      return true
    },

    factorize(num) {
      const factors = []
      const steps = []
      let current = num
      let divisor = 2

      // 从最小的质数2开始除
      while (current > 1) {
        if (current % divisor === 0) {
          factors.push(divisor)
          steps.push(`${current} ÷ ${divisor} = ${current / divisor}`)
          current = current / divisor
        } else {
          divisor++
          // 优化：跳过偶数（除了2）
          if (divisor > 2 && divisor % 2 === 0) {
            divisor++
          }
        }
      }

      this.primeFactorsList = factors
      this.uniquePrimeFactors = [...new Set(factors)].sort((a, b) => a - b)
      this.result = factors.join(' × ')
      this.steps = steps

      this.$message.success('分解完成')
    },

    clear() {
      this.inputNumber = ''
      this.originalNumber = ''
      this.result = ''
      this.primeFactorsList = []
      this.uniquePrimeFactors = []
      this.steps = []
    }
  }
}
</script>

<style scoped>
.prime-factorization-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.factorization-header {
  text-align: center;
  margin-bottom: 40px;
}

.factorization-header h2 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.factorization-header p {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.factorization-content {
  max-width: 900px;
  margin: 0 auto;
}

.rules-section {
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.rules-section h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.rule-text p {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin: 10px 0;
  text-indent: 2em;
}

.calculation-section {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.input-group {
  margin-bottom: 25px;
}

.input-label {
  display: block;
  font-size: 16px;
  color: #303133;
  margin-bottom: 12px;
  font-weight: 500;
}

.number-input {
  font-size: 16px;
}

.number-input >>> .el-input__inner {
  font-size: 16px;
}

.result-section {
  margin-top: 30px;
}

.result-section h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.result-box {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  margin-bottom: 20px;
}

.result-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 15px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-label {
  color: #606266;
  font-weight: 500;
  min-width: 120px;
}

.result-value {
  color: #303133;
  flex: 1;
}

.prime-factors {
  color: #409eff;
  font-size: 18px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.steps-section {
  margin-top: 25px;
}

.steps-section h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.steps-box {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.step-item {
  display: flex;
  margin-bottom: 10px;
  font-size: 14px;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-number {
  color: #409eff;
  font-weight: 600;
  min-width: 70px;
}

.step-content {
  color: #606266;
  font-family: 'Courier New', monospace;
}

.example-section {
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.example-section h3 {
  font-size: 18px;
  color: #303133;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.example-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  background: #f8f9fa;
  border: 2px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.example-item:hover {
  border-color: #409eff;
  background: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.example-num {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.example-arrow {
  margin: 0 10px;
  color: #909399;
  font-size: 16px;
}

.example-result {
  font-size: 15px;
  color: #409eff;
  font-family: 'Courier New', monospace;
}

.example-tip {
  text-align: center;
  font-size: 13px;
  color: #909399;
  margin: 10px 0 0 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .prime-factorization-container {
    padding: 20px;
  }

  .rules-section,
  .calculation-section,
  .example-section {
    padding: 20px;
  }

  .factorization-header h2 {
    font-size: 24px;
  }

  .examples {
    grid-template-columns: 1fr;
  }

  .result-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .result-label {
    margin-bottom: 5px;
  }

  .step-item {
    flex-direction: column;
  }

  .step-number {
    margin-bottom: 5px;
  }
}

@media (max-width: 480px) {
  .prime-factorization-container {
    padding: 15px;
  }

  .rules-section,
  .calculation-section,
  .example-section {
    padding: 15px;
  }

  .factorization-header h2 {
    font-size: 22px;
  }

  .factorization-header p {
    font-size: 14px;
  }

  .example-num,
  .example-result {
    font-size: 14px;
  }
}
</style>

