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
   * @param {Object} params 查询参数usecaseExecutionId
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
   * 添加用例到执行库
   * @param {Object} data 用例数据
   * @returns {Promise} 添加结果
   */
  addToExecution(data) {
    return request({
      url: '/test/usecase/execution/add',
      method: 'post',
      data
    })
  },

  /**
   * 更新执行状态
   * @param {Object} data 更新数据（usecaseExecutionId, runStatus, remark）
   * @returns {Promise} 更新结果，包含 usecaseExecutionHistoryId
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
  },

  /**
   * 获取历史执行记录列表
   * @param {Object} params 查询参数（directoryId, usecaseId）
   * @returns {Promise} 历史执行记录列表
   */
  getExecutionHistory(params) {
    return request({
      url: '/test/usecase/execution/history',
      method: 'get',
      params
    })
  },

  /**
   * 删除执行用例
   * @param {string} usecaseExecutionId 用例执行ID
   * @returns {Promise} 删除结果
   */
  deleteExecution(usecaseExecutionId) {
    return request({
      url: `/test/usecase/execution/${usecaseExecutionId}`,
      method: 'delete'
    })
  },

  /**
   * 移动执行用例到其他目录
   * @param {Array} usecaseExecutionIds 用例执行ID数组
   * @param {string} targetDirectoryId 目标目录ID
   * @returns {Promise} 移动结果
   */
  moveExecutions(usecaseExecutionIds, targetDirectoryId) {
    return request({
      url: '/test/usecase/execution/move',
      method: 'post',
      data: {
        usecaseExecutionIds,
        targetDirectoryId
      }
    })
  },

  /**
   * 批量更新执行状态
   * @param {Object} data 更新数据
   * @param {Array} data.usecaseExecutionIds 用例执行ID数组
   * @param {string} data.runStatus 执行状态
   * @param {string} data.remark 执行备注
   * @returns {Promise} 更新结果
   */
  batchUpdateRunStatus(data) {
    return request({
      url: '/test/usecase/execution/batchUpdateStatus',
      method: 'post',
      data
    })
  },

  /**
   * 批量更新计划执行信息
   * @param {Object} data 更新数据
   * @param {Array} data.usecaseExecutionIds 用例执行ID数组
   * @param {string} data.planExecutorId 计划执行人ID
   * @param {string} data.planExecutionDate 计划执行日期
   * @returns {Promise} 更新结果
   */
  batchUpdatePlanExecution(data) {
    return request({
      url: '/test/usecase/execution/batchUpdatePlan',
      method: 'post',
      data
    })
  }

}
