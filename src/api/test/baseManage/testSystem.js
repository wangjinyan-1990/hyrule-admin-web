import request from '@/utils/request'

// 获取测试系统列表
export function getTestSystemList(params) {
  return request({
    url: '/test/system/list',
    method: 'get',
    params
  })
}

// 获取测试系统详情
export function getTestSystemDetail(systemId) {
  return request({
    url: `/test/system/${systemId}`,
    method: 'get'
  })
}

// 创建测试系统
export function createTestSystem(data) {
  return request({
    url: '/test/system',
    method: 'post',
    data
  })
}

// 更新测试系统
export function updateTestSystem(data) {
  return request({
    url: '/test/system',
    method: 'put',
    data
  })
}

// 删除测试系统
export function deleteTestSystem(systemId) {
  return request({
    url: `/test/system/${systemId}`,
    method: 'delete'
  })
}

// 批量删除测试系统
export function batchDeleteTestSystem(systemIds) {
  return request({
    url: '/test/system/batch',
    method: 'delete',
    data: { systemIds }
  })
}

export default {
  getTestSystemList,
  getTestSystemDetail,
  createTestSystem,
  updateTestSystem,
  deleteTestSystem,
  batchDeleteTestSystem
}
