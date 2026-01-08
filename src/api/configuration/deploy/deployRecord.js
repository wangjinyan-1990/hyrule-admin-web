import request from '@/utils/request'

// 获取发版登记列表
export function getDeployRecordList(params) {
  return request({
    url: '/configuration/deploy/record/list',
    method: 'get',
    params
  })
}

// 删除发版登记
export function deleteDeployRecord(deployId) {
  return request({
    url: `/configuration/deploy/record/${deployId}`,
    method: 'delete'
  })
}

// 更新发版登记
export function updateDeployRecord(data) {
  return request({
    url: '/configuration/deploy/record',
    method: 'put',
    data
  })
}

// 获取发版登记详情
export function getDeployRecordDetail(deployId) {
  return request({
    url: `/configuration/deploy/record/${deployId}`,
    method: 'get'
  })
}

export default {
  getDeployRecordList,
  deleteDeployRecord,
  updateDeployRecord,
  getDeployRecordDetail
}
