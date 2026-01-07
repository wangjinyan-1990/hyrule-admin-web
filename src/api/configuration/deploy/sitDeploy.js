import request from '@/utils/request'

// 解析Merge_Request
export function parseMergeRequest(mergeRequest, systemId) {
  return request({
    url: '/configuration/deploy/sit/parseMR',
    method: 'post',
    data: { mergeRequest, systemId }
  })
}

export default {
  parseMergeRequest
}
