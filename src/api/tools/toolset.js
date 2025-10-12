import request from '@/utils/request'

export default {
  /**
   * OCR图片文字识别
   * @param {FormData} formData - 包含图片文件和其他参数的表单数据
   * @param {File} formData.file - 图片文件
   * @param {String} formData.userId - 用户ID（可选）
   * @returns {Promise} OCR识别结果
   */
  recognizeImageText(formData) {
    return request({
      url: '/tools/ocr/recognize',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // 30秒超时，因为OCR处理可能需要较长时间
    })
  },

  /**
   * 获取OCR识别历史记录
   * @param {Object} params - 查询参数
   * @param {String} params.userId - 用户ID
   * @param {Number} params.pageNum - 页码（可选，默认1）
   * @param {Number} params.pageSize - 每页大小（可选，默认10）
   * @returns {Promise} 历史记录列表
   */
  getOCRHistory(params) {
    return request({
      url: '/tools/ocr/history',
      method: 'get',
      params
    })
  },

  /**
   * 删除OCR识别记录
   * @param {String} recordId - 记录ID
   * @returns {Promise} 删除结果
   */
  deleteOCRRecord(recordId) {
    return request({
      url: `/tools/ocr/record/delete/${recordId}`,
      method: 'delete'
    })
  },

  /**
   * 批量删除OCR识别记录
   * @param {Array} recordIds - 记录ID数组
   * @returns {Promise} 删除结果
   */
  batchDeleteOCRRecords(recordIds) {
    return request({
      url: '/tools/ocr/record/batchDelete',
      method: 'delete',
      data: { recordIds }
    })
  },

  /**
   * 获取OCR识别统计信息
   * @param {Object} params - 查询参数
   * @param {String} params.userId - 用户ID
   * @param {String} params.startDate - 开始日期（可选）
   * @param {String} params.endDate - 结束日期（可选）
   * @returns {Promise} 统计信息
   */
  getOCRStatistics(params) {
    return request({
      url: '/tools/ocr/statistics',
      method: 'get',
      params
    })
  }
}
