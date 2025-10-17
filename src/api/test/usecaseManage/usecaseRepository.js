import request from '@/utils/request'

/**
 * 用例管理API
 * 遵循RESTful API设计规范
 */
export default {
  /**
   * 分页查询用例列表
   * @param {Object} params 查询参数
   * @returns {Promise} 分页结果
   */
  getUsecaseList(params) {
    return request({
      url: '/test/usecase/list',
      method: 'get',
      params
    })
  },

  /**
   * 根据ID查询用例详情
   * @param {string} usecaseId 用例ID
   * @returns {Promise} 用例详情
   */
  getUsecaseById(usecaseId) {
    return request({
      url: `/test/usecase/detail/${usecaseId}`,
      method: 'get'
    })
  },

  /**
   * 根据ID查询用例详情（别名方法）
   * @param {string} usecaseId 用例ID
   * @returns {Promise} 用例详情
   */
  getUsecaseDetail(usecaseId) {
    return this.getUsecaseById(usecaseId)
  },

  /**
   * 新增用例
   * @param {Object} data 用例数据
   * @returns {Promise} 新增结果
   */
  createUsecase(data) {
    return request({
      url: '/test/usecase/create',
      method: 'post',
      data
    })
  },

  /**
   * 更新用例
   * @param {string} usecaseId 用例ID
   * @param {Object} data 用例数据
   * @returns {Promise} 更新结果
   */
  updateUsecase(usecaseId, data) {
    return request({
      url: '/test/usecase/update',
      method: 'post',
      data: {
        ...data,
        usecaseId
      }
    })
  },

  /**
   * 删除用例
   * @param {string} usecaseId 用例ID
   * @returns {Promise} 删除结果
   */
  deleteUsecase(usecaseId) {
    return request({
      url: '/test/usecase/delete',
      method: 'post',
      data: {
        usecaseId
      }
    })
  },

  /**
   * 批量删除用例
   * @param {Array} usecaseIds 用例ID数组
   * @returns {Promise} 批量删除结果
   */
  batchDeleteUsecases(usecaseIds) {
    return request({
      url: '/test/usecase/batchDelete',
      method: 'post',
      data: {
        usecaseIds
      }
    })
  },

  /**
   * 导出用例数据
   * @param {Object} params 导出参数
   * @returns {Promise} 导出结果（文件流）
   */
  exportUsecases(params) {
    return request({
      url: '/test/usecase/export',
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
      url: '/test/usecase/template',
      method: 'get',
      responseType: 'blob'
    })
  },

  /**
   * 导入用例数据
   * @param {FormData} formData 包含文件的表单数据
   * @returns {Promise} 导入结果
   */
  importUsecases(formData) {
    return request({
      url: '/test/usecase/import',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 获取用例统计信息
   * @param {Object} params 查询参数
   * @returns {Promise} 统计信息
   */
  getUsecaseStatistics(params) {
    return request({
      url: '/test/usecase/statistics',
      method: 'get',
      params
    })
  },

  /**
   * 获取用例类型统计
   * @param {Object} params 查询参数
   * @returns {Promise} 类型统计信息
   */
  getUsecaseTypeStatistics(params) {
    return request({
      url: '/test/usecase/typeStatistics',
      method: 'get',
      params
    })
  },

  /**
   * 获取用例状态统计
   * @param {Object} params 查询参数
   * @returns {Promise} 状态统计信息
   */
  getUsecaseStatusStatistics(params) {
    return request({
      url: '/test/usecase/statusStatistics',
      method: 'get',
      params
    })
  },

  /**
   * 复制用例
   * @param {string} usecaseId 用例ID
   * @param {Object} data 复制配置
   * @returns {Promise} 复制结果
   */
  copyUsecase(usecaseId, data) {
    return request({
      url: '/test/usecase/copy',
      method: 'post',
      data: {
        usecaseId,
        ...data
      }
    })
  },

  /**
   * 移动用例到其他目录
   * @param {Array} usecaseIds 用例ID数组
   * @param {string} targetDirectoryId 目标目录ID
   * @returns {Promise} 移动结果
   */
  moveUsecases(usecaseIds, targetDirectoryId) {
    return request({
      url: '/test/usecase/move',
      method: 'post',
      data: {
        usecaseIds,
        targetDirectoryId
      }
    })
  },

  /**
   * 获取用例历史记录
   * @param {string} usecaseId 用例ID
   * @param {Object} params 查询参数
   * @returns {Promise} 历史记录列表
   */
  getUsecaseHistory(usecaseId, params) {
    return request({
      url: '/test/usecase/history',
      method: 'get',
      params: {
        usecaseId,
        ...params
      }
    })
  },

  /**
   * 获取用例关联的需求点
   * @param {string} usecaseId 用例ID
   * @returns {Promise} 关联的需求点列表
   */
  getUsecaseRequirePoints(usecaseId) {
    return request({
      url: '/test/usecase/requirepoints',
      method: 'get',
      params: {
        usecaseId
      }
    })
  },

  /**
   * 关联需求点到用例
   * @param {string} usecaseId 用例ID
   * @param {Array} requirePointIds 需求点ID数组
   * @returns {Promise} 关联结果
   */
  linkRequirePointsToUsecase(usecaseId, requirePointIds) {
    return request({
      url: '/test/usecase/linkRequirePoints',
      method: 'post',
      data: {
        usecaseId,
        requirePointIds
      }
    })
  },

  /**
   * 取消关联需求点
   * @param {string} usecaseId 用例ID
   * @param {Array} requirePointIds 需求点ID数组
   * @returns {Promise} 取消关联结果
   */
  unlinkRequirePointsFromUsecase(usecaseId, requirePointIds) {
    return request({
      url: '/test/usecase/unlinkRequirePoints',
      method: 'post',
      data: {
        usecaseId,
        requirePointIds
      }
    })
  }
}
