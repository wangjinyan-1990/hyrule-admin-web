import menuApi from '@/api/menu'
import { constantRoutes, asyncRoutes } from '@/router'

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
  
  // 对于有子路由的父路由，先检查子路由是否有权限
  // 这样即使父菜单不在权限列表中，只要子菜单有权限，父菜单也会显示
  if (route.children && route.children.length > 0) {
    const hasValidChildren = route.children.some(child => hasPermission(menus, child))
    if (hasValidChildren) {
      return true // 如果子路由有权限，父路由也显示
    }
  }
  
  // 检查路由是否在用户菜单权限中
  if (route.meta && route.meta.title) {
    const hasPermission = menus.some(menu => menu.title === route.meta.title)
    // console.log(`检查路由权限: ${route.meta.title} -> ${hasPermission}`)
    return hasPermission
  }
  
  return false
}

// 过滤异步路由表
export function filterAsyncRoutes(routes, menus) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    // console.log(`检查路由: ${tmp.path} (${tmp.meta?.title})`)
    if (hasPermission(menus, tmp)) {
      if (tmp.children) {
        // console.log(`过滤子路由: ${tmp.path}`)
        tmp.children = filterAsyncRoutes(tmp.children, menus)
        // console.log(`过滤后子路由: ${tmp.path}`, tmp.children)
      }
      res.push(tmp)
      // console.log(`✅ 添加路由: ${tmp.path}`)
    } else {
      // console.log(`❌ 跳过路由: ${tmp.path}`)
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
      // console.log('=== 生成路由 ===')
      // console.log('用户菜单数据:', menus)
      // console.log('异步路由配置:', asyncRoutes)
      // console.log('用户信息:', rootState.user)
      // 检查是否为admin用户
      const userName = rootState.user.userName
      const userId = rootState.user.userId
      const isAdmin = (userName === '超级管理员' || userId === 'admin')
      // console.log('用户信息:', { userName, userId, isAdmin })
      let accessedRoutes = []
      if (isAdmin) {
        // admin用户显示所有未隐藏的菜单
        // console.log('admin用户，显示所有未隐藏菜单')
        accessedRoutes = filterAsyncRoutes(asyncRoutes, [])
      } else {
        // 普通用户：优先显示测试模块，然后根据菜单权限过滤
        // console.log('普通用户，优先显示测试模块')
        accessedRoutes = filterAsyncRoutes(asyncRoutes, menus || [])
      }
      // console.log('过滤后的路由:', accessedRoutes)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },

  // 获取用户菜单
  getUserMenus({ commit, state }) {
    return new Promise((resolve, reject) => {
      menuApi.getUserMenus().then(response => {
        const { data } = response
        // console.log('=== 获取用户菜单 ===')
        // console.log('菜单数据:', data)
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
