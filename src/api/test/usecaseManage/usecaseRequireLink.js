import request from '@/utils/request'
/**
 * 需求点用例关联API
 */
export default {
  /**
   * 获取需求点关联的测试用例
   * @param {string} requirePointId 需求点ID
   * @returns {Promise} 关联的测试用例列表
   */
  getRequirePointTestCases(requirePointId) {
    return request({
      url: '/test/usecaseRequireLink/testcases',
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
      url: '/test/usecaseRequireLink/linkTestCases',
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
      url: '/test/usecaseRequireLink/unlinkTestCases',
      method: 'post',
      data: {
        requirePointId,
        testCaseIds
      }
    })
  }

}
