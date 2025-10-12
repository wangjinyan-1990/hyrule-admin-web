<template>
  <div class="rmb-converter-container">
    <div class="converter-header">
      <h2>人民币大写转换</h2>
      <p>将阿拉伯数字金额转换为中文大写金额</p>
    </div>
    
    <div class="converter-form">
      <div class="input-group">
        <label class="input-label">小写金额:</label>
        <el-input 
          v-model="inputAmount" 
          placeholder="请输入金额数字"
          class="amount-input"
          @input="handleInput"
          @keyup.enter="convertAmount"
        />
      </div>
      
      <div class="input-group">
        <label class="input-label">大写金额:</label>
        <el-input 
          v-model="outputAmount" 
          readonly
          class="result-input"
        />
      </div>
      
      <div class="button-group">
        <el-button type="primary" @click="convertAmount">
          转换
        </el-button>
        <el-button type="success" @click="copyResult" :disabled="!outputAmount">
          复制
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RmbConverter',
  data() {
    return {
      inputAmount: '',
      outputAmount: ''
    }
  },
  methods: {
    handleInput(value) {
      // 只允许数字和小数点
      this.inputAmount = value.replace(/[^\d.]/g, '')
      
      // 如果有有效输入，自动转换
      if (this.inputAmount) {
        const amount = parseFloat(this.inputAmount)
        if (!isNaN(amount) && amount >= 0) {
          this.outputAmount = this.numberToChinese(amount)
        }
      } else {
        this.outputAmount = ''
      }
    },
    
    convertAmount() {
      if (!this.inputAmount) {
        this.$message.warning('请输入金额')
        return
      }
      
      const amount = parseFloat(this.inputAmount)
      if (isNaN(amount) || amount < 0) {
        this.$message.error('请输入有效的金额')
        return
      }
      
      this.outputAmount = this.numberToChinese(amount)
      this.$message.success('转换成功')
    },
    
    copyResult() {
      if (!this.outputAmount) {
        this.$message.warning('没有可复制的内容')
        return
      }
      
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.outputAmount).then(() => {
          this.$message.success('已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopy(this.outputAmount)
        })
      } else {
        this.fallbackCopy(this.outputAmount)
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
    
    numberToChinese(num) {
      const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
      const units = ['', '拾', '佰', '仟']
      const bigUnits = ['', '万', '亿', '兆']
      
      // 处理整数部分
      const integerPart = Math.floor(num)
      const decimalPart = Math.round((num - integerPart) * 100)
      
      let result = ''
      
      // 转换整数部分
      if (integerPart === 0) {
        result = '零'
      } else {
        result = this.convertInteger(integerPart, digits, units, bigUnits)
      }
      
      // 添加"元"
      result += '元'
      
      // 处理小数部分
      if (decimalPart === 0) {
        result += '整'
      } else {
        const jiao = Math.floor(decimalPart / 10)
        const fen = decimalPart % 10
        
        if (jiao > 0) {
          result += digits[jiao] + '角'
        }
        
        if (fen > 0) {
          result += digits[fen] + '分'
        }
      }
      
      return result
    },
    
    convertInteger(num, digits, units, bigUnits) {
      if (num === 0) return ''
      
      // 将数字转换为字符串以便处理
      const numStr = num.toString()
      const len = numStr.length
      let result = ''
      
      // 按万、亿等单位分组处理
      const groups = []
      for (let i = len; i > 0; i -= 4) {
        const start = Math.max(0, i - 4)
        groups.push(parseInt(numStr.slice(start, i)))
      }
      
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i]
        if (group > 0) {
          const groupStr = this.convertGroup(group, digits, units)
          if (i > 0) {
            result = groupStr + bigUnits[i] + result
          } else {
            result = groupStr + result
          }
        }
      }
      
      return result
    },
    
    convertGroup(num, digits, units) {
      if (num === 0) return ''
      
      let result = ''
      let needZero = false
      
      // 处理个位到千位
      for (let i = 3; i >= 0; i--) {
        const digit = Math.floor(num / Math.pow(10, i)) % 10
        const unit = units[i]
        
        if (digit !== 0) {
          if (needZero && result) {
            result += '零'
          }
          result += digits[digit] + unit
          needZero = false
        } else if (result && i > 0) {
          // 只有在已经有结果且不是个位时才可能需要零
          needZero = true
        }
      }
      
      return result
    }
  }
}
</script>

<style scoped>
.rmb-converter-container {
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
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
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

.amount-input {
  width: 100%;
}

.result-input {
  width: 100%;
}

.result-input >>> .el-input__inner {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
}

.button-group .el-button {
  min-width: 100px;
  height: 40px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rmb-converter-container {
    padding: 20px;
  }
  
  .converter-form {
    padding: 20px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .button-group .el-button {
    width: 100%;
  }
}
</style>