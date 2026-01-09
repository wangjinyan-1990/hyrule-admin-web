import request from '@/utils/request'

// 创建发版登记（PAT）
export function createPATDeployRecord(data) {
  return request({
    url: '/configuration/deploy/pat/record',
    method: 'post',
    data
  })
}

export default {
  createPATDeployRecord
}

