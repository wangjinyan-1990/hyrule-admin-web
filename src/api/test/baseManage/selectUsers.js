import request from '@/utils/request'

/**
 * 根据系统ID选择用户相关API
 */
export default {
  /**
   * 根据系统ID获取测试人员列表
   * @param {string} systemId 系统ID
   * @returns {Promise} 测试人员列表
   */
  getTestersBySystemId(systemId) {
    return request({
      url: '/test/systemUser/testers',
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
      url: '/test/systemUser/developers',
      method: 'get',
      params: {
        systemId
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
      url: '/test/systemUser/devLeaders',
      method: 'get',
      params: {
        systemId
      }
    })
  }
}

