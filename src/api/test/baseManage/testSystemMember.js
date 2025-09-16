import request from '@/utils/request'

export default {
  // 根据角色ID获取用户列表
  getUsersByRoleId(roleId, searchModel) {
    return request({
      url: '/test/systemUser/getUsersByRoleId',
      method: 'get',
      params: {
        roleId: roleId,
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
        userName: searchModel.userName,
        loginName: searchModel.loginName,
        phone: searchModel.phone
      }
    });
  },

  // 更新用户信息
  updateUser(userData) {
    return request({
      url: '/test/systemUser/update',
      method: 'put',
      data: userData
    });
  }
}
