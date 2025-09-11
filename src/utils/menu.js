/**
 * 将扁平化菜单数据转换为树形结构
 * @param {Array} menus - 菜单列表
 * @param {Number} parentId - 父级ID
 * @returns {Array} 树形菜单结构
 */
export function buildMenuTree(menus, parentId = 0) {
  const menuTree = []
  menus.forEach(menu => {
    if (menu.parentId === parentId) {
      const children = buildMenuTree(menus, menu.menuId)
      if (children.length > 0) {
        menu.children = children
      }
      menuTree.push(menu)
    }
  })
  return menuTree
}

/**
 * 将后端菜单数据转换为前端路由格式
 * @param {Array} menus - 菜单列表
 * @returns {Array} 路由配置
 */
export function convertMenuToRoutes(menus) {
  return menus.map(menu => {
    const route = {
      path: menu.path,
      component: resolveComponent(menu.component),
      name: menu.name,
      meta: {
        title: menu.title,
        icon: menu.icon,
        hidden: menu.hidden === 1
      }
    }

    if (menu.redirect) {
      route.redirect = menu.redirect
    }

    if (menu.children && menu.children.length > 0) {
      route.children = convertMenuToRoutes(menu.children)
    }

    return route
  })
}

/**
 * 解析组件路径
 * @param {String} component - 组件路径
 * @returns {Function} 组件导入函数
 */
function resolveComponent(component) {
  if (!component) return () => import('@/views/404')

  // 如果是布局组件
  if (component === 'Layout') {
    return () => import('@/layout')
  }

  // 普通页面组件
  return () => import(`@/views${component}`)
}
