import request from '@/utils/request'

// 获取系统配置信息列表
export function getSysConfigInfoList(params) {
  return request({
    url: '/configuration/sysConfigInfo/list',
    method: 'get',
    params
  })
}

// 获取系统配置信息详情
export function getSysConfigInfoDetail(configurationId) {
  return request({
    url: `/configuration/sysConfigInfo/${configurationId}`,
    method: 'get'
  })
}

// 创建系统配置信息
export function createSysConfigInfo(data) {
  return request({
    url: '/configuration/sysConfigInfo',
    method: 'post',
    data
  })
}

// 更新系统配置信息
export function updateSysConfigInfo(data) {
  return request({
    url: '/configuration/sysConfigInfo',
    method: 'put',
    data
  })
}

// 删除系统配置信息
export function deleteSysConfigInfo(configurationId) {
  return request({
    url: `/configuration/sysConfigInfo/${configurationId}`,
    method: 'delete'
  })
}

export default {
  getSysConfigInfoList,
  getSysConfigInfoDetail,
  createSysConfigInfo,
  updateSysConfigInfo,
  deleteSysConfigInfo
}
