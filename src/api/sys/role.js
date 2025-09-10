import request from '@/utils/request'

export default {
  // 获取角色列表
  getRoleList(searchModel){
    return request({
      url: '/sys/role/list',
      method: 'get',
      params:{
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
        roleName: searchModel.roleName
      }
    });
  },
  // 创建角色
  createRole(role){
    return request({
      url: '/sys/role/create',
      method: 'post',
      data: role
    });
  },
  // 编辑角色
  updateRole(role){
    return request({
      url: '/sys/role/update',
      method: 'put',
      data: role
    });
  },
  // 删除角色
  deleteRole(roleId){
    return request({
      url: '/sys/role/delete',
      method: 'delete',
      params: {
        roleId: roleId
      }
    });
  },
  // 获取角色的用户列表
  getRoleUsers(roleId, searchModel){
    return request({
      url: '/sys/role/users',
      method: 'get',
      params: {
        roleId: roleId,
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
        userName: searchModel.userName
      }
    });
  },
  // 删除用户角色
  removeUserRole(roleId, userId){
    return request({
      url: '/sys/role/removeUser',
      method: 'delete',
      params: {
        roleId: roleId,
        userId: userId
      }
    });
  },
  // 添加用户角色
  addUserRole(roleId, userId){
    return request({
      url: '/sys/role/addUser',
      method: 'post',
      data: {
        roleId: roleId,
        userId: userId
      }
    });
  },
  // 获取可选用户列表（未拥有该角色的用户）
  getAvailableUsers(roleId, searchModel){
    return request({
      url: '/sys/role/availableUsers',
      method: 'get',
      params: {
        roleId: roleId,
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
        userName: searchModel.userName
      }
    });
  }
}
