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

// 导出环境清单
export function exportEnvironmentList(params) {
  return request({
    url: '/env/environmentList/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

// 导入环境清单
export function importEnvironmentList(formData) {
  return request({
    url: '/env/environmentList/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 下载导入模板
export function downloadImportTemplate() {
  return request({
    url: '/env/environmentList/template',
    method: 'get',
    responseType: 'blob'
  })
}

export default {
  getEnvironmentList,
  getEnvironmentListDetail,
  createEnvironmentList,
  updateEnvironmentList,
  deleteEnvironmentList,
  exportEnvironmentList,
  importEnvironmentList,
  downloadImportTemplate
}
