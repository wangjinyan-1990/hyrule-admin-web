import request from '@/utils/request'

// 解析Merge_Request
export function parseMergeRequest(mergeRequest, systemId) {
  return request({
    url: '/configuration/deploy/sit/parseMR',
    method: 'post',
    data: { mergeRequest, systemId }
  })
}

// 创建发版登记（SIT）
// data 参数包括：testStage, systemId, componentInfo, versionCode, recordNum, codeList, 
// isRunSql, isUpdateConfig, sendTestCode, mergeRequest, deployTime 等
export function createSITDeployRecord(data) {
  return request({
    url: '/configuration/deploy/sit/record',
    method: 'post',
    data
  })
}

// 更新发版登记（SIT）
export function updateSITDeployRecord(data) {
  return request({
    url: '/configuration/deploy/sit/record',
    method: 'put',
    data
  })
}

// 获取发版登记详情（SIT）
export function getSITDeployRecordDetail(deployId) {
  return request({
    url: `/configuration/deploy/sit/record/${deployId}`,
    method: 'get'
  })
}

export default {
  parseMergeRequest,
  createSITDeployRecord,
  updateSITDeployRecord,
  getSITDeployRecordDetail
}
