import menuApi from '@/api/menu'
import { constantRoutes, asyncRoutes } from '@/router'

// 将树形菜单数据扁平化
function flattenMenus(menus, result = []) {
  if (!Array.isArray(menus)) {
    return result
  }
  menus.forEach(menu => {
    if (menu) {
      result.push(menu)
      if (menu.children && Array.isArray(menu.children)) {
        flattenMenus(menu.children, result)
      }
    }
  })
  return result
}

// 判断是否有权限访问路由
function hasPermission(menus, route) {
  // 如果没有菜单数据，检查是否为admin用户（通过传入空数组来判断）
  if (!menus || menus.length === 0) {
    // 如果是admin用户（传入空数组），显示所有未隐藏的菜单
    if (route.meta && route.meta.hidden) {
      return false // 隐藏的菜单不显示
    }
    return true // admin用户显示所有未隐藏的菜单
  }
  
  // 对于有子路由的父路由，先递归检查子路由是否有权限
  // 这样即使父菜单或中间层菜单不在权限列表中，只要最终子菜单有权限，父菜单也会显示
  if (route.children && route.children.length > 0) {
    // 递归检查所有子路由（包括多层嵌套）
    const hasValidChildren = route.children.some(child => hasPermission(menus, child))
    if (hasValidChildren) {
      return true // 如果任何子路由有权限，父路由也显示
    }
  }
  
  // 检查路由是否在用户菜单权限中
  if (route.meta && route.meta.title) {
    // 支持菜单数据中的 title 字段匹配
    const hasPermission = menus.some(menu => {
      // 支持 menu.title 或 menu.menuName 字段
      const menuTitle = menu.title || menu.menuName || ''
      return menuTitle === route.meta.title
    })
    return hasPermission
  }
  
  return false
}

// 过滤异步路由表
export function filterAsyncRoutes(routes, menus) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    // 检查当前路由是否有权限（包括通过子路由间接有权限的情况）
    if (hasPermission(menus, tmp)) {
      // 如果有权限，再递归过滤子路由
      if (tmp.children && tmp.children.length > 0) {
        tmp.children = filterAsyncRoutes(tmp.children, menus)
        // 如果过滤后子路由为空，但原路由有子路由，且当前路由本身不在权限列表中
        // 说明是通过子路由间接有权限的，但子路由被过滤掉了，所以当前路由也应该被过滤掉
        if (tmp.children.length === 0) {
          // 检查当前路由本身是否在权限列表中
          const routeInMenus = tmp.meta && tmp.meta.title && menus.some(menu => {
            const menuTitle = menu.title || menu.menuName || ''
            return menuTitle === tmp.meta.title
          })
          if (!routeInMenus) {
            // 当前路由本身不在权限列表中，且子路由都被过滤掉了，跳过该路由
            return
          }
        }
      }
      res.push(tmp)
    }
  })
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  RESET_STATE: (state) => {
    state.routes = []
    state.addRoutes = []
  }
}

const actions = {
  generateRoutes({ commit, rootState }, menus) {
    return new Promise(resolve => {
      // 检查是否为admin用户
      const userName = rootState.user.userName
      const userId = rootState.user.userId
      const isAdmin = (userName === '超级管理员' || userId === 'admin')
      
      let accessedRoutes = []
      if (isAdmin) {
        // admin用户显示所有未隐藏的菜单
        accessedRoutes = filterAsyncRoutes(asyncRoutes, [])
      } else {
        // 普通用户：根据菜单权限过滤
        // 如果菜单数据是树形结构，先扁平化
        const flatMenus = Array.isArray(menus) ? flattenMenus(menus) : []
        accessedRoutes = filterAsyncRoutes(asyncRoutes, flatMenus)
      }
      
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },

  // 获取用户菜单
  getUserMenus({ commit, state }) {
    return new Promise((resolve, reject) => {
      menuApi.getUserMenus().then(response => {
        const { data } = response
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 重置菜单状态
  resetState({ commit }) {
    commit('RESET_STATE')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
