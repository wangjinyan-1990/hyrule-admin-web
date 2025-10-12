<template>
  <div class="text-encoder-container">
    <div class="encoder-header">
      <h2>文本在线编码转换</h2>
      <p>支持多种编码格式的在线转换</p>
    </div>
    
    <div class="encoder-form">
      <!-- 主文本区域 -->
      <div class="text-area-section">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="12"
          placeholder="请输入要转换的文本内容..."
          class="main-textarea"
          @input="handleInput"
        />
      </div>
      
      <!-- 编码转换按钮 -->
      <div class="encoding-buttons">
        <el-button type="primary" @click="base64Encode" :disabled="!inputText.trim()">
          Base64 Encode
        </el-button>
        <el-button type="primary" @click="base64Decode" :disabled="!inputText.trim()">
          Base64 Decode
        </el-button>
        <el-button type="primary" @click="unicodeEncode" :disabled="!inputText.trim()">
          Unicode Encode
        </el-button>
        <el-button type="primary" @click="unicodeDecode" :disabled="!inputText.trim()">
          Unicode Decode
        </el-button>
        <el-button type="primary" @click="urlEncode" :disabled="!inputText.trim()">
          Url Encode
        </el-button>
        <el-button type="primary" @click="urlDecode" :disabled="!inputText.trim()">
          Url Decode
        </el-button>
        <el-button type="primary" @click="asciiEncode" :disabled="!inputText.trim()">
          ASCII Encode
        </el-button>
        <el-button type="primary" @click="asciiDecode" :disabled="!inputText.trim()">
          ASCII Decode
        </el-button>
        <el-button type="success" @click="md5Hash" :disabled="!inputText.trim()">
          MD5
        </el-button>
      </div>
      
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="danger" @click="clearText">
          清除
        </el-button>
        <el-button type="success" @click="downloadResult" :disabled="!inputText.trim()">
          下载
        </el-button>
      </div>
      
      <!-- 使用说明 -->
      <div class="instructions-section">
        <h4>注:</h4>
        <div class="instruction-item">
          <span class="instruction-text">
            1、ASCII码还原时,需要用半角逗号分隔,如"72,69,76,76,79,32,119,111,114,100"还原结果为"HELLO word"。
          </span>
          <el-button type="text" size="small" @click="tryAsciiExample" class="try-button">
            我要尝试
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextEncoder',
  data() {
    return {
      inputText: ''
    }
  },
  methods: {
    handleInput(value) {
      this.inputText = value
    },
    
    base64Encode() {
      try {
        const encoded = btoa(unescape(encodeURIComponent(this.inputText)))
        this.inputText = encoded
        this.$message({
          message: 'Base64编码完成',
          type: 'success',
          duration: 1500
        })
      } catch (error) {
        this.$message({
          message: 'Base64编码失败: ' + error.message,
          type: 'error',
          duration: 1500
        })
      }
    },
    
    base64Decode() {
      try {
        const decoded = decodeURIComponent(escape(atob(this.inputText)))
        this.inputText = decoded
        this.$message({
          message: 'Base64解码完成',
          type: 'success',
          duration: 1500
        })
      } catch (error) {
        this.$message({
          message: 'Base64解码失败: ' + error.message,
          type: 'error',
          duration: 1500
        })
      }
    },
    
    unicodeEncode() {
      try {
        let encoded = ''
        for (let i = 0; i < this.inputText.length; i++) {
          encoded += '\\u' + this.inputText.charCodeAt(i).toString(16).padStart(4, '0')
        }
        this.inputText = encoded
        this.$message({
          message: 'Unicode编码完成',
          type: 'success',
          duration: 1500
        })
      } catch (error) {
        this.$message({
          message: 'Unicode编码失败: ' + error.message,
          type: 'error',
          duration: 1500
        })
      }
    },
    
    unicodeDecode() {
      try {
        const decoded = this.inputText.replace(/\\u[\dA-Fa-f]{4}/g, function(match) {
          return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16))
        })
        this.inputText = decoded
        this.$message({
          message: 'Unicode解码完成',
          type: 'success',
          duration: 1500
        })
      } catch (error) {
        this.$message({
          message: 'Unicode解码失败: ' + error.message,
          type: 'error',
          duration: 1500
        })
      }
    },
    
    urlEncode() {
      try {
        const encoded = encodeURIComponent(this.inputText)
        this.inputText = encoded
        this.$message({
          message: 'URL编码完成',
          type: 'success',
          duration: 1500
        })
      } catch (error) {
        this.$message({
          message: 'URL编码失败: ' + error.message,
          type: 'error',
          duration: 1500
        })
      }
    },
    
    urlDecode() {
      try {
        const decoded = decodeURIComponent(this.inputText)
        this.inputText = decoded
        this.$message({
          message: 'URL解码完成',
          type: 'success',
          duration: 1500
        })
      } catch (error) {
        this.$message({
          message: 'URL解码失败: ' + error.message,
          type: 'error',
          duration: 1500
        })
      }
    },
    
    asciiEncode() {
      try {
        let encoded = ''
        for (let i = 0; i < this.inputText.length; i++) {
          if (i > 0) encoded += ','
          encoded += this.inputText.charCodeAt(i)
        }
        this.inputText = encoded
        this.$message({
          message: 'ASCII编码完成',
          type: 'success',
          duration: 1500
        })
      } catch (error) {
        this.$message({
          message: 'ASCII编码失败: ' + error.message,
          type: 'error',
          duration: 1500
        })
      }
    },
    
    asciiDecode() {
      try {
        const codes = this.inputText.split(',')
        let decoded = ''
        for (let i = 0; i < codes.length; i++) {
          const code = parseInt(codes[i].trim())
          if (isNaN(code)) {
            throw new Error('无效的ASCII码: ' + codes[i])
          }
          decoded += String.fromCharCode(code)
        }
        this.inputText = decoded
        this.$message({
          message: 'ASCII解码完成',
          type: 'success',
          duration: 1500
        })
      } catch (error) {
        this.$message({
          message: 'ASCII解码失败: ' + error.message,
          type: 'error',
          duration: 1500
        })
      }
    },
    
    md5Hash() {
      // 简单的MD5实现（实际项目中建议使用crypto-js库）
      try {
        const hash = this.simpleMD5(this.inputText)
        this.inputText = hash
        this.$message({
          message: 'MD5哈希完成',
          type: 'success',
          duration: 1500
        })
      } catch (error) {
        this.$message({
          message: 'MD5哈希失败: ' + error.message,
          type: 'error',
          duration: 1500
        })
      }
    },
    
    simpleMD5(string) {
      // 这是一个简化的MD5实现，实际项目中建议使用专业的MD5库
      function rotateLeft(value, amount) {
        return (value << amount) | (value >>> (32 - amount))
      }
      
      function addUnsigned(x, y) {
        const x8 = x & 0x80000000
        const y8 = y & 0x80000000
        const x4 = x & 0x40000000
        const y4 = y & 0x40000000
        const result = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF)
        if (x4 & y4) {
          return result ^ 0x80000000 ^ x8 ^ y8
        }
        if (x4 | y4) {
          if (result & 0x40000000) {
            return result ^ 0xC0000000 ^ x8 ^ y8
          } else {
            return result ^ 0x40000000 ^ x8 ^ y8
          }
        } else {
          return result ^ x8 ^ y8
        }
      }
      
      function md5cmn(q, a, b, x, s, t) {
        return addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, q), addUnsigned(x, t)), s), b)
      }
      
      function md5ff(a, b, c, d, x, s, t) {
        return md5cmn((b & c) | ((~b) & d), a, b, x, s, t)
      }
      
      function md5gg(a, b, c, d, x, s, t) {
        return md5cmn((b & d) | (c & (~d)), a, b, x, s, t)
      }
      
      function md5hh(a, b, c, d, x, s, t) {
        return md5cmn(b ^ c ^ d, a, b, x, s, t)
      }
      
      function md5ii(a, b, c, d, x, s, t) {
        return md5cmn(c ^ (b | (~d)), a, b, x, s, t)
      }
      
      function coreMD5(x) {
        x[x.length >> 5] |= 0x80 << ((x.length) % 32)
        x[(((x.length + 64) >>> 9) << 4) + 14] = x.length
        
        let a = 1732584193
        let b = -271733879
        let c = -1732584194
        let d = 271733878
        
        for (let i = 0; i < x.length; i += 16) {
          const olda = a
          const oldb = b
          const oldc = c
          const oldd = d
          
          a = md5ff(a, b, c, d, x[i + 0], 7, -680876936)
          d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
          c = md5ff(c, d, a, b, x[i + 2], 17, 606105819)
          b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330)
          a = md5ff(a, b, c, d, x[i + 4], 7, -176418897)
          d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426)
          c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341)
          b = md5ff(b, c, d, a, x[i + 7], 22, -45705983)
          a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416)
          d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417)
          c = md5ff(c, d, a, b, x[i + 10], 17, -42063)
          b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162)
          a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682)
          d = md5ff(d, a, b, c, x[i + 13], 12, -40341101)
          c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290)
          b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329)
          
          a = md5gg(a, b, c, d, x[i + 1], 5, -165796510)
          d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632)
          c = md5gg(c, d, a, b, x[i + 11], 14, 643717713)
          b = md5gg(b, c, d, a, x[i + 0], 20, -373897302)
          a = md5gg(a, b, c, d, x[i + 5], 5, -701558691)
          d = md5gg(d, a, b, c, x[i + 10], 9, 38016083)
          c = md5gg(c, d, a, b, x[i + 15], 14, -660478335)
          b = md5gg(b, c, d, a, x[i + 4], 20, -405537848)
          a = md5gg(a, b, c, d, x[i + 9], 5, 568446438)
          d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690)
          c = md5gg(c, d, a, b, x[i + 3], 14, -187363961)
          b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501)
          a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467)
          d = md5gg(d, a, b, c, x[i + 2], 9, -51403784)
          c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473)
          b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734)
          
          a = md5hh(a, b, c, d, x[i + 5], 4, -378558)
          d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463)
          c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562)
          b = md5hh(b, c, d, a, x[i + 14], 23, -35309556)
          a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060)
          d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353)
          c = md5hh(c, d, a, b, x[i + 7], 16, -155497632)
          b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640)
          a = md5hh(a, b, c, d, x[i + 13], 4, 681279174)
          d = md5hh(d, a, b, c, x[i + 0], 11, -358537222)
          c = md5hh(c, d, a, b, x[i + 3], 16, -722521979)
          b = md5hh(b, c, d, a, x[i + 6], 23, 76029189)
          a = md5hh(a, b, c, d, x[i + 9], 4, -640364487)
          d = md5hh(d, a, b, c, x[i + 12], 11, -421815835)
          c = md5hh(c, d, a, b, x[i + 15], 16, 530742520)
          b = md5hh(b, c, d, a, x[i + 2], 23, -995338651)
          
          a = md5ii(a, b, c, d, x[i + 0], 6, -198630844)
          d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415)
          c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905)
          b = md5ii(b, c, d, a, x[i + 5], 21, -57434055)
          a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571)
          d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606)
          c = md5ii(c, d, a, b, x[i + 10], 15, -1051523)
          b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799)
          a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359)
          d = md5ii(d, a, b, c, x[i + 15], 10, -30611744)
          c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380)
          b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649)
          a = md5ii(a, b, c, d, x[i + 4], 6, -145523070)
          d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379)
          c = md5ii(c, d, a, b, x[i + 2], 15, 718787259)
          b = md5ii(b, c, d, a, x[i + 9], 21, -343485551)
          
          a = addUnsigned(a, olda)
          b = addUnsigned(b, oldb)
          c = addUnsigned(c, oldc)
          d = addUnsigned(d, oldd)
        }
        
        const temp = (a >>> 0).toString(16) + (b >>> 0).toString(16) + (c >>> 0).toString(16) + (d >>> 0).toString(16)
        return temp.toLowerCase()
      }
      
      function str2binl(str) {
        const bin = []
        const mask = (1 << 8) - 1
        for (let i = 0; i < str.length * 8; i += 8) {
          bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32)
        }
        return bin
      }
      
      return coreMD5(str2binl(string))
    },
    
    clearText() {
      this.inputText = ''
      this.$message({
        message: '已清空文本内容',
        type: 'info',
        duration: 1500
      })
    },
    
    downloadResult() {
      if (!this.inputText.trim()) {
        this.$message({
          message: '没有内容可下载',
          type: 'warning',
          duration: 1500
        })
        return
      }
      
      try {
        const blob = new Blob([this.inputText], { type: 'text/plain;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `encoded_text_${new Date().getTime()}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        this.$message({
          message: '文件下载成功',
          type: 'success',
          duration: 1500
        })
      } catch (error) {
        this.$message({
          message: '文件下载失败: ' + error.message,
          type: 'error',
          duration: 1500
        })
      }
    },
    
    tryAsciiExample() {
      this.inputText = '72,69,76,76,79,32,119,111,114,100'
      this.$message({
        message: '已填入ASCII解码示例，点击"ASCII Decode"按钮查看效果',
        type: 'info',
        duration: 1500
      })
    }
  }
}
</script>

<style scoped>
.text-encoder-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.encoder-header {
  text-align: center;
  margin-bottom: 40px;
}

.encoder-header h2 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 10px 0;
}

.encoder-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.encoder-form {
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.text-area-section {
  margin-bottom: 25px;
}

.main-textarea {
  width: 100%;
}

.main-textarea >>> .el-textarea__inner {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.main-textarea >>> .el-textarea__inner:focus {
  border-color: #409eff;
  outline: none;
}

.encoding-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.encoding-buttons .el-button {
  min-width: 120px;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 25px;
}

.action-buttons .el-button {
  min-width: 100px;
}

.instructions-section {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.instructions-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.instruction-text {
  flex: 1;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.try-button {
  color: #409eff;
  font-size: 13px;
  padding: 5px 10px;
}

.try-button:hover {
  color: #66b1ff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .text-encoder-container {
    padding: 20px;
  }
  
  .encoder-form {
    padding: 20px;
  }
  
  .encoding-buttons {
    flex-direction: column;
  }
  
  .encoding-buttons .el-button {
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
  
  .instruction-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .try-button {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .encoding-buttons .el-button {
    font-size: 12px;
    min-width: 100px;
  }
}
</style>
