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
          {{ uploadText || '将文件拖到此处，或' }}<em>{{ clickText || '点击上传' }}</em>
        </div>
        <el-button v-else size="small" type="primary">
          <i class="el-icon-upload"></i>
          {{ uploadButtonText || '选择文件' }}
        </el-button>
        <div class="el-upload__tip" slot="tip">
          {{ uploadTip || `只能上传${acceptText}文件，且不超过${maxSize}MB` }}
        </div>
      </el-upload>
      
      <div v-if="selectedFile" class="selected-file">
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
      <el-button type="primary" @click="handleConfirm" :loading="loading" :disabled="!selectedFile">
        {{ confirmText || '确定' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
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
      default: '500px'
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
      default: '.xlsx,.xls'
    },
    // 文件类型显示文本
    acceptText: {
      type: String,
      default: 'Excel'
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
      if (fileList.length > 0) {
        this.selectedFile = file
      } else {
        this.selectedFile = null
      }
    },

    // 上传前验证
    beforeUpload(file) {
      // 文件类型验证
      if (this.accept) {
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
    handleConfirm() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择要上传的文件')
        return
      }

      this.$emit('confirm', this.selectedFile)
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
