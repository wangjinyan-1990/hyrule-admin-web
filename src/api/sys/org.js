import request from '@/utils/request'

export default {
  // 获取机构树形列表
  getOrgTree() {
    return request({
      url: '/sys/org/tree',
      method: 'get'
    })
  },

  // 获取机构列表（扁平）
  getOrgList(searchModel) {
    return request({
      url: '/sys/org/list',
      method: 'get',
      params: {
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
        orgName: searchModel.orgName,
        orgStatus: searchModel.orgStatus
      }
    })
  },

  // 创建机构
  createOrg(org) {
    return request({
      url: '/sys/org/create',
      method: 'post',
      data: org
    })
  },

  // 更新机构
  updateOrg(org) {
    return request({
      url: '/sys/org/update',
      method: 'put',
      data: org
    })
  },

  // 删除机构
  deleteOrg(orgId) {
    return request({
      url: '/sys/org/delete',
      method: 'delete',
      params: { orgId }
    })
  },

  // 获取机构详情
  getOrgDetail(orgId) {
    return request({
      url: '/sys/org/detail',
      method: 'get',
      params: { orgId }
    })
  }
}
