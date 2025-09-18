import request from '@/utils/request'

export default {
  // 根据用户ID获取系统目录
  getSystemsByUserId(userId) {
    return request({
      url: `/test/directory/getSystemsByUserId`,
      method: 'get',
      params: {
        userId: userId
      }
    })
  },

  // 新增目录
  createDirectory(data) {
    return request({
      url: `/test/directory/create`,
      method: 'post',
      data: data
    })
  },

  // 编辑目录
  updateDirectory(data) {
    return request({
      url: `/test/directory/update`,
      method: 'put',
      data: data
    })
  },

  // 删除目录
  deleteDirectory(directoryId) {
    return request({
      url: `/test/directory/delete/${directoryId}`,
      method: 'delete'
    })
  },

  // 根据父目录ID和系统ID查询子目录
  getChildrenByParentId(directoryParentId, systemId) {
    return request({
      url: `/test/directory/getChildrenByParentId`,
      method: 'get',
      params: {
        directoryParentId: directoryParentId,
        systemId: systemId
      }
    })
  }
}
