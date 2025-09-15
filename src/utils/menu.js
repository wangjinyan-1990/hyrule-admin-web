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

  // 普通页面组件 - 使用更具体的路径映射避免webpack尝试加载不存在的模块
  const componentMap = {
    '/sys/user': () => import('@/views/sys/user'),
    '/sys/role': () => import('@/views/sys/role'),
    '/sys/menu': () => import('@/views/sys/menu'),
    '/sys/org': () => import('@/views/sys/org'),
    '/test/baseManage/test2': () => import('@/views/test/baseManage/testSystemMember'),
    '/test/baseManage/test3': () => import('@/views/test/baseManage/test3'),
    '/example/table': () => import('@/views/table/index'),
    '/example/tree': () => import('@/views/tree/index'),
    '/form/index': () => import('@/views/form/index'),
    '/nested/menu1/index': () => import('@/views/nested/menu1/index'),
    '/nested/menu1/menu1-1': () => import('@/views/nested/menu1/menu1-1/index'),
    '/nested/menu1/menu1-2': () => import('@/views/nested/menu1/menu1-2/index'),
    '/nested/menu1/menu1-2/menu1-2-1': () => import('@/views/nested/menu1/menu1-2/menu1-2-1/index'),
    '/nested/menu1/menu1-2/menu1-2-2': () => import('@/views/nested/menu1/menu1-2/menu1-2-2/index'),
    '/nested/menu1/menu1-3': () => import('@/views/nested/menu1/menu1-3/index'),
    '/nested/menu2/index': () => import('@/views/nested/menu2/index')
  }

  // 如果在映射中找到了对应的组件，返回对应的导入函数
  if (componentMap[component]) {
    return componentMap[component]
  }

  // 如果没有找到，返回404页面
  console.warn(`Component not found: ${component}`)
  return () => import('@/views/404')
}
