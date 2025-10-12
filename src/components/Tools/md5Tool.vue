<template>
  <div class="md5-tool-container">
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
      <div class="tool-header">
        <h2>MD5加解密工具</h2>
      </div>

      <!-- 输入区域 -->
      <div class="input-section">
        <div class="input-container">
          <el-input
            v-model="inputText"
            type="textarea"
            :rows="6"
            placeholder="请输入要加密的文本..."
            @input="onInputChange"
          ></el-input>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button 
          type="primary" 
          class="encrypt-btn"
          @click="encryptText"
          :disabled="!inputText.trim()"
        >
          加密
        </el-button>
      </div>

      <!-- 加密结果 -->
      <div class="result-section">
        <div class="result-item">
          <div class="result-label">16位小写</div>
          <div class="result-content">
            <span class="result-value">{{ results.md5_16_lower }}</span>
            <el-button size="mini" @click="copyResult('md5_16_lower')">复制</el-button>
          </div>
        </div>
        
        <div class="result-item">
          <div class="result-label">16位大写</div>
          <div class="result-content">
            <span class="result-value">{{ results.md5_16_upper }}</span>
            <el-button size="mini" @click="copyResult('md5_16_upper')">复制</el-button>
          </div>
        </div>
        
        <div class="result-item">
          <div class="result-label">32位小写</div>
          <div class="result-content">
            <span class="result-value">{{ results.md5_32_lower }}</span>
            <el-button size="mini" @click="copyResult('md5_32_lower')">复制</el-button>
          </div>
        </div>
        
        <div class="result-item">
          <div class="result-label">32位大写</div>
          <div class="result-content">
            <span class="result-value">{{ results.md5_32_upper }}</span>
            <el-button size="mini" @click="copyResult('md5_32_upper')">复制</el-button>
          </div>
        </div>
      </div>


      <!-- 常用密码字典 -->
      <div class="dictionary-section">
        <h3>常用密码MD5查询</h3>
        <div class="dictionary-grid">
          <div 
            v-for="(item, key) in commonPasswords" 
            :key="key"
            class="dictionary-item"
            @click="setInputText(key)"
          >
            <span class="password">{{ key }}</span>
            <span class="md5-hash">{{ item }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 使用原生 JavaScript 实现 MD5，避免依赖问题
function md5(string) {
  function md5cycle(x, k) {
    var a = x[0], b = x[1], c = x[2], d = x[3];
    
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }
  
  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  
  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  
  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  
  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  
  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }
  
  function md51(s) {
    var n = s.length,
        state = [1732584193, -271733879, -1732584194, 271733878], i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++)
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }
  
  function md5blk(s) {
    var md5blks = [], i;
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i)
        + (s.charCodeAt(i + 1) << 8)
        + (s.charCodeAt(i + 2) << 16)
        + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }
  
  var hex_chr = '0123456789abcdef'.split('');
  
  function rhex(n) {
    var s = '', j = 0;
    for (; j < 4; j++)
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
        + hex_chr[(n >> (j * 8)) & 0x0F];
    return s;
  }
  
  function hex(x) {
    for (var i = 0; i < x.length; i++)
      x[i] = rhex(x[i]);
    return x.join('');
  }
  
  function add32(a, b) {
    return (a + b) & 0xFFFFFFFF;
  }
  
  return hex(md51(string));
}

export default {
  name: 'Md5Tool',
  data() {
    return {
      inputText: '123456',
      results: {
        md5_16_lower: '',
        md5_16_upper: '',
        md5_32_lower: '',
        md5_32_upper: ''
      },
      commonPasswords: {
        '123456': 'e10adc3949ba59abbe56e057f20f883e',
        'password': '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        'admin': '21232f297a57a5a743894a0e4a801fc3',
        '123456789': '25d55ad283aa400af464c76d713c07ad',
        'qwerty': 'd8578edf8458ce06fbc5bb76a58c5ca4',
        'abc123': 'e99a18c428cb38d5f260853678922e03',
        '111111': '96e79218965eb72c92a549dd5a330112',
        '123123': '4297f44b13955235245b2497399d7a93',
        '000000': '670b14728ad9902aecba32e22fa4f6bd',
        'iloveyou': 'f25a2fc72690b780b2a14e110ef6acfc'
      }
    }
  },
  mounted() {
    // 页面加载时自动加密示例文本
    this.encryptText()
  },
  methods: {
    onInputChange() {
      // 输入变化时自动加密
      clearTimeout(this.encryptTimeout)
      this.encryptTimeout = setTimeout(() => {
        if (this.inputText.trim()) {
          this.encryptText()
        }
      }, 300)
    },

    // MD5加密
    encryptText() {
      if (!this.inputText.trim()) {
        this.$message({
          message: '请输入要加密的文本',
          type: 'warning',
          duration: 1500
        })
        return
      }

      try {
        const md5Hash = md5(this.inputText)
        const md5Hash16 = md5Hash.substring(8, 24)

        this.results = {
          md5_16_lower: md5Hash16.toLowerCase(),
          md5_16_upper: md5Hash16.toUpperCase(),
          md5_32_lower: md5Hash.toLowerCase(),
          md5_32_upper: md5Hash.toUpperCase()
        }

        this.$message({
          message: '加密完成',
          duration: 1500
        })
      } catch (error) {
        console.error('加密失败:', error)
        this.$message({
          message: '加密失败',
          type: 'error',
          duration: 1500
        })
      }
    },


    // 复制结果
    copyResult(type) {
      const value = this.results[type]
      if (!value) {
        this.$message({
          message: '没有可复制的内容',
          type: 'warning',
          duration: 1500
        })
        return
      }

      if (navigator.clipboard) {
        navigator.clipboard.writeText(value).then(() => {
          this.$message({
          message: '已复制到剪贴板',
          type: 'success',
          duration: 1500
        })
        }).catch(() => {
          this.fallbackCopyText(value)
        })
      } else {
        this.fallbackCopyText(value)
      }
    },


    // 备用复制方法
    fallbackCopyText(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message({
          message: '已复制到剪贴板',
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
    },

    // 设置输入文本
    setInputText(password) {
      this.inputText = password
      this.encryptText()
    },

    // 重置表单
    resetForm() {
      this.inputText = '123456'
      this.results = {
        md5_16_lower: '',
        md5_16_upper: '',
        md5_32_lower: '',
        md5_32_upper: ''
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
.md5-tool-container {
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
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.tool-header h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.input-section {
  margin-bottom: 20px;
}

.input-container .el-textarea__inner {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.action-section {
  text-align: center;
  margin-bottom: 30px;
}

.encrypt-btn {
  width: 100px;
  height: 40px;
  font-size: 16px;
}

.result-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
}

.result-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.result-value {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  color: #303133;
  word-break: break-all;
  flex: 1;
}


.dictionary-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dictionary-section h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.dictionary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.dictionary-item {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dictionary-item:hover {
  background: #e9ecef;
}

.password {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
  margin-bottom: 5px;
}

.md5-hash {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  color: #909399;
  word-break: break-all;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .result-content {
    width: 100%;
  }
  
  .dictionary-grid {
    grid-template-columns: 1fr;
  }
  
  .action-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
