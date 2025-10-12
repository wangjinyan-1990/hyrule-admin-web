/**
 * 文件上传服务
 * 提供通用的文件上传和附件管理功能
 */
import request from '@/utils/request'

/**
 * 文件上传服务类
 */
class FileUploadService {
  /**
   * 构造函数
   * @param {Object} options 配置选项
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || ''
    this.timeout = options.timeout || 30000
    this.headers = options.headers || {}
  }

  /**
   * 上传文件
   * @param {File} file 要上传的文件
   * @param {Object} options 上传选项
   * @returns {Promise} 上传结果
   */
  async uploadFile(file, options = {}) {
    const formData = new FormData()
    formData.append('file', file)

    // 添加额外参数
    if (options.params) {
      Object.keys(options.params).forEach(key => {
        formData.append(key, options.params[key])
      })
    }

    try {
      const response = await fetch(this.baseUrl + (options.url || '/upload'), {
        method: 'POST',
        body: formData,
        headers: {
          ...this.headers,
          ...options.headers
        },
        timeout: options.timeout || this.timeout
      })

      if (!response.ok) {
        throw new Error(`上传失败: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result,
        message: '上传成功'
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message || '上传失败'
      }
    }
  }

  /**
   * 批量上传文件
   * @param {File[]} files 要上传的文件列表
   * @param {Object} options 上传选项
   * @returns {Promise} 上传结果
   */
  async uploadFiles(files, options = {}) {
    const results = []

    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadFile(files[i], {
        ...options,
        params: {
          ...options.params,
          index: i,
          total: files.length
        }
      })
      results.push({
        file: files[i],
        ...result
      })
    }

    return {
      success: results.every(r => r.success),
      results: results,
      message: `上传完成: ${results.filter(r => r.success).length}/${files.length} 个文件成功`
    }
  }

  /**
   * 验证文件
   * @param {File} file 要验证的文件
   * @param {Object} rules 验证规则
   * @returns {Object} 验证结果
   */
  validateFile(file, rules = {}) {
    const errors = []

    // 文件类型验证
    if (rules.accept && rules.accept.length > 0) {
      const acceptTypes = rules.accept.map(type => type.trim())
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

      const isValidType = acceptTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type
        } else {
          // MIME类型验证
          return file.type === type
        }
      })

      if (!isValidType) {
        errors.push(`文件类型不支持，只支持: ${rules.accept.join(', ')}`)
      }
    }

    // 文件大小验证
    if (rules.maxSize) {
      const maxSizeBytes = rules.maxSize * 1024 * 1024
      if (file.size > maxSizeBytes) {
        errors.push(`文件大小不能超过 ${rules.maxSize}MB`)
      }
    }

    // 文件名验证
    if (rules.fileNamePattern) {
      const pattern = new RegExp(rules.fileNamePattern)
      if (!pattern.test(file.name)) {
        errors.push(`文件名格式不正确，${rules.fileNameDescription || ''}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors
    }
  }

  /**
   * 格式化文件大小
   * @param {number} bytes 字节数
   * @returns {string} 格式化后的大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 获取文件扩展名
   * @param {string} fileName 文件名
   * @returns {string} 扩展名
   */
  getFileExtension(fileName) {
    return fileName.split('.').pop().toLowerCase()
  }

  /**
   * 检查是否为图片文件
   * @param {File} file 文件对象
   * @returns {boolean} 是否为图片
   */
  isImageFile(file) {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    return imageTypes.includes(file.type)
  }

  /**
   * 检查是否为Excel文件
   * @param {File} file 文件对象
   * @returns {boolean} 是否为Excel文件
   */
  isExcelFile(file) {
    const excelTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    const excelExtensions = ['.xlsx', '.xls']
    return excelTypes.includes(file.type) || excelExtensions.includes('.' + this.getFileExtension(file.name))
  }

  /**
   * 检查是否为PDF文件
   * @param {File} file 文件对象
   * @returns {boolean} 是否为PDF文件
   */
  isPdfFile(file) {
    return file.type === 'application/pdf' || this.getFileExtension(file.name) === 'pdf'
  }

  /**
   * 根据模块和关联ID获取附件列表
   * @param {string} module 模块名称
   * @param {string} relateId 关联ID
   * @returns {Promise} 附件列表
   */
  async getAttachments(module, relateId) {
    try {
      const params = {
        module: module,
        relateId: relateId
      }

      const response = await request({
        url: '/framework/attachment/list',
        method: 'get',
        params: params
      })

      return {
        success: true,
        data: response.data || response,
        message: '获取附件列表成功'
      }
    } catch (error) {
      console.error('获取附件列表失败:', error)
      return {
        success: false,
        data: null,
        message: error.message || '获取附件列表失败'
      }
    }
  }

  /**
   * 根据附件ID获取附件详情
   * @param {string} attachmentId 附件ID
   * @returns {Promise} 附件详情
   */
  async getAttachmentById(attachmentId) {
    try {
      const response = await request({
        url: `/framework/attachment/${attachmentId}`,
        method: 'get'
      })

      return {
        success: true,
        data: response.data || response,
        message: '获取附件详情成功'
      }
    } catch (error) {
      console.error('获取附件详情失败:', error)
      return {
        success: false,
        data: null,
        message: error.message || '获取附件详情失败'
      }
    }
  }

  /**
   * 预览文本文件
   * @param {string} attachmentId 附件ID
   * @returns {Promise} 文本内容
   */
  async viewTextFile(attachmentId) {
    try {
      // 使用request工具调用API，它会自动处理baseURL和代理
      const response = await request({
        url: `/framework/attachment/viewTextFile/${attachmentId}`,
        method: 'get'
      })
      
      console.log('viewTextFile 响应:', response)
      
      // request已经处理了响应，直接使用
      const jsonData = response
      
      // 成功：提取文本内容
      let textContent = ''
      
      // 处理不同的数据结构
      if (typeof jsonData.data === 'string') {
        // data 直接是字符串
        textContent = jsonData.data
      } else if (jsonData.data && jsonData.data.content) {
        // data 是对象，content 字段包含文本内容
        textContent = jsonData.data.content
      } else if (jsonData.content) {
        // 直接有 content 字段
        textContent = jsonData.content
      } else {
        // 兜底：将整个 data 对象转为字符串
        textContent = JSON.stringify(jsonData.data, null, 2)
      }
      
      console.log('文本内容长度:', textContent.length)
      
      // 只返回文本内容，不返回其他文件信息
      return {
        success: true,
        data: textContent,
        message: jsonData.message || '获取文本内容成功'
      }
    } catch (error) {
      console.error('获取文本内容失败:', error)
      
      return {
        success: false,
        data: null,
        message: error.message || '获取文本内容失败'
      }
    }
  }

  /**
   * 获取附件预览URL
   * @param {string} attachmentId 附件ID
   * @param {string} fileName 文件名（可选，用于WebOffice识别文件类型）
   * @returns {string} 预览URL
   */
  getAttachmentPreviewUrl(attachmentId, fileName = null) {
    // 获取当前环境的基础URL
    const baseURL = this.getBaseURL()
    let url = `${baseURL}/framework/attachment/download/${attachmentId}`
    
    // 如果提供了文件名，添加到URL中以便WebOffice识别文件类型
    if (fileName) {
      const encodedFileName = encodeURIComponent(fileName)
      url += `?fileName=${encodedFileName}`
    }
    
    return url
  }

  /**
   * 获取基础URL
   * @returns {string} 基础URL
   */
  getBaseURL() {
    // 在开发环境中，使用frp隧道地址
    if (process.env.NODE_ENV === 'development') {
      return 'http://cfc8522bc8db.ofalias.net:23555'
    }
    
    // 在生产环境中，使用当前域名
    return window.location.origin
  }

  /**
   * 下载附件
   * @param {string} attachmentId 附件ID
   * @param {string} fileName 下载文件名（可选）
   * @param {boolean} autoDownload 是否自动下载（默认true）
   * @returns {Promise} 下载结果
   */
  async downloadAttachment(attachmentId, fileName = null, autoDownload = true) {
    try {
      const response = await request({
        url: `/framework/attachment/download/${attachmentId}`,
        method: 'get',
        responseType: 'blob'
      })

      // 如果设置为自动下载，则触发下载
      if (autoDownload) {
        // 创建下载链接
        const blob = new Blob([response])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName || `attachment_${attachmentId}`
        
        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 清理URL对象
        window.URL.revokeObjectURL(url)
      }

      return {
        success: true,
        data: response,
        message: '获取文件成功'
      }
    } catch (error) {
      console.error('获取附件失败:', error)
      return {
        success: false,
        data: null,
        message: error.message || '获取附件失败'
      }
    }
  }

  /**
   * 删除附件
   * @param {string} attachmentId 附件ID
   * @returns {Promise} 删除结果
   */
  async deleteAttachment(attachmentId) {
    try {
      const response = await request({
        url: `/framework/attachment/${attachmentId}`,
        method: 'delete'
      })

      return {
        success: true,
        data: response.data || response,
        message: '删除附件成功'
      }
    } catch (error) {
      console.error('删除附件失败:', error)
      return {
        success: false,
        data: null,
        message: error.message || '删除附件失败'
      }
    }
  }

  /**
   * 批量删除附件
   * @param {string[]} attachmentIds 附件ID列表
   * @returns {Promise} 删除结果
   */
  async batchDeleteAttachments(attachmentIds) {
    try {
      const response = await request({
        url: '/framework/attachment/batch/delete',
        method: 'delete',
        data: { attachmentIds: attachmentIds }
      })

      return {
        success: true,
        data: response.data || response,
        message: `成功删除 ${attachmentIds.length} 个附件`
      }
    } catch (error) {
      console.error('批量删除附件失败:', error)
      return {
        success: false,
        data: null,
        message: error.message || '批量删除附件失败'
      }
    }
  }
}

// 创建默认实例
const fileUploadService = new FileUploadService()

// 导出默认实例和类
export default fileUploadService
export { FileUploadService }
