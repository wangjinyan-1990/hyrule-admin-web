<template>
  <div class="text-preview-container">
    <div v-loading="loading" class="preview-container">
      <div v-if="loading" class="loading-container">
        <i class="el-icon-loading"></i>
        <p>正在加载文本内容...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <i class="el-icon-warning"></i>
        <p>文本加载失败</p>
        <el-button type="primary" @click="retryLoad">重新加载</el-button>
      </div>
      
      <div v-else-if="textContent" class="text-preview">
        <pre class="text-content">{{ textContent }}</pre>
      </div>
      
      <div v-else class="empty-container">
        <i class="el-icon-document"></i>
        <p>文件内容为空</p>
      </div>
    </div>
  </div>
</template>

<script>
import fileUploadService from '@/api/sys/common/fileUploadService'
import iconv from 'iconv-lite'

export default {
  name: 'ViewTextFile',
  props: {
    attachmentId: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    attachmentSize: {
      type: Number,
      default: 0
    },
    uploadDate: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: true,
      error: false,
      textContent: ''
    }
  },
  created() {
    this.loadTextContent()
  },
  methods: {
    // 加载文本内容
    async loadTextContent() {
      try {
        this.loading = true
        this.error = false
        
        console.log('开始加载文本文件:', {
          attachmentId: this.attachmentId,
          fileName: this.fileName
        })
        
        // 使用下载接口获取文本文件内容
        const response = await fileUploadService.downloadAttachment(this.attachmentId, this.fileName, false)
        
        console.log('文本文件下载响应:', response)
        
        if (response.success && response.data) {
          // response.data是axios响应对象，需要获取其中的data属性
          let blob
          if (response.data.data) {
            // 如果response.data.data存在，说明是嵌套的响应
            blob = response.data.data
          } else {
            // 否则直接使用response.data
            blob = response.data
          }
          
          // 将Blob数据转换为文本，尝试多种编码
          const text = await this.decodeBlobAsText(blob)
          this.textContent = text
          
          console.log('文本内容加载成功，长度:', text.length)
          console.log('文本内容预览:', text.substring(0, 200) + (text.length > 200 ? '...' : ''))
        } else {
          throw new Error(response.message || '文本文件加载失败')
        }
      } catch (error) {
        console.error('文本内容加载失败:', error)
        this.error = true
        this.$message.error('文本文件加载失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 解码Blob为文本，智能检测编码
    async decodeBlobAsText(blob) {
      try {
        // 将Blob转换为ArrayBuffer
        const arrayBuffer = await blob.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // 智能检测编码格式
        const detectedEncoding = this.detectEncoding(uint8Array)
        console.log(`智能检测到编码格式: ${detectedEncoding}`)
        
        // 根据检测结果优先尝试
        const encodingPriority = [detectedEncoding, 'utf-8', 'gbk', 'gb2312', 'big5']
        const uniqueEncodings = [...new Set(encodingPriority)] // 去重
        
        for (const encoding of uniqueEncodings) {
          try {
            const decoder = new TextDecoder(encoding, { fatal: false })
            const decodedText = decoder.decode(uint8Array)
            
            // 检查解码结果是否包含乱码
            if (decodedText && !this.hasGarbledText(decodedText)) {
              console.log(`使用智能检测的 ${encoding.toUpperCase()} 编码成功`)
              return decodedText
            } else {
              console.log(`${encoding.toUpperCase()} 编码仍有乱码，尝试其他编码`)
            }
          } catch (e) {
            console.log(`${encoding.toUpperCase()} 解码失败:`, e)
          }
        }
        
        // 如果智能检测失败，尝试所有可能的编码
        const allEncodings = [
          { name: 'utf-8', label: 'UTF-8' },
          { name: 'gbk', label: 'GBK' },
          { name: 'gb2312', label: 'GB2312' },
          { name: 'big5', label: 'Big5' },
          { name: 'windows-1252', label: 'Windows-1252' },
          { name: 'iso-8859-1', label: 'ISO-8859-1' }
        ]
        
        for (const encoding of allEncodings) {
          // 跳过已经尝试过的编码
          if (uniqueEncodings.includes(encoding.name)) {
            continue
          }
          
          try {
            const decoder = new TextDecoder(encoding.name, { fatal: false })
            const decodedText = decoder.decode(uint8Array)
            
            if (decodedText && !this.hasGarbledText(decodedText)) {
              console.log(`使用 ${encoding.label} 编码成功`)
              return decodedText
            }
          } catch (e) {
            console.log(`${encoding.label} 解码失败:`, e)
          }
        }
        
        // 最后返回检测到的编码结果（即使有乱码）
        const decoder = new TextDecoder(detectedEncoding, { fatal: false })
        const finalText = decoder.decode(uint8Array)
        console.log(`使用检测到的 ${detectedEncoding.toUpperCase()} 编码（可能有乱码）`)
        return finalText
        
      } catch (error) {
        console.error('文本解码失败:', error)
        // 最后尝试使用blob.text()
        return await blob.text()
      }
    },

    // 智能编码检测
    detectEncoding(uint8Array) {
      // 检查BOM（字节顺序标记）
      if (uint8Array.length >= 3) {
        // UTF-8 BOM
        if (uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
          return 'utf-8'
        }
      }
      
      if (uint8Array.length >= 2) {
        // UTF-16 LE BOM
        if (uint8Array[0] === 0xFF && uint8Array[1] === 0xFE) {
          return 'utf-16le'
        }
        // UTF-16 BE BOM
        if (uint8Array[0] === 0xFE && uint8Array[1] === 0xFF) {
          return 'utf-16be'
        }
      }
      
      // 基于字节模式的启发式检测
      let utf8Score = 0
      let gbkScore = 0
      let asciiCount = 0
      
      for (let i = 0; i < Math.min(uint8Array.length, 1024); i++) {
        const byte = uint8Array[i]
        
        // ASCII字符
        if (byte < 0x80) {
          asciiCount++
          continue
        }
        
        // UTF-8多字节字符检测
        if (byte >= 0xC0 && byte <= 0xDF) {
          // 2字节UTF-8字符
          if (i + 1 < uint8Array.length && uint8Array[i + 1] >= 0x80 && uint8Array[i + 1] <= 0xBF) {
            utf8Score += 2
            i++ // 跳过下一个字节
            continue
          }
        } else if (byte >= 0xE0 && byte <= 0xEF) {
          // 3字节UTF-8字符
          if (i + 2 < uint8Array.length && 
              uint8Array[i + 1] >= 0x80 && uint8Array[i + 1] <= 0xBF &&
              uint8Array[i + 2] >= 0x80 && uint8Array[i + 2] <= 0xBF) {
            utf8Score += 3
            i += 2 // 跳过下两个字节
            continue
          }
        }
        
        // GBK字符检测
        if (byte >= 0x81 && byte <= 0xFE) {
          if (i + 1 < uint8Array.length && uint8Array[i + 1] >= 0x40 && uint8Array[i + 1] <= 0xFE) {
            gbkScore += 2
            i++ // 跳过下一个字节
            continue
          }
        }
      }
      
      const totalNonAscii = uint8Array.length - asciiCount
      
      // 计算得分比例
      const utf8Ratio = totalNonAscii > 0 ? utf8Score / totalNonAscii : 0
      const gbkRatio = totalNonAscii > 0 ? gbkScore / totalNonAscii : 0
      
      console.log(`编码检测结果: UTF-8得分=${utf8Score}, GBK得分=${gbkScore}, UTF-8比例=${utf8Ratio.toFixed(2)}, GBK比例=${gbkRatio.toFixed(2)}`)
      
      // 根据得分判断编码
      if (utf8Ratio > 0.8) {
        return 'utf-8'
      } else if (gbkRatio > 0.6) {
        return 'gbk'
      } else if (utf8Ratio > gbkRatio) {
        return 'utf-8'
      } else {
        return 'gbk'
      }
    },

    // 检查文本是否包含乱码
    hasGarbledText(text) {
      // 检查常见的乱码字符
      const garbledPatterns = [
        '', // 替换字符
        '', // 问号
        '\uFFFD', // Unicode替换字符
        '\u003F' // 问号
      ]
      
      for (const pattern of garbledPatterns) {
        if (text.includes(pattern)) {
          return true
        }
      }
      
      // 检查是否包含过多的非ASCII字符（可能是编码错误）
      const nonAsciiCount = (text.match(/[^\x00-\x7F]/g) || []).length
      const totalChars = text.length
      
      if (totalChars > 0) {
        const nonAsciiRatio = nonAsciiCount / totalChars
        
        // 如果非ASCII字符比例过高且包含大量乱码，可能是编码问题
        if (nonAsciiRatio > 0.5 && totalChars > 50) {
          // 检查是否包含大量重复的乱码字符
          const garbledCount = (text.match(/[\uFFFD]/g) || []).length
          if (garbledCount / totalChars > 0.1) {
            return true
          }
        }
      }
      
      return false
    },

    // 重新加载
    retryLoad() {
      this.loadTextContent()
    },

    // 复制到剪贴板
    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.textContent)
        this.$message.success('内容已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
        // 降级方案
        this.fallbackCopyToClipboard()
      }
    },

    // 降级复制方案
    fallbackCopyToClipboard() {
      const textArea = document.createElement('textarea')
      textArea.value = this.textContent
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        this.$message.success('内容已复制到剪贴板')
      } catch (error) {
        console.error('降级复制失败:', error)
        this.$message.error('复制失败，请手动复制')
      } finally {
        document.body.removeChild(textArea)
      }
    },

    // 下载文本文件
    downloadText() {
      try {
        const blob = new Blob([this.textContent], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = this.fileName
        link.click()
        URL.revokeObjectURL(url)
        
        this.$message.success('文件下载成功')
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error('文件下载失败')
      }
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.text-preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-container {
  flex: 1;
  overflow: auto;
  background: #f8f9fa;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  text-align: center;
}

.loading-container i {
  font-size: 32px;
  margin-bottom: 16px;
  animation: rotating 2s linear infinite;
}

.error-container i,
.empty-container i {
  font-size: 32px;
  margin-bottom: 16px;
  color: #909399;
}

.text-preview {
  padding: 20px;
  height: 100%;
  overflow: auto;
}

.text-content {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 16px;
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #2c3e50;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-x: auto;
  max-height: calc(100vh - 200px);
}


@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .text-preview {
    padding: 15px;
  }
  
  .text-content {
    font-size: 12px;
    padding: 12px;
  }
  
}

@media (max-width: 480px) {
  .text-preview {
    padding: 10px;
  }
  
  .text-content {
    font-size: 11px;
    padding: 10px;
  }
  
}
</style>
