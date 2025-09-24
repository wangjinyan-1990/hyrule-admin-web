/**
 * 文件上传服务
 * 提供通用的文件上传功能
 */

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
}

// 创建默认实例
const fileUploadService = new FileUploadService()

// 导出默认实例和类
export default fileUploadService
export { FileUploadService }
