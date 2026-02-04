import request from '@/utils/request'

/**
 * 缺陷管理API
 */
export default {
  /**
   * 分页查询缺陷列表
   * @param {Object} params 查询参数
   * @returns {Promise} 分页结果
   */
  getBugList(params) {
    return request({
      url: '/test/bug/list',
      method: 'get',
      params
    })
  },

  /**
   * 获取缺陷详情
   * @param {string} bugId 缺陷ID
   * @returns {Promise} 缺陷详情
   */
  getBugDetail(bugId) {
    return request({
      url: `/test/bug/${bugId}`,
      method: 'get'
    })
  },

  /**
   * 创建缺陷
   * @param {Object} data 缺陷数据
   * @returns {Promise} 创建结果
   */
  createBug(data) {
    return request({
      url: '/test/bug/save',
      method: 'post',
      data
    })
  },

  /**
   * 更新缺陷
   * @param {string} bugId 缺陷ID
   * @param {Object} data 缺陷数据
   * @returns {Promise} 更新结果
   */
  updateBug(bugId, data) {
    return request({
      url: `/test/bug/${bugId}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除缺陷
   * @param {string} bugId 缺陷ID
   * @returns {Promise} 删除结果
   */
  deleteBug(bugId) {
    return request({
      url: `/test/bug/delete`,
      method: 'delete',
      params: {
        bugId
      }
    })
  },

  /**
   * 批量删除缺陷
   * @param {Array<string>} bugIds 缺陷ID列表
   * @returns {Promise} 删除结果
   */
  batchDeleteBugs(bugIds) {
    return request({
      url: '/test/bug/batch/delete',
      method: 'delete',
      data: { bugIds }
    })
  },

  /**
   * 导出缺陷列表
   * @param {Object} params 查询参数
   * @returns {Promise} 导出文件
   */
  exportBugList(params) {
    return request({
      url: '/test/bug/export',
      method: 'get',
      params,
      responseType: 'blob'
    })
  },

  /**
   * 获取缺陷历史记录
   * @param {string} bugId 缺陷ID
   * @param {Object} params 分页参数
   * @returns {Promise} 历史记录列表
   */
  getBugHistory(bugId, params) {
    return request({
      url: `/test/bug/${bugId}/history`,
      method: 'get',
      params
    })
  },

  /**
   * 获取关联的缺陷列表
   * @param {Object} params 查询参数（usecaseId, directoryId, currentPage, pageSize）
   * @returns {Promise} 关联缺陷列表
   */
  getRelatedBugs(params) {
    return request({
      url: '/test/bug/relatedBugs',
      method: 'get',
      params
    })
  },

  /**
   * 获取所有缺陷状态
   * @returns {Promise} 缺陷状态列表（包含 bugStateCode, bugStateName）
   */
  getAllBugState() {
    return request({
      url: '/test/bug/getAllBugState',
      method: 'get'
    })
  },

  /**
   * 获取下一步可变更的状态
   * @param {string} bugId 缺陷ID
   * @returns {Promise} 可变更的状态列表（根据当前状态和用户角色过滤）
   */
  getNextAvailableStates(bugId) {
    return request({
      url: `/test/bug/nextStates`,
      method: 'get',
      params: {
        bugId
      }
    })
  },

  /**
   * 根据系统ID获取开发组长列表
   * @param {string} systemId 系统ID
   * @returns {Promise} 开发组长列表
   */
  getDevLeadersBySystemId(systemId) {
    return request({
      url: `/test/bug/devLeaders`,
      method: 'get',
      params: {
        systemId
      }
    })
  },

  /**
   * 根据系统ID获取开发人员列表
   * @param {string} systemId 系统ID
   * @returns {Promise} 开发人员列表
   */
  getDevelopersBySystemId(systemId) {
    return request({
      url: `/test/bug/developers`,
      method: 'get',
      params: {
        systemId
      }
    })
  },

  /**
   * 根据系统ID获取验证人列表
   * @param {string} systemId 系统ID
   * @returns {Promise} 验证人列表
   */
  getCheckersBySystemId(systemId) {
    return request({
      url: `/test/bug/checkers`,
      method: 'get',
      params: {
        systemId
      }
    })
  }

}
