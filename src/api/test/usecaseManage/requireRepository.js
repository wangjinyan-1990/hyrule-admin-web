import request from '@/utils/request'

/**
 * 需求点管理API
 * 遵循RESTful API设计规范
 */
export default {
  /**
   * 分页查询需求点列表
   * @param {Object} params 查询参数
   * @returns {Promise} 分页结果
   */
  getRequirePointList(params) {
    return request({
      url: '/test/requirepoint/list',
      method: 'get',
      params
    })
  },

  /**
   * 根据ID查询需求点详情
   * @param {string} requirePointId 需求点ID
   * @returns {Promise} 需求点详情
   */
  getRequirePointById(requirePointId) {
    return request({
      url: `/test/requirepoint/detail/${requirePointId}`,
      method: 'get'
    })
  },

  /**
   * 新增需求点
   * @param {Object} data 需求点数据
   * @returns {Promise} 新增结果
   */
  createRequirePoint(data) {
    return request({
      url: '/test/requirepoint/create',
      method: 'post',
      data
    })
  },

  /**
   * 更新需求点
   * @param {string} requirePointId 需求点ID
   * @param {Object} data 需求点数据
   * @returns {Promise} 更新结果
   */
  updateRequirePoint(requirePointId, data) {
    return request({
      url: '/test/requirepoint/update',
      method: 'post',
      data: {
        ...data,
        requirePointId
      }
    })
  },

  /**
   * 删除需求点
   * @param {string} requirePointId 需求点ID
   * @returns {Promise} 删除结果
   */
  deleteRequirePoint(requirePointId) {
    return request({
      url: '/test/requirepoint/delete',
      method: 'post',
      data: {
        requirePointId
      }
    })
  },

  /**
   * 批量删除需求点
   * @param {Array} requirePointIds 需求点ID数组
   * @returns {Promise} 批量删除结果
   */
  batchDeleteRequirePoints(requirePointIds) {
    return request({
      url: '/test/requirepoint/batchDelete',
      method: 'post',
      data: {
        requirePointIds
      }
    })
  },
  /**
   * 批量评审需求点
   * @param {Object} data 批量评审数据
   * @param {Array} data.requirePointIds 需求点ID数组
   * @param {string} data.reviewStatus 评审状态
   * @param {string} data.reviewComment 评审意见
   * @returns {Promise} 批量评审结果
   */
  batchReviewRequirePoints(data) {
    return request({
      url: '/test/requirepoint/batchReview',
      method: 'post',
      data
    })
  },

  /**
   * 导出需求点数据
   * @param {Object} params 导出参数
   * @returns {Promise} 导出结果（文件流）
   */
  exportRequirePoints(params) {
    return request({
      url: '/test/requirepoint/export',
      method: 'post',
      data: params,
      responseType: 'blob'
    })
  },

  /**
   * 下载导入模板
   * @returns {Promise} 模板文件
   */
  downloadImportTemplate() {
    return request({
      url: '/test/requirepoint/template',
      method: 'get',
      responseType: 'blob'
    })
  },

  /**
   * 导入需求点数据
   * @param {FormData} formData 包含文件的表单数据
   * @returns {Promise} 导入结果
   */
  importRequirePoints(formData) {
    return request({
      url: '/test/requirepoint/import',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 获取需求点统计信息
   * @param {Object} params 查询参数
   * @returns {Promise} 统计信息
   */
  getRequirePointStatistics(params) {
    return request({
      url: '/test/requirepoint/statistics',
      method: 'get',
      params
    })
  },

  /**
   * 获取需求点类型统计
   * @param {Object} params 查询参数
   * @returns {Promise} 类型统计信息
   */
  getRequirePointTypeStatistics(params) {
    return request({
      url: '/test/requirepoint/typeStatistics',
      method: 'get',
      params
    })
  },

  /**
   * 获取需求点状态统计
   * @param {Object} params 查询参数
   * @returns {Promise} 状态统计信息
   */
  getRequirePointStatusStatistics(params) {
    return request({
      url: '/test/requirepoint/statusStatistics',
      method: 'get',
      params
    })
  },

  /**
   * 复制需求点
   * @param {string} requirePointId 需求点ID
   * @param {Object} data 复制配置
   * @returns {Promise} 复制结果
   */
  copyRequirePoint(requirePointId, data) {
    return request({
      url: '/test/requirepoint/copy',
      method: 'post',
      data: {
        requirePointId,
        ...data
      }
    })
  },

  /**
   * 移动需求点到其他目录
   * @param {Array} requirePointIds 需求点ID数组
   * @param {string} targetDirectoryId 目标目录ID
   * @returns {Promise} 移动结果
   */
  moveRequirePoints(requirePointIds, targetDirectoryId) {
    return request({
      url: '/test/requirepoint/move',
      method: 'post',
      data: {
        requirePointIds,
        targetDirectoryId
      }
    })
  },

  /**
   * 获取需求点历史记录
   * @param {string} requirePointId 需求点ID
   * @param {Object} params 查询参数
   * @returns {Promise} 历史记录列表
   */
  getRequirePointHistory(requirePointId, params) {
    return request({
      url: '/test/requirepoint/history',
      method: 'get',
      params: {
        requirePointId,
        ...params
      }
    })
  },

  /**
   * 获取需求点关联的测试用例
   * @param {string} requirePointId 需求点ID
   * @returns {Promise} 关联的测试用例列表
   */
  getRequirePointTestCases(requirePointId) {
    return request({
      url: '/test/requirepoint/testcases',
      method: 'get',
      params: {
        requirePointId
      }
    })
  },

  /**
   * 关联测试用例到需求点
   * @param {string} requirePointId 需求点ID
   * @param {Array} testCaseIds 测试用例ID数组
   * @returns {Promise} 关联结果
   */
  linkTestCasesToRequirePoint(requirePointId, testCaseIds) {
    return request({
      url: '/test/requirepoint/linkTestCases',
      method: 'post',
      data: {
        requirePointId,
        testCaseIds
      }
    })
  },

  /**
   * 取消关联测试用例
   * @param {string} requirePointId 需求点ID
   * @param {Array} testCaseIds 测试用例ID数组
   * @returns {Promise} 取消关联结果
   */
  unlinkTestCasesFromRequirePoint(requirePointId, testCaseIds) {
    return request({
      url: '/test/requirepoint/unlinkTestCases',
      method: 'post',
      data: {
        requirePointId,
        testCaseIds
      }
    })
  }
}
