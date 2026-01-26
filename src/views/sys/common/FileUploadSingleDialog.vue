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
        :limit="1"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :on-exceed="handleExceed"
        :before-upload="beforeUpload"
        :accept="accept"
        :drag="drag"
        :multiple="false"
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
        </div>
      </el-upload>

      <!-- 单文件显示 -->
      <div v-if="selectedFile" class="selected-file">
        <i class="el-icon-document"></i>
        <span>{{ selectedFile.name }}</span>
        <span class="file-size">({{ formatFileSize(selectedFile.size || (selectedFile.raw && selectedFile.raw.size) || 0) }})</span>
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
        :disabled="!selectedFile"
      >
        {{ confirmText || '确定' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'FileUploadSingleDialog',
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
    // 是否支持拖拽上传
    drag: {
      type: Boolean,
      default: true
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
    // 上传API配置
    uploadConfig: {
      type: Object,
      default: () => ({
        url: '/framework/attachment/upload',
        module: 'default',
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
      selectedFile: null
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
      this.$nextTick(() => {
        if (this.$refs.upload) {
          this.$refs.upload.clearFiles()
        }
      })
    },

    // 文件变化处理
    handleFileChange(file, fileList) {
      // 单文件模式：如果用户重新选择文件，清空之前的文件
      if (fileList.length > 1) {
        // 只保留最新选择的文件，清空旧文件
        const latestFile = fileList[fileList.length - 1]
        this.selectedFile = latestFile
        
        // 立即清空 el-upload 组件的文件列表，只保留最新文件
        this.$nextTick(() => {
          if (this.$refs.upload) {
            // 先清空所有文件
            this.$refs.upload.clearFiles()
            // 然后手动添加最新文件到文件列表
            this.$refs.upload.fileList = [latestFile]
          }
        })
      } else if (fileList.length === 1) {
        // 第一次选择文件或文件列表只有一个文件
        this.selectedFile = file
      } else {
        // 文件列表为空
        this.selectedFile = null
      }
    },

    // 文件移除处理
    handleFileRemove(file, fileList) {
      this.selectedFile = null
    },

    // 文件超出限制处理（当用户选择第二个文件时）
    handleExceed(files, fileList) {
      // 当用户选择第二个文件时，清空旧文件，只保留新选择的文件
      if (files.length > 0 && this.$refs.upload) {
        const newFile = files[0]
        // 先清空所有文件
        this.$refs.upload.clearFiles()
        // 然后添加新文件
        this.$nextTick(() => {
          // 创建文件对象
          const fileObj = {
            name: newFile.name,
            size: newFile.size,
            raw: newFile,
            uid: newFile.uid || Date.now()
          }
          this.selectedFile = fileObj
          // 手动添加到文件列表
          if (this.$refs.upload) {
            this.$refs.upload.fileList = [fileObj]
          }
        })
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
    removeFile() {
      this.selectedFile = null
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
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
      if (!this.selectedFile) {
        this.$message.warning('请先选择要上传的文件')
        return
      }

      if (this.autoUpload) {
        // 自动上传模式
        await this.performUpload()
      } else {
        // 手动上传模式，触发confirm事件
        this.$emit('confirm', this.selectedFile)
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
        formData.append('file', this.selectedFile.raw || this.selectedFile)
        
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
          this.$message.success('文件上传成功')
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

/* 单文件显示 */
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
