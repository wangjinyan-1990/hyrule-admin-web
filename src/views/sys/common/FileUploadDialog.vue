<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :width="width"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="upload-content">
      <div v-if="tips" class="upload-tips">
        <i class="el-icon-info"></i>
        <span>{{ tips }}</span>
      </div>
      
      <el-upload
        ref="upload"
        action="#"
        :auto-upload="false"
        :limit="limit"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
        :accept="accept"
        :drag="drag"
        :multiple="multiple"
        class="upload-demo"
      >
        <i v-if="drag" class="el-icon-upload"></i>
        <div v-if="drag" class="el-upload__text">
          {{ uploadText || '将文件拖到此处，或' }}<em>{{ clickText || '点击选择文件' }}</em>
        </div>
        <el-button v-else size="small" type="primary">
          <i class="el-icon-upload"></i>
          {{ uploadButtonText || '选择文件' }}
        </el-button>
        <div class="el-upload__tip" slot="tip">
          {{ uploadTip || `支持${acceptText}文件，且不超过${maxSize}MB` }}
          <br v-if="multiple">
          <span v-if="multiple">当前已选择 {{ selectedFiles.length }} 个文件</span>
        </div>
      </el-upload>

      <!-- 文件列表预览 -->
      <div v-if="selectedFiles.length > 0" class="file-preview">
        <h4>已选择的文件：</h4>
        <div class="file-list">
          <div 
            v-for="(file, index) in selectedFiles" 
            :key="index"
            class="file-item"
          >
            <i class="el-icon-document"></i>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <el-button 
              type="text" 
              size="mini" 
              @click="removeFile(index)"
              class="remove-btn"
            >
              <i class="el-icon-close"></i>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 单文件显示（兼容原有功能） -->
      <div v-if="!multiple && selectedFile" class="selected-file">
        <i class="el-icon-document"></i>
        <span>{{ selectedFile.name }}</span>
        <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
        <el-button type="text" size="mini" @click="removeFile">
          <i class="el-icon-close"></i>
        </el-button>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button 
        type="primary" 
        @click="handleConfirm" 
        :loading="loading" 
        :disabled="!hasSelectedFiles"
      >
        {{ getConfirmButtonText }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'FileUploadDialog',
  props: {
    // 对话框标题
    title: {
      type: String,
      default: '文件上传'
    },
    // 对话框宽度
    width: {
      type: String,
      default: '600px'
    },
    // 是否显示对话框
    visible: {
      type: Boolean,
      default: false
    },
    // 提示信息
    tips: {
      type: String,
      default: ''
    },
    // 文件类型限制
    accept: {
      type: String,
      default: '*'
    },
    // 文件类型显示文本
    acceptText: {
      type: String,
      default: '任意'
    },
    // 文件大小限制（MB）
    maxSize: {
      type: Number,
      default: 10
    },
    // 文件数量限制
    limit: {
      type: Number,
      default: 1
    },
    // 是否支持拖拽上传
    drag: {
      type: Boolean,
      default: true
    },
    // 是否支持多文件上传
    multiple: {
      type: Boolean,
      default: false
    },
    // 上传区域文本
    uploadText: {
      type: String,
      default: ''
    },
    // 点击文本
    clickText: {
      type: String,
      default: ''
    },
    // 上传按钮文本
    uploadButtonText: {
      type: String,
      default: ''
    },
    // 上传提示文本
    uploadTip: {
      type: String,
      default: ''
    },
    // 确认按钮文本
    confirmText: {
      type: String,
      default: ''
    },
    // 是否正在处理
    loading: {
      type: Boolean,
      default: false
    },
    // 批量上传API配置
    uploadConfig: {
      type: Object,
      default: () => ({
        url: '/framework/attachment/upload/batch',
        module: 'notebook',
        relateId: ''
      })
    },
    // 是否自动调用上传API
    autoUpload: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      selectedFile: null,
      selectedFiles: [] // 多文件列表
    }
  },
  computed: {
    // 是否有选择的文件
    hasSelectedFiles() {
      if (this.multiple) {
        return this.selectedFiles.length > 0
      }
      return !!this.selectedFile
    },
    // 确认按钮文本
    getConfirmButtonText() {
      if (this.loading) {
        return this.multiple ? '上传中...' : '处理中...'
      }
      if (this.confirmText) {
        return this.confirmText
      }
      if (this.multiple && this.selectedFiles.length > 0) {
        return `上传 ${this.selectedFiles.length} 个文件`
      }
      return '确定'
    }
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal
        if (newVal) {
          this.resetFile()
        }
      },
      immediate: true
    }
  },
  methods: {
    // 重置文件
    resetFile() {
      this.selectedFile = null
      this.selectedFiles = []
      this.$nextTick(() => {
        if (this.$refs.upload) {
          this.$refs.upload.clearFiles()
        }
      })
    },

    // 文件变化处理
    handleFileChange(file, fileList) {
      if (this.multiple) {
        // 多文件模式
        if (file.raw && !this.selectedFiles.some(f => f.name === file.name && f.size === file.raw.size)) {
          this.selectedFiles.push(file.raw)
        }
      } else {
        // 单文件模式
        if (fileList.length > 0) {
          this.selectedFile = file
        } else {
          this.selectedFile = null
        }
      }
    },

    // 上传前验证
    beforeUpload(file) {
      // 文件类型验证
      if (this.accept && this.accept !== '*') {
        const acceptTypes = this.accept.split(',').map(type => type.trim())
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
        
        if (!acceptTypes.some(type => {
          if (type.startsWith('.')) {
            return fileExtension === type
          } else {
            // MIME类型验证
            return file.type === type
          }
        })) {
          this.$message.error(`只能上传${this.acceptText}文件!`)
          return false
        }
      }

      // 文件大小验证
      const maxSizeBytes = this.maxSize * 1024 * 1024
      if (file.size > maxSizeBytes) {
        this.$message.error(`上传文件大小不能超过 ${this.maxSize}MB!`)
        return false
      }

      return false // 阻止自动上传
    },

    // 移除文件
    removeFile(index) {
      if (this.multiple) {
        // 多文件模式：移除指定索引的文件
        this.selectedFiles.splice(index, 1)
      } else {
        // 单文件模式
        this.selectedFile = null
        if (this.$refs.upload) {
          this.$refs.upload.clearFiles()
        }
      }
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 取消
    handleCancel() {
      this.dialogVisible = false
      this.$emit('cancel')
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false
      this.$emit('close')
    },

    // 确认上传
    async handleConfirm() {
      if (!this.hasSelectedFiles) {
        this.$message.warning('请先选择要上传的文件')
        return
      }

      if (this.autoUpload) {
        // 自动上传模式
        await this.performUpload()
      } else {
        // 手动上传模式，触发confirm事件
        if (this.multiple) {
          this.$emit('confirm', this.selectedFiles)
        } else {
          this.$emit('confirm', this.selectedFile)
        }
      }
    },

    // 执行上传
    async performUpload() {
      if (!this.uploadConfig.url) {
        this.$message.error('上传接口未配置')
        return
      }

      try {
        const formData = new FormData()
        
        if (this.multiple) {
          // 批量上传
          this.selectedFiles.forEach(file => {
            formData.append('files', file)
          })
        } else {
          // 单文件上传
          formData.append('file', this.selectedFile.raw || this.selectedFile)
        }
        
        // 添加其他参数
        formData.append('module', this.uploadConfig.module || 'default')
        formData.append('relateId', this.uploadConfig.relateId || '')
        
        // 调用上传API
        const response = await request({
          url: this.uploadConfig.url,
          method: 'post',
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        if (response.code === 200 || response.code === 20000) {
          const fileCount = this.multiple ? this.selectedFiles.length : 1
          this.$message.success(`成功上传 ${fileCount} 个文件`)
          this.dialogVisible = false
          this.$emit('success', response.data)
        } else {
          this.$message.error('上传失败：' + (response.message || '未知错误'))
          this.$emit('error', response)
        }
      } catch (error) {
        console.error('上传失败:', error)
        this.$message.error('上传失败，请重试')
        this.$emit('error', error)
      }
    }
  }
}
</script>

<style scoped>
.upload-content {
  padding: 20px 0;
}

.upload-tips {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f4f4f5;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
}

.upload-tips i {
  margin-right: 8px;
  color: #409eff;
}

.upload-demo {
  margin-bottom: 20px;
}

/* 文件预览区域 */
.file-preview {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.file-preview h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 14px;
}

.file-list {
  max-height: 200px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.file-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
}

.file-item:last-child {
  margin-bottom: 0;
}

.file-item .el-icon-document {
  color: #409eff;
  margin-right: 8px;
  font-size: 16px;
}

.file-item .file-name {
  flex: 1;
  font-size: 13px;
  color: #303133;
  margin-right: 10px;
  word-break: break-all;
}

.file-item .file-size {
  font-size: 12px;
  color: #909399;
  margin-right: 10px;
  white-space: nowrap;
}

.file-item .remove-btn {
  color: #f56c6c;
  padding: 0 !important;
  margin: 0 !important;
  min-width: 20px;
  height: 20px;
  line-height: 20px;
}

.file-item .remove-btn:hover {
  color: #f78989;
  background-color: transparent !important;
}

/* 单文件显示（兼容原有功能） */
.selected-file {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  color: #409eff;
}

.selected-file i {
  margin-right: 8px;
}

.selected-file span {
  margin-right: 8px;
}

.selected-file .file-size {
  color: #909399;
  font-size: 12px;
}

.selected-file .el-button {
  padding: 0;
  color: #f56c6c;
  margin-left: auto;
}
</style>
