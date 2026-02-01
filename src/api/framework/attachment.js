import request from '@/utils/request'

/**
 * 附件管理API
 */
export default {
  /**
   * 上传附件
   * @param {FormData} formData 表单数据，包含 file、module、relateId
   * @returns {Promise} 上传结果
   */
  uploadAttachment(formData) {
    return request({
      url: '/framework/attachment/upload',
      method: 'post',
      data: formData
      // 不设置 Content-Type，让浏览器自动设置（包含 boundary）
    })
  },

  /**
   * 根据模块和关联ID获取附件列表
   * @param {Object} params 查询参数 {module, relateId}
   * @returns {Promise} 附件列表
   */
  getAttachmentList(params) {
    return request({
      url: '/framework/attachment/list',
      method: 'get',
      params
    })
  },

  /**
   * 根据附件ID获取附件详情
   * @param {string} attachmentId 附件ID
   * @returns {Promise} 附件详情
   */
  getAttachmentById(attachmentId) {
    return request({
      url: `/framework/attachment/${attachmentId}`,
      method: 'get'
    })
  },

  /**
   * 下载附件
   * @param {string} attachmentId 附件ID
   * @param {string} fileName 下载文件名（可选）
   * @returns {Promise} 下载结果
   */
  downloadAttachment(attachmentId, fileName = null) {
    return request({
      url: `/framework/attachment/download/${attachmentId}`,
      method: 'get',
      responseType: 'blob',
      params: fileName ? { fileName } : {}
    })
  },

  /**
   * 删除附件
   * @param {string} attachmentId 附件ID
   * @returns {Promise} 删除结果
   */
  deleteAttachment(attachmentId) {
    return request({
      url: `/framework/attachment/${attachmentId}`,
      method: 'delete'
    })
  },

  /**
   * 批量删除附件
   * @param {Array<string>} attachmentIds 附件ID列表
   * @returns {Promise} 删除结果
   */
  batchDeleteAttachments(attachmentIds) {
    return request({
      url: '/framework/attachment/batch/delete',
      method: 'delete',
      data: { attachmentIds }
    })
  }
}
