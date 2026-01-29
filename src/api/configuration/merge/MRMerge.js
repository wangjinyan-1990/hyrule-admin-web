import request from '@/utils/request'

// 解析Merge_Request
export function parseMergeRequest(mergeRequest, systemId) {
  return request({
    url: '/configuration/merge/MRMerge/parseMR',
    method: 'post',
    data: { mergeRequest, systemId }
  })
}

// 创建发版登记（SIT）
// data 参数包括：testStage, systemId, componentInfo, versionCode, recordNum, codeList,
// isRunSql, isUpdateConfig, sendTestInfo, mergeRequest, deployTime 等
export function createSITDeployRecord(data) {
  return request({
    url: '/configuration/merge/MRMerge/record',
    method: 'post',
    data
  })
}

export default {
  parseMergeRequest,
  createSITDeployRecord
}
