import request from '@/utils/request'

export default {
  getUserMenus() {
    return request({
      url: '/sys/menu/getUserMenus',
      method: 'get'
    })
  },

  // 管理端：获取全部菜单（扁平列表）
  getAllMenus() {
    return request({
      url: '/sys/menu/listAll',
      method: 'get'
    })
  },

  // 管理端：新增菜单
  createMenu(data) {
    return request({
      url: '/sys/menu/create',
      method: 'post',
      data
    })
  },

  // 管理端：更新菜单
  updateMenu(data) {
    return request({
      url: '/sys/menu/update',
      method: 'put',
      data
    })
  },

  // 管理端：删除菜单
  deleteMenu(menuId) {
    return request({
      url: '/sys/menu/delete',
      method: 'delete',
      params: { menuId }
    })
  },

  // 管理端：按父ID查询子菜单
  getMenusByParentId(parentId) {
    return request({
      url: '/sys/menu/listByParent',
      method: 'get',
      params: { parentId }
    })
  },

  // 获取角色已分配的菜单ID列表
  getRoleMenus(roleId) {
    return request({
      url: '/sys/menu/getMenusByRole',
      method: 'get',
      params: { roleId }
    })
  },
  // 保存角色的菜单授权
  saveRoleMenus(roleId, menuIds) {
    return request({
      url: '/sys/menu/saveRoleMenus',
      method: 'post',
      data: { roleId, menuIds }
    })
  }

}
