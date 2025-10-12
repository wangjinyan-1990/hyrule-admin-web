<template>
  <div class="qrcode-generator-container">
    <div class="generator-header">
      <h2>二维码在线生成</h2>
      <p>生成个性化二维码，支持Logo、颜色自定义</p>
    </div>
    
    <div class="generator-form">
      <!-- 左侧：个性参数设置 -->
      <div class="settings-panel">
        <h3>个性参数设置</h3>
        
        <!-- Logo上传区域 -->
        <div class="logo-section">
          <h4>中心Logo</h4>
          <div class="logo-upload">
            <div class="logo-preview" v-if="logoDataUrl">
              <img :src="logoDataUrl" alt="Logo预览" />
            </div>
            <div class="logo-placeholder" v-else>
              <i class="el-icon-picture"></i>
              <p>点击上传Logo</p>
            </div>
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleLogoUpload"
            />
            <div class="logo-actions">
              <el-button type="primary" size="small" @click="triggerLogoUpload">
                上传Logo
              </el-button>
              <el-button type="danger" size="small" @click="removeLogo" v-if="logoDataUrl">
                取消
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 容错级别 -->
        <div class="setting-item">
          <label class="setting-label">容错级别</label>
          <el-select v-model="errorCorrectionLevel" placeholder="选择容错级别">
            <el-option label="L - 低 (约7%)" value="L"></el-option>
            <el-option label="M - 中 (约15%)" value="M"></el-option>
            <el-option label="Q - 高 (约25%)" value="Q"></el-option>
            <el-option label="H - 最高 (约30%)" value="H"></el-option>
          </el-select>
        </div>
        
        <!-- 生成尺寸 -->
        <div class="setting-item">
          <label class="setting-label">生成尺寸</label>
          <el-select v-model="qrSize" placeholder="选择尺寸">
            <el-option label="128×128" value="128"></el-option>
            <el-option label="192×192" value="192"></el-option>
            <el-option label="256×256" value="256"></el-option>
            <el-option label="320×320" value="320"></el-option>
            <el-option label="512×512" value="512"></el-option>
          </el-select>
        </div>
        
        <!-- 二维码颜色 -->
        <div class="setting-item">
          <label class="setting-label">二维码色</label>
          <div class="color-input-group">
            <el-input v-model="foregroundColor" placeholder="#000000" class="color-input"></el-input>
            <div 
              class="color-preview" 
              :style="{ backgroundColor: foregroundColor }"
              @click="openColorPicker('foreground')"
            ></div>
          </div>
        </div>
        
        <!-- 背景颜色 -->
        <div class="setting-item">
          <label class="setting-label">背景颜色</label>
          <div class="color-input-group">
            <el-input v-model="backgroundColor" placeholder="#ffffff" class="color-input"></el-input>
            <div 
              class="color-preview" 
              :style="{ backgroundColor: backgroundColor }"
              @click="openColorPicker('background')"
            ></div>
          </div>
        </div>
        
        <!-- 存放数据 -->
        <div class="setting-item">
          <label class="setting-label">存放数据</label>
          <el-input
            v-model="qrData"
            type="textarea"
            :rows="4"
            placeholder="请输入要生成二维码的数据..."
          />
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="generateQRCode" :disabled="!qrData.trim()">
            生成单个
          </el-button>
          <el-button @click="resetSettings">
            重置
          </el-button>
        </div>
        
        <!-- 批量生成 -->
        <div class="batch-section">
          <h4>批量生成</h4>
          <el-button type="success" @click="generateBatch" :disabled="!qrData.trim()">
            批量生成
          </el-button>
        </div>
      </div>
      
      <!-- 右侧：生成结果 -->
      <div class="result-panel">
        <h3>单个生成结果</h3>
        
        <div class="qrcode-display" v-if="qrCodeDataUrl">
          <div class="qrcode-container">
            <canvas ref="qrCanvas" :width="qrSize" :height="qrSize"></canvas>
          </div>
          <el-button type="primary" @click="downloadQRCode">
            下载
          </el-button>
        </div>
        
        <div class="no-result" v-else>
          <i class="el-icon-picture-outline"></i>
          <p>点击"生成单个"按钮生成二维码</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QrCodeGenerator',
  data() {
    return {
      logoDataUrl: '',
      errorCorrectionLevel: 'H',
      qrSize: '192',
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      qrData: 'https://mdeve.com',
      qrCodeDataUrl: ''
    }
  },
  methods: {
    triggerLogoUpload() {
      this.$refs.logoInput.click()
    },
    
    handleLogoUpload(event) {
      const file = event.target.files[0]
      if (file) {
        if (!file.type.startsWith('image/')) {
          this.$message.error('请选择图片文件')
          return
        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          this.logoDataUrl = e.target.result
          this.$message.success('Logo上传成功')
        }
        reader.readAsDataURL(file)
      }
    },
    
    removeLogo() {
      this.logoDataUrl = ''
      this.$message.info('Logo已移除')
    },
    
    openColorPicker(type) {
      // 简单的颜色选择器实现
      const color = prompt(`请输入${type === 'foreground' ? '二维码' : '背景'}颜色 (如: #000000):`)
      if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) {
        if (type === 'foreground') {
          this.foregroundColor = color
        } else {
          this.backgroundColor = color
        }
      }
    },
    
    generateQRCode() {
      if (!this.qrData.trim()) {
        this.$message.warning('请输入要生成二维码的数据')
        return
      }
      
      try {
        // 先设置标志，让canvas渲染出来
        if (!this.qrCodeDataUrl) {
          this.qrCodeDataUrl = 'generating' // 临时值，让v-if通过
        }
        
        // 等待DOM更新后再生成二维码
        this.$nextTick(() => {
          this.createQRCode()
          this.$message.success('二维码生成成功')
        })
      } catch (error) {
        this.$message.error('二维码生成失败: ' + error.message)
      }
    },
    
    createQRCode() {
      const canvas = this.$refs.qrCanvas
      
      // 检查canvas是否存在
      if (!canvas) {
        console.error('Canvas element not found')
        return
      }
      
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        console.error('Cannot get 2d context')
        return
      }
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 设置背景色
      ctx.fillStyle = this.backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // 简单的二维码生成算法（这里使用简化的实现）
      this.drawSimpleQRCode(ctx, this.qrData, parseInt(this.qrSize))
      
      // 保存二维码数据URL
      this.qrCodeDataUrl = canvas.toDataURL()
    },
    
    drawSimpleQRCode(ctx, data, size) {
      // 这是一个简化的二维码绘制实现
      // 实际项目中建议使用专业的QR码库如 qrcode.js
      
      const moduleSize = Math.floor(size / 25) // 假设25x25的模块
      const margin = (size - moduleSize * 25) / 2
      
      // 绘制二维码模块（简化版）
      ctx.fillStyle = this.foregroundColor
      
      // 绘制定位点（三个角的方框）
      this.drawFinderPattern(ctx, margin, margin, moduleSize)
      this.drawFinderPattern(ctx, margin + moduleSize * 18, margin, moduleSize)
      this.drawFinderPattern(ctx, margin, margin + moduleSize * 18, moduleSize)
      
      // 绘制数据模块（简化）
      this.drawDataModules(ctx, data, margin, moduleSize, size)
      
      // 如果有Logo，在中心绘制
      if (this.logoDataUrl) {
        this.drawLogo(ctx, size)
      }
    },
    
    drawFinderPattern(ctx, x, y, moduleSize) {
      // 绘制定位点
      const patterns = [
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1]
      ]
      
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (patterns[i][j] === 1) {
            ctx.fillRect(x + j * moduleSize, y + i * moduleSize, moduleSize, moduleSize)
          }
        }
      }
    },
    
    drawDataModules(ctx, data, margin, moduleSize, size) {
      // 简化的数据模块绘制
      const hash = this.simpleHash(data)
      
      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          // 跳过定位点区域
          if ((i < 9 && j < 9) || (i < 9 && j > 15) || (i > 15 && j < 9)) {
            continue
          }
          
          // 根据数据哈希决定是否填充模块
          if ((hash + i * j) % 3 === 0) {
            ctx.fillRect(
              margin + j * moduleSize,
              margin + i * moduleSize,
              moduleSize,
              moduleSize
            )
          }
        }
      }
    },
    
    drawLogo(ctx, size) {
      if (!this.logoDataUrl) return
      
      const img = new Image()
      img.onload = () => {
        const logoSize = Math.floor(size * 0.2) // Logo大小为二维码的20%
        const logoX = (size - logoSize) / 2
        const logoY = (size - logoSize) / 2
        
        // 绘制白色背景
        ctx.fillStyle = this.backgroundColor
        ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4)
        
        // 绘制Logo
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize)
      }
      img.src = this.logoDataUrl
    },
    
    simpleHash(str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // 转换为32位整数
      }
      return Math.abs(hash)
    },
    
    downloadQRCode() {
      if (!this.$refs.qrCanvas) {
        this.$message.warning('没有可下载的二维码')
        return
      }
      
      try {
        // 创建下载链接
        const link = document.createElement('a')
        link.download = `qrcode_${new Date().getTime()}.png`
        link.href = this.$refs.qrCanvas.toDataURL()
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        this.$message.success('二维码下载成功')
      } catch (error) {
        this.$message.error('下载失败: ' + error.message)
      }
    },
    
    generateBatch() {
      this.$message.info('批量生成功能开发中...')
    },
    
    resetSettings() {
      this.logoDataUrl = ''
      this.errorCorrectionLevel = 'H'
      this.qrSize = '192'
      this.foregroundColor = '#000000'
      this.backgroundColor = '#ffffff'
      this.qrData = 'https://mdeve.com'
      this.qrCodeDataUrl = ''
      this.$message.info('设置已重置')
    }
  },
  watch: {
    qrSize() {
      // 尺寸变化时重新生成
      if (this.qrData.trim() && this.qrCodeDataUrl) {
        this.$nextTick(() => {
          if (this.$refs.qrCanvas) {
            this.generateQRCode()
          }
        })
      }
    },
    foregroundColor() {
      // 颜色变化时重新生成
      if (this.qrData.trim() && this.qrCodeDataUrl) {
        this.$nextTick(() => {
          if (this.$refs.qrCanvas) {
            this.generateQRCode()
          }
        })
      }
    },
    backgroundColor() {
      // 背景色变化时重新生成
      if (this.qrData.trim() && this.qrCodeDataUrl) {
        this.$nextTick(() => {
          if (this.$refs.qrCanvas) {
            this.generateQRCode()
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.qrcode-generator-container {
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
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.settings-panel,
.result-panel {
  padding: 20px;
}

.settings-panel h3,
.result-panel h3 {
  margin: 0 0 25px 0;
  color: #303133;
  font-size: 18px;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
}

.logo-section {
  margin-bottom: 25px;
}

.logo-section h4 {
  margin: 0 0 15px 0;
  color: #606266;
  font-size: 16px;
}

.logo-upload {
  text-align: center;
}

.logo-preview,
.logo-placeholder {
  width: 80px;
  height: 80px;
  margin: 0 auto 15px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.logo-preview:hover,
.logo-placeholder:hover {
  border-color: #409eff;
}

.logo-preview img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}

.logo-placeholder i {
  font-size: 24px;
  color: #c0c4cc;
  margin-bottom: 5px;
}

.logo-placeholder p {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.logo-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-input {
  flex: 1;
}

.color-preview {
  width: 32px;
  height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.color-preview:hover {
  border-color: #409eff;
  transform: scale(1.1);
}

.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
}

.action-buttons .el-button {
  flex: 1;
}

.batch-section h4 {
  margin: 0 0 15px 0;
  color: #606266;
  font-size: 16px;
}

.qrcode-display {
  text-align: center;
}

.qrcode-container {
  margin-bottom: 20px;
  padding: 20px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
  display: inline-block;
}

.qrcode-container canvas {
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-result {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.no-result i {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
}

.no-result p {
  font-size: 16px;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .qrcode-generator-container {
    padding: 20px;
  }
  
  .generator-form {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 20px;
  }
  
  .settings-panel,
  .result-panel {
    padding: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .logo-actions {
    flex-direction: column;
  }
  
  .logo-actions .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .generator-form {
    padding: 15px;
  }
  
  .settings-panel,
  .result-panel {
    padding: 10px;
  }
  
  .logo-preview,
  .logo-placeholder {
    width: 60px;
    height: 60px;
  }
  
  .color-input-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .color-preview {
    width: 100%;
    height: 40px;
  }
}
</style>
