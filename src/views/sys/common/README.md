# 通用文件上传组件

这个目录包含了通用的文件上传组件和服务，可以在项目的任何地方复用。

## 文件说明

### FileUploadDialog.vue
通用的文件上传对话框组件，支持拖拽上传、文件验证、进度显示等功能。

### FileUploadService.js (已移动到 src/api/sys/common/fileUploadService.js)
文件上传服务类，提供文件上传、验证、格式化等通用方法。

## 使用方法

### 1. 基本使用

```vue
<template>
  <div>
    <el-button @click="showUploadDialog = true">上传文件</el-button>
    
    <FileUploadDialog
      title="导入数据"
      :visible.sync="showUploadDialog"
      tips="请先下载导入模板，按照模板格式填写数据后上传"
      accept=".xlsx,.xls"
      accept-text="Excel"
      :max-size="10"
      confirm-text="确定导入"
      :loading="uploadLoading"
      @confirm="handleUploadConfirm"
      @cancel="showUploadDialog = false"
    />
  </div>
</template>

<script>
import FileUploadDialog from '@/views/sys/common/FileUploadDialog.vue'
import fileUploadService from '@/api/sys/common/fileUploadService.js'

export default {
  components: {
    FileUploadDialog
  },
  data() {
    return {
      showUploadDialog: false,
      uploadLoading: false
    }
  },
  methods: {
    async handleUploadConfirm(file) {
      this.uploadLoading = true
      try {
        const result = await fileUploadService.uploadFile(file, {
          url: '/api/import',
          params: {
            type: 'excel'
          }
        })
        
        if (result.success) {
          this.$message.success('上传成功')
          this.showUploadDialog = false
          // 刷新数据
          this.loadData()
        } else {
          this.$message.error(result.message)
        }
      } catch (error) {
        this.$message.error('上传失败')
      } finally {
        this.uploadLoading = false
      }
    }
  }
}
</script>
```

### 2. 自定义配置

```vue
<FileUploadDialog
  title="上传图片"
  :visible.sync="showDialog"
  accept="image/*"
  accept-text="图片"
  :max-size="5"
  :limit="3"
  :multiple="true"
  :drag="false"
  upload-button-text="选择图片"
  upload-tip="支持 JPG、PNG、GIF 格式，单个文件不超过 5MB"
  @confirm="handleImageUpload"
/>
```

### 3. 使用文件上传服务

```javascript
import fileUploadService from '@/api/sys/common/fileUploadService.js'

// 验证文件
const validation = fileUploadService.validateFile(file, {
  accept: ['.xlsx', '.xls'],
  maxSize: 10
})

if (!validation.valid) {
  console.error('文件验证失败:', validation.errors)
  return
}

// 上传文件
const result = await fileUploadService.uploadFile(file, {
  url: '/api/upload',
  params: { category: 'document' }
})

// 格式化文件大小
const sizeText = fileUploadService.formatFileSize(1024000) // "1 MB"

// 检查文件类型
const isExcel = fileUploadService.isExcelFile(file)
const isImage = fileUploadService.isImageFile(file)
```

## 组件属性

### FileUploadDialog Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| title | String | '文件上传' | 对话框标题 |
| width | String | '500px' | 对话框宽度 |
| visible | Boolean | false | 是否显示对话框 |
| tips | String | '' | 提示信息 |
| accept | String | '.xlsx,.xls' | 接受的文件类型 |
| acceptText | String | 'Excel' | 文件类型显示文本 |
| maxSize | Number | 10 | 文件大小限制（MB） |
| limit | Number | 1 | 文件数量限制 |
| drag | Boolean | true | 是否支持拖拽上传 |
| multiple | Boolean | false | 是否支持多文件上传 |
| uploadText | String | '' | 上传区域文本 |
| clickText | String | '' | 点击文本 |
| uploadButtonText | String | '' | 上传按钮文本 |
| uploadTip | String | '' | 上传提示文本 |
| confirmText | String | '' | 确认按钮文本 |
| loading | Boolean | false | 是否正在处理 |

### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| confirm | file | 确认上传时触发，参数为选中的文件 |
| cancel | - | 取消上传时触发 |
| close | - | 关闭对话框时触发 |

## 服务方法

### FileUploadService

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| uploadFile | file, options | Promise | 上传单个文件 |
| uploadFiles | files, options | Promise | 批量上传文件 |
| validateFile | file, rules | Object | 验证文件 |
| formatFileSize | bytes | String | 格式化文件大小 |
| getFileExtension | fileName | String | 获取文件扩展名 |
| isImageFile | file | Boolean | 检查是否为图片文件 |
| isExcelFile | file | Boolean | 检查是否为Excel文件 |
| isPdfFile | file | Boolean | 检查是否为PDF文件 |

## 注意事项

1. 组件使用 Element UI 的 el-upload 组件，确保项目中已安装 Element UI
2. 文件上传服务使用 fetch API，如需兼容老版本浏览器，请添加 polyfill
3. 组件支持自定义样式，可以通过 CSS 覆盖默认样式
4. 建议在实际使用时根据后端 API 调整上传服务配置
