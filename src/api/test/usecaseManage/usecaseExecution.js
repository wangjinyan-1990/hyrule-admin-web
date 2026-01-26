import request from '@/utils/request'

/**
 * 用例执行库API
 */
export default {
  /**
   * 分页查询执行用例列表
   * @param {Object} params 查询参数
   * @returns {Promise} 分页结果
   */
  getExecutionList(params) {
    return request({
      url: '/test/usecase/execution/list',
      method: 'get',
      params
    })
  },

  /**
   * 获取执行统计信息
   * @param {Object} params 查询参数
   * @returns {Promise} 统计信息
   */
  getExecutionStatistics(params) {
    return request({
      url: '/test/usecase/execution/statistics',
      method: 'get',
      params
    })
  },

  /**
   * 获取执行详情
   * @param {Object} params 查询参数（usecaseExecutionId 或 usecaseId）
   * @returns {Promise} 执行详情
   */
  getExecutionDetail(params) {
    return request({
      url: '/test/usecase/execution/detail',
      method: 'get',
      params
    })
  },

  /**
   * 保存执行用例
   * @param {Object} data 执行用例数据
   * @returns {Promise} 保存结果
   */
  saveExecution(data) {
    return request({
      url: '/test/usecase/execution/save',
      method: 'post',
      data
    })
  },

  /**
   * 更新执行状态
   * @param {Object} data 更新数据（usecaseExecutionId, runStatus）
   * @returns {Promise} 更新结果
   */
  updateRunStatus(data) {
    return request({
      url: '/test/usecase/execution/updateStatus',
      method: 'post',
      data
    })
  },

  /**
   * 导出执行用例列表
   * @param {Object} params 查询参数
   * @returns {Promise} 导出文件
   */
  exportExecutionList(params) {
    return request({
      url: '/test/usecase/execution/export',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
}
