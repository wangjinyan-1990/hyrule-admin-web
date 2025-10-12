<template>
  <div class="password-generator-container">
    <div class="generator-header">
      <h2>随机密码生成</h2>
      <p>生成安全、随机的密码</p>
    </div>
    
    <div class="generator-form">
      <!-- 配置区域 -->
      <div class="config-section">
        <div class="config-row">
          <div class="config-item">
            <label class="config-label">密码长度:</label>
            <el-input
              v-model="passwordLength"
              type="number"
              :min="4"
              :max="128"
              placeholder="12"
              class="length-input"
              @input="handleLengthChange"
            />
          </div>
          
          <div class="config-item">
            <label class="config-label">生成数量:</label>
            <el-input
              v-model="generateCount"
              type="number"
              :min="1"
              :max="50"
              placeholder="8"
              class="count-input"
              @input="handleCountChange"
            />
          </div>
        </div>
        
        <!-- 字符类型选择 -->
        <div class="character-types">
          <h4>字符类型</h4>
          <div class="checkbox-group">
            <el-checkbox v-model="includeNumbers" class="type-checkbox">
              数字
            </el-checkbox>
            <el-checkbox v-model="includeUppercase" class="type-checkbox">
              大写英文字母
            </el-checkbox>
            <el-checkbox v-model="includeLowercase" class="type-checkbox">
              小写英文字母
            </el-checkbox>
            <el-checkbox v-model="includeSymbols" class="type-checkbox">
              特殊符号
            </el-checkbox>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="generatePasswords" :disabled="!hasValidConfig">
            生成
          </el-button>
          <el-button type="success" @click="copyAllPasswords" :disabled="generatedPasswords.length === 0">
            复制结果
          </el-button>
        </div>
      </div>
      
      <!-- 生成的密码显示区域 -->
      <div class="passwords-section" v-if="generatedPasswords.length > 0">
        <h3>生成的密码</h3>
        
        <div class="passwords-list">
          <div 
            class="password-item" 
            v-for="(password, index) in generatedPasswords" 
            :key="index"
            @click="copyPassword(password, index + 1)"
          >
            <span class="password-text">{{ password }}</span>
            <span class="password-length">({{ password.length }}位)</span>
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div class="stats-section">
          <div class="stats-item">
            <span class="stats-label">生成数量:</span>
            <span class="stats-value">{{ generatedPasswords.length }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">密码长度:</span>
            <span class="stats-value">{{ passwordLength }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">字符类型:</span>
            <span class="stats-value">{{ selectedTypesCount }}种</span>
          </div>
        </div>
        
        <div class="tip-text">
          <i class="el-icon-info"></i>
          点击密码可以复制单个密码
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordGenerator',
  data() {
    return {
      passwordLength: 12,
      generateCount: 8,
      includeNumbers: true,
      includeUppercase: true,
      includeLowercase: true,
      includeSymbols: true,
      generatedPasswords: []
    }
  },
  computed: {
    hasValidConfig() {
      return this.passwordLength >= 4 && 
             this.generateCount >= 1 && 
             (this.includeNumbers || this.includeUppercase || this.includeLowercase || this.includeSymbols)
    },
    selectedTypesCount() {
      let count = 0
      if (this.includeNumbers) count++
      if (this.includeUppercase) count++
      if (this.includeLowercase) count++
      if (this.includeSymbols) count++
      return count
    }
  },
  methods: {
    handleLengthChange(value) {
      this.passwordLength = Math.max(4, Math.min(128, parseInt(value) || 12))
    },
    
    handleCountChange(value) {
      this.generateCount = Math.max(1, Math.min(50, parseInt(value) || 8))
    },
    
    generatePasswords() {
      if (!this.hasValidConfig) {
        this.$message({
          message: '请至少选择一种字符类型',
          type: 'error',
          duration: 1500
        })
        return
      }
      
      this.generatedPasswords = []
      
      // 构建字符集
      let charset = ''
      if (this.includeNumbers) charset += '0123456789'
      if (this.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (this.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
      if (this.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
      
      if (charset.length === 0) {
        this.$message({
          message: '请至少选择一种字符类型',
          type: 'error',
          duration: 1500
        })
        return
      }
      
      // 生成密码
      for (let i = 0; i < this.generateCount; i++) {
        let password = ''
        for (let j = 0; j < this.passwordLength; j++) {
          password += charset.charAt(Math.floor(Math.random() * charset.length))
        }
        this.generatedPasswords.push(password)
      }
      
      this.$message({
        message: `成功生成 ${this.generateCount} 个密码`,
        type: 'success',
        duration: 1500
      })
    },
    
    copyPassword(password, index) {
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(password).then(() => {
          this.$message({
            message: `密码 ${index}: ${password} 已复制到剪贴板`,
            type: 'success',
            duration: 1500
          })
        }).catch(() => {
          this.fallbackCopy(password, index)
        })
      } else {
        this.fallbackCopy(password, index)
      }
    },
    
    copyAllPasswords() {
      const allPasswords = this.generatedPasswords.join('\n')
      
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(allPasswords).then(() => {
          this.$message({
            message: `已复制 ${this.generatedPasswords.length} 个密码到剪贴板`,
            type: 'success',
            duration: 1500
          })
        }).catch(() => {
          this.fallbackCopy(allPasswords, '所有密码')
        })
      } else {
        this.fallbackCopy(allPasswords, '所有密码')
      }
    },
    
    fallbackCopy(text, label) {
      // 兼容旧浏览器的复制方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message({
          message: `${label} 已复制到剪贴板`,
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
    }
  },
  mounted() {
    // 初始化生成密码
    this.generatePasswords()
  }
}
</script>

<style scoped>
.password-generator-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.generator-header {
  text-align: center;
  margin-bottom: 40px;
}

.generator-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.generator-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.generator-form {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.config-section {
  margin-bottom: 30px;
}

.config-row {
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.config-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.length-input,
.count-input {
  width: 100px;
}

.length-input >>> .el-input__inner,
.count-input >>> .el-input__inner {
  text-align: center;
  font-family: 'Courier New', monospace;
}

.character-types {
  margin-bottom: 25px;
}

.character-types h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.type-checkbox {
  font-size: 14px;
}

.type-checkbox >>> .el-checkbox__label {
  color: #606266;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-buttons .el-button {
  min-width: 100px;
}

.passwords-section {
  margin-bottom: 30px;
}

.passwords-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

.passwords-list {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
  background-color: #fafafa;
}

.password-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
}

.password-item:hover {
  background-color: #f0f9ff;
}

.password-item:last-child {
  border-bottom: none;
}

.password-text {
  font-size: 16px;
  color: #303133;
  font-weight: 600;
  letter-spacing: 1px;
}

.password-length {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #67c23a;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.stats-value {
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
  .password-generator-container {
    padding: 20px;
  }
  
  .generator-form {
    padding: 20px;
  }
  
  .config-row {
    flex-direction: column;
    gap: 15px;
  }
  
  .config-item {
    justify-content: space-between;
  }
  
  .length-input,
  .count-input {
    width: 80px;
  }
  
  .checkbox-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
  
  .password-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .password-text {
    font-size: 14px;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .password-text {
    font-size: 13px;
    word-break: break-all;
  }
  
  .password-length {
    font-size: 11px;
  }
}
</style>
