import request from '@/utils/request'

// 获取环境清单列表
export function getEnvironmentList(params) {
  return request({
    url: '/env/environmentList/list',
    method: 'get',
    params
  })
}

// 获取环境清单详情
export function getEnvironmentListDetail(envListId) {
  return request({
    url: `/env/environmentList/${envListId}`,
    method: 'get'
  })
}

// 创建环境清单
export function createEnvironmentList(data) {
  return request({
    url: '/env/environmentList',
    method: 'post',
    data
  })
}

// 更新环境清单
export function updateEnvironmentList(data) {
  return request({
    url: '/env/environmentList',
    method: 'put',
    data
  })
}

// 删除环境清单
export function deleteEnvironmentList(envListId) {
  return request({
    url: `/env/environmentList/${envListId}`,
    method: 'delete'
  })
}

export default {
  getEnvironmentList,
  getEnvironmentListDetail,
  createEnvironmentList,
  updateEnvironmentList,
  deleteEnvironmentList
}
