<template>
  <div class="toolset-container">
    <div class="tools-grid">
      <el-button type="primary" class="tool-button primary-tool" @click="handleToolClick('JSON格式化')">
        JSON格式化
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('字符串长度计算')">
        字符串长度计算
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('字符串出现次数统计')">
        字符串出现次数统计
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('字符出现次数统计')">
        字符出现次数统计
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('文本去除重复行')">
        文本去除重复行
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('英文字母大小写转换')">
        英文字母大小写转换
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('随机密码生成')">
        随机密码生成
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('文本在线编码转换')">
        文本在线编码转换
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('图片base64编码')">
        图片base64编码
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('base64还原图片')">
        base64还原图片
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('二维码在线生成')">
        二维码在线生成
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('RGB颜色参考')">
        RGB颜色参考
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('分解质因数')">
        分解质因数
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('身份证号生成')">
        身份证号生成
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('图片文字识别')">
        图片文字识别
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('文本对比合并')">
        文本对比合并
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('人民币大写转换')">
        人民币大写转换
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('颜色空间转换')">
        颜色空间转换
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('进制转换器')">
        进制转换器
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('表达式计算器')">
        表达式计算器
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('贷款计算器')">
        贷款计算器
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('MD5加密')">
        MD5加密
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('天数计算')">
        天数计算
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('crontab执行时间计算')">
        crontab执行时间计算
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('图片压缩')">
        图片压缩
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('pdf转doc')">
        pdf转doc
      </el-button>
      <el-button type="text" class="tool-button" @click="handleToolClick('网络策略清单加工')">
        网络策略清单加工
      </el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: "toolset",
  methods: {
    handleToolClick(toolName) {
      console.log('点击工具:', toolName)
      // 根据工具名称进行不同的处理
      switch (toolName) {
        case '人民币大写转换':
          this.openRmbConverter()
          break
        case '英文字母大小写转换':
          this.openTextCaseConverter()
          break
        case 'JSON格式化':
          this.openJsonFormatter()
          break
        case '字符串长度计算':
          this.openStringLengthCalculator()
          break
        case '字符出现次数统计':
          this.openCharacterCountAnalyzer()
          break
        case '字符串出现次数统计':
          this.openStringCountAnalyzer()
          break
        case '颜色空间转换':
          this.openColorSpaceConverter()
          break
        case '进制转换器':
          this.openBaseConverter()
          break
        case '随机密码生成':
          this.openPasswordGenerator()
          break
        case '文本在线编码转换':
          this.openTextEncoder()
          break
        case '图片base64编码':
          this.openImageBase64Encoder()
          break
        case 'base64还原图片':
          this.openBase64ImageDecoder()
          break
        case '二维码在线生成':
          this.openQrCodeGenerator()
          break
        case '身份证号生成':
          this.openIdCardGenerator()
          break
        case '图片文字识别':
          this.openImageTextRecognition()
          break
        case 'RGB颜色参考':
          this.openRgbColorReference()
          break
        case '分解质因数':
          this.openPrimeFactorization()
          break
        case '文本对比合并':
          this.openTextDiffComparator()
          break
        case '文本去除重复行':
          this.openTextDeduplicator()
          break
        case '表达式计算器':
          this.openExpressionCalculator()
          break
        case '贷款计算器':
          this.openLoanCalculator()
          break
        case 'MD5加密':
          this.openMd5Tool()
          break
        case 'crontab执行时间计算':
          this.openCrontabCalculator()
          break
        case '天数计算':
          this.openDateCalculator()
          break
        case '图片压缩':
          this.openImageCompressor()
          break
        case 'pdf转doc':
          this.openPdfToDocConverter()
          break
        case '网络策略清单加工':
          this.networkPolicyList()
          break
        default:
          this.$message.info(`${toolName} 功能开发中...`)
      }
    },
    openRmbConverter() {
      // 在当前页面中显示人民币转换组件
      this.$router.push({
        name: 'rmbConverter',
        params: { tool: 'rmb' }
      })
    },

    openTextCaseConverter() {
      // 跳转到英文字母大小写转换组件
      this.$router.push({
        name: 'textCaseConverter',
        params: { tool: 'textcase' }
      })
    },

    openJsonFormatter() {
      // 跳转到JSON格式化组件
      this.$router.push({
        name: 'jsonFormatter',
        params: { tool: 'json' }
      })
    },

    openStringLengthCalculator() {
      // 跳转到字符串长度计算组件
      this.$router.push({
        name: 'stringLengthCalculator',
        params: { tool: 'stringlength' }
      })
    },

    openCharacterCountAnalyzer() {
      // 跳转到字符出现次数统计组件
      this.$router.push({
        name: 'characterCountAnalyzer',
        params: { tool: 'charactercount' }
      })
    },

    openStringCountAnalyzer() {
      // 跳转到字符串出现次数统计组件
      this.$router.push({
        name: 'stringCountAnalyzer',
        params: { tool: 'stringcount' }
      })
    },

    openColorSpaceConverter() {
      // 跳转到颜色空间转换组件
      this.$router.push({
        name: 'colorSpaceConverter',
        params: { tool: 'colorspace' }
      })
    },

    openBaseConverter() {
      // 跳转到进制转换器组件
      this.$router.push({
        name: 'baseConverter',
        params: { tool: 'baseconverter' }
      })
    },

    openPasswordGenerator() {
      // 跳转到随机密码生成组件
      this.$router.push({
        name: 'passwordGenerator',
        params: { tool: 'passwordgenerator' }
      })
    },

    openTextEncoder() {
      // 跳转到文本在线编码转换组件
      this.$router.push({
        name: 'textEncoder',
        params: { tool: 'textencoder' }
      })
    },

    openImageBase64Encoder() {
      // 跳转到图片base64编码组件
      this.$router.push({
        name: 'imageBase64Encoder',
        params: { tool: 'imagebase64' }
      })
    },

    openBase64ImageDecoder() {
      // 跳转到base64还原图片组件
      this.$router.push({
        name: 'base64ImageDecoder',
        params: { tool: 'base64decoder' }
      })
    },

    openQrCodeGenerator() {
      // 跳转到二维码在线生成组件
      this.$router.push({
        name: 'qrCodeGenerator',
        params: { tool: 'qrcode' }
      })
    },
    openIdCardGenerator() {
      // 跳转到身份证号生成组件
      this.$router.push({
        name: 'idCardGenerator',
        params: { tool: 'idCard' }
      })
    },
    openImageTextRecognition() {
      // 跳转到图片文字识别组件
      this.$router.push({
        name: 'imageTextRecognition',
        params: { tool: 'ocr' }
      })
    },
    openRgbColorReference() {
      // 跳转到RGB颜色参考组件
      this.$router.push({
        name: 'rgbColorReference',
        params: { tool: 'rgb' }
      })
    },
    openPrimeFactorization() {
      // 跳转到分解质因数组件
      this.$router.push({
        name: 'primeFactorization',
        params: { tool: 'prime' }
      })
    },

    openTextDiffComparator() {
      // 跳转到文本对比合并组件
      this.$router.push({
        name: 'textDiffComparator',
        params: { tool: 'textdiff' }
      })
    },

    openTextDeduplicator() {
      // 跳转到文本去重组件
      this.$router.push({
        name: 'textDeduplicator',
        params: { tool: 'textdedup' }
      })
    },

    openExpressionCalculator() {
      // 跳转到表达式计算器组件
      this.$router.push({
        name: 'expressionCalculator',
        params: { tool: 'expression' }
      })
    },

    openLoanCalculator() {
      // 跳转到贷款计算器组件
      this.$router.push({
        name: 'loanCalculator',
        params: { tool: 'loan' }
      })
    },

    openMd5Tool() {
      // 跳转到MD5加解密工具组件
      this.$router.push({
        name: 'md5Tool',
        params: { tool: 'md5' }
      })
    },

    openCrontabCalculator() {
      // 跳转到crontab执行时间计算组件
      this.$router.push({
        name: 'crontabCalculator',
        params: { tool: 'crontab' }
      })
    },

    openDateCalculator() {
      // 跳转到天数计算组件
      this.$router.push({
        name: 'dateCalculator',
        params: { tool: 'datecalc' }
      })
    },

    openImageCompressor() {
      // 跳转到图片压缩组件
      this.$router.push({
        name: 'imageCompressor',
        params: { tool: 'imagecompress' }
      })
    },

    openPdfToDocConverter() {
      // 跳转到PDF转DOC转换器组件
      this.$router.push({
        name: 'pdfToDocConverter',
        params: { tool: 'pdftodoc' }
      })
    },

    networkPolicyList() {
      // 网络策略清单加工
      this.$router.push({
        name: 'networkPolicyList',
        params: { tool: 'networkPolicyList' }
      })
    }
  }
}
</script>

<style scoped>
.toolset-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.toolset-header {
  text-align: center;
  margin-bottom: 40px;
}

.toolset-header h1 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 10px 0;
}

.toolset-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.tools-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  padding: 0 10px;
}

.tool-button {
  min-width: 140px;
  height: 36px;
  font-size: 13px;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-button.primary-tool {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
  font-weight: 600;
}

.tool-button.primary-tool:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.tool-button:not(.primary-tool) {
  color: #409eff;
  background-color: transparent;
  border: none;
  padding: 0 16px;
}

.tool-button:not(.primary-tool):hover {
  color: #66b1ff;
  background-color: rgba(64, 158, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }

  .tool-button {
    min-width: 120px;
    font-size: 12px;
    height: 32px;
  }
}

@media (max-width: 768px) {
  .toolset-container {
    padding: 20px;
  }

  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
    padding: 0 5px;
  }

  .tool-button {
    min-width: 100px;
    font-size: 11px;
    height: 30px;
  }
}

@media (max-width: 480px) {
  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 6px;
  }

  .tool-button {
    min-width: 90px;
    font-size: 10px;
    height: 28px;
    padding: 0 8px;
  }
}
</style>
