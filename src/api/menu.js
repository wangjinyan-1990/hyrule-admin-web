import request from '@/utils/request'

export function getUserMenus() {
  return request({
    url: '/sys/menu/getUserMenus',
    method: 'get'
  })
}

// 管理端：获取全部菜单（扁平列表）
export function getAllMenus() {
  return request({
    url: '/sys/menu/listAll',
    method: 'get'
  })
}

// 管理端：新增菜单
export function createMenu(data) {
  return request({
    url: '/sys/menu/create',
    method: 'post',
    data
  })
}

// 管理端：更新菜单
export function updateMenu(data) {
  return request({
    url: '/sys/menu/update',
    method: 'put',
    data
  })
}

// 管理端：删除菜单
export function deleteMenu(menuId) {
  return request({
    url: '/sys/menu/delete',
    method: 'delete',
    params: { menuId }
  })
}

// 管理端：按父ID查询子菜单
export function getMenusByParentId(parentId) {
  return request({
    url: '/sys/menu/listByParent',
    method: 'get',
    params: { parentId }
  })
}
