<template>
  <div class="color-converter-container">
    <div class="converter-header">
      <h2>颜色空间转换</h2>
      <p>在不同颜色格式之间进行转换</p>
    </div>
    
    <div class="converter-form">
      <!-- 转换输入区域 -->
      <div class="conversion-section">
        <div class="conversion-group">
          <h3>HEX颜色转换</h3>
          <div class="input-row">
            <label class="input-label">录入颜色:</label>
            <el-input
              v-model="hexInput"
              placeholder="#009a61"
              class="color-input"
              @input="handleHexInput"
            />
            <div class="color-preview" :style="{ backgroundColor: currentColor }"></div>
            <el-button type="primary" @click="convertFromHex" :disabled="!hexInput.trim()">
              转换
            </el-button>
          </div>
        </div>
        
        <div class="conversion-group">
          <h3>RGB颜色转换</h3>
          <div class="input-row">
            <label class="input-label">录入颜色:</label>
            <el-input
              v-model="rgbInput"
              placeholder="rgb(0,154,97)"
              class="color-input"
              @input="handleRgbInput"
            />
            <div class="color-preview" :style="{ backgroundColor: currentColor }"></div>
            <el-button type="primary" @click="convertFromRgb" :disabled="!rgbInput.trim()">
              转换
            </el-button>
          </div>
        </div>
        
        <div class="conversion-group">
          <h3>RGBA颜色转换</h3>
          <div class="input-row">
            <label class="input-label">录入颜色:</label>
            <el-input
              v-model="rgbaInput"
              placeholder="rgba(0,154,97,1)"
              class="color-input"
              @input="handleRgbaInput"
            />
            <div class="color-preview" :style="{ backgroundColor: currentColor }"></div>
            <el-button type="primary" @click="convertFromRgba" :disabled="!rgbaInput.trim()">
              转换
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 颜色信息表格 -->
      <div class="color-info-section" v-if="colorInfo">
        <h3>颜色信息</h3>
        
        <div class="color-block" :style="{ backgroundColor: currentColor }"></div>
        
        <div class="color-table">
          <div class="table-row">
            <div class="table-cell label-cell">Hex-16位</div>
            <div class="table-cell value-cell" @click="copyToClipboard('Hex-16位', colorInfo.hex16)">
              {{ colorInfo.hex16 }}
            </div>
          </div>
          <div class="table-row">
            <div class="table-cell label-cell">Hex-8位</div>
            <div class="table-cell value-cell" @click="copyToClipboard('Hex-8位', colorInfo.hex8)">
              {{ colorInfo.hex8 }}
            </div>
          </div>
          <div class="table-row">
            <div class="table-cell label-cell">Rgb</div>
            <div class="table-cell value-cell" @click="copyToClipboard('Rgb', colorInfo.rgb)">
              {{ colorInfo.rgb }}
            </div>
          </div>
          <div class="table-row">
            <div class="table-cell label-cell">Rgba</div>
            <div class="table-cell value-cell" @click="copyToClipboard('Rgba', colorInfo.rgba)">
              {{ colorInfo.rgba }}
            </div>
          </div>
          <div class="table-row">
            <div class="table-cell label-cell">Hsl</div>
            <div class="table-cell value-cell" @click="copyToClipboard('Hsl', colorInfo.hsl)">
              {{ colorInfo.hsl }}
            </div>
          </div>
          <div class="table-row">
            <div class="table-cell label-cell">Hsv</div>
            <div class="table-cell value-cell" @click="copyToClipboard('Hsv', colorInfo.hsv)">
              {{ colorInfo.hsv }}
            </div>
          </div>
          <div class="table-row">
            <div class="table-cell label-cell">name</div>
            <div class="table-cell value-cell" @click="copyToClipboard('name', colorInfo.name)">
              {{ colorInfo.name }}
            </div>
          </div>
        </div>
        
        <div class="tip-text">
          <i class="el-icon-info"></i>
          点击表格行可以复制颜色值
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorSpaceConverter',
  data() {
    return {
      hexInput: '',
      rgbInput: '',
      rgbaInput: '',
      currentColor: '#009a61',
      colorInfo: null
    }
  },
  methods: {
    handleHexInput(value) {
      this.hexInput = value
      this.parseAndConvert()
    },
    
    handleRgbInput(value) {
      this.rgbInput = value
      this.parseAndConvert()
    },
    
    handleRgbaInput(value) {
      this.rgbaInput = value
      this.parseAndConvert()
    },
    
    convertFromHex() {
      this.parseAndConvert()
    },
    
    convertFromRgb() {
      this.parseAndConvert()
    },
    
    convertFromRgba() {
      this.parseAndConvert()
    },
    
    parseAndConvert() {
      let r, g, b, a = 1
      
      // 尝试解析HEX格式
      if (this.hexInput.trim()) {
        const hex = this.parseHex(this.hexInput.trim())
        if (hex) {
          r = hex.r
          g = hex.g
          b = hex.b
          a = hex.a || 1
        }
      }
      
      // 尝试解析RGB格式
      if (this.rgbInput.trim()) {
        const rgb = this.parseRgb(this.rgbInput.trim())
        if (rgb) {
          r = rgb.r
          g = rgb.g
          b = rgb.b
          a = 1
        }
      }
      
      // 尝试解析RGBA格式
      if (this.rgbaInput.trim()) {
        const rgba = this.parseRgba(this.rgbaInput.trim())
        if (rgba) {
          r = rgba.r
          g = rgba.g
          b = rgba.b
          a = rgba.a
        }
      }
      
      // 如果有有效的颜色值，进行转换
      if (r !== undefined && g !== undefined && b !== undefined) {
        this.currentColor = `rgba(${r}, ${g}, ${b}, ${a})`
        this.generateColorInfo(r, g, b, a)
      }
    },
    
    parseHex(hex) {
      // 移除#号
      hex = hex.replace('#', '')
      
      // 支持3位、6位、8位hex
      if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('')
      }
      
      if (hex.length === 6) {
        const r = parseInt(hex.substr(0, 2), 16)
        const g = parseInt(hex.substr(2, 2), 16)
        const b = parseInt(hex.substr(4, 2), 16)
        return { r, g, b }
      }
      
      if (hex.length === 8) {
        const r = parseInt(hex.substr(0, 2), 16)
        const g = parseInt(hex.substr(2, 2), 16)
        const b = parseInt(hex.substr(4, 2), 16)
        const a = parseInt(hex.substr(6, 2), 16) / 255
        return { r, g, b, a }
      }
      
      return null
    },
    
    parseRgb(rgb) {
      const match = rgb.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i)
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3])
        }
      }
      return null
    },
    
    parseRgba(rgba) {
      const match = rgba.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/i)
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3]),
          a: parseFloat(match[4])
        }
      }
      return null
    },
    
    generateColorInfo(r, g, b, a = 1) {
      // 转换为HEX
      const hex16 = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
      const alpha = Math.round(a * 255).toString(16).padStart(2, '0')
      const hex8 = `${hex16}${alpha}`
      
      // 转换为HSL
      const hsl = this.rgbToHsl(r, g, b)
      
      // 转换为HSV
      const hsv = this.rgbToHsv(r, g, b)
      
      // 获取颜色名称
      const name = this.getColorName(r, g, b)
      
      this.colorInfo = {
        hex16: hex16,
        hex8: hex8,
        rgb: `rgb(${r}, ${g}, ${b})`,
        rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
        hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`,
        hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s * 100)}%, ${Math.round(hsv.v * 100)}%)`,
        name: name
      }
    },
    
    rgbToHsl(r, g, b) {
      r /= 255
      g /= 255
      b /= 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h, s, l = (max + min) / 2
      
      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }
      
      return { h: h * 360, s, l }
    },
    
    rgbToHsv(r, g, b) {
      r /= 255
      g /= 255
      b /= 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const diff = max - min
      
      let h = 0
      if (diff !== 0) {
        if (max === r) h = ((g - b) / diff) % 6
        else if (max === g) h = (b - r) / diff + 2
        else h = (r - g) / diff + 4
      }
      
      h = Math.round(h * 60)
      if (h < 0) h += 360
      
      const s = max === 0 ? 0 : diff / max
      const v = max
      
      return { h, s, v }
    },
    
    getColorName(r, g, b) {
      // 简单的颜色名称匹配
      const colors = {
        'red': [255, 0, 0],
        'green': [0, 255, 0],
        'blue': [0, 0, 255],
        'white': [255, 255, 255],
        'black': [0, 0, 0],
        'yellow': [255, 255, 0],
        'cyan': [0, 255, 255],
        'magenta': [255, 0, 255],
        'gray': [128, 128, 128],
        'orange': [255, 165, 0],
        'purple': [128, 0, 128],
        'pink': [255, 192, 203],
        'brown': [165, 42, 42]
      }
      
      for (const [name, [cr, cg, cb]] of Object.entries(colors)) {
        if (Math.abs(r - cr) < 30 && Math.abs(g - cg) < 30 && Math.abs(b - cb) < 30) {
          return name
        }
      }
      
      return 'none'
    },
    
    copyToClipboard(type, value) {
      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(value).then(() => {
          this.$message.success(`${type}: ${value} 已复制到剪贴板`)
        }).catch(() => {
          this.fallbackCopy(value, type)
        })
      } else {
        this.fallbackCopy(value, type)
      }
    },
    
    fallbackCopy(text, type) {
      // 兼容旧浏览器的复制方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message.success(`${type}: ${text} 已复制到剪贴板`)
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textArea)
    }
  },
  mounted() {
    // 初始化默认颜色
    this.parseAndConvert()
  }
}
</script>

<style scoped>
.color-converter-container {
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
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.conversion-section {
  margin-bottom: 30px;
}

.conversion-group {
  margin-bottom: 25px;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: #fafafa;
}

.conversion-group h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.color-input {
  flex: 1;
  max-width: 200px;
}

.color-input >>> .el-input__inner {
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.color-preview {
  width: 24px;
  height: 24px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  flex-shrink: 0;
}

.color-info-section {
  margin-bottom: 30px;
}

.color-info-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
}

.color-block {
  width: 100%;
  height: 40px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 20px;
}

.color-table {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 20px;
}

.table-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  border-bottom: 1px solid #f0f0f0;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 12px 16px;
  font-size: 14px;
}

.label-cell {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  border-right: 1px solid #e4e7ed;
}

.value-cell {
  color: #303133;
  cursor: pointer;
  transition: background-color 0.3s;
  font-family: 'Courier New', monospace;
}

.value-cell:hover {
  background-color: #f0f9ff;
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
  .color-converter-container {
    padding: 20px;
  }
  
  .converter-form {
    padding: 20px;
  }
  
  .input-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .color-input {
    max-width: 100%;
    width: 100%;
  }
  
  .color-preview {
    align-self: flex-start;
  }
  
  .table-row {
    grid-template-columns: 100px 1fr;
  }
  
  .table-cell {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
