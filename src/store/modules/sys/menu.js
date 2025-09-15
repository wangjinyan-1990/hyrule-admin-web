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
  
  // 检查路由是否在用户菜单权限中
  if (route.meta && route.meta.title) {
    const hasPermission = menus.some(menu => menu.title === route.meta.title)
    console.log(`检查路由权限: ${route.meta.title} -> ${hasPermission}`)
    return hasPermission
  }
  
  // 对于没有title的路由，检查其子路由是否有权限
  if (route.children && route.children.length > 0) {
    const hasValidChildren = route.children.some(child => hasPermission(menus, child))
    console.log(`检查父路由权限: ${route.path} -> ${hasValidChildren}`)
    return hasValidChildren
  }
  
  return false
}

// 过滤异步路由表
export function filterAsyncRoutes(routes, menus) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    console.log(`检查路由: ${tmp.path} (${tmp.meta?.title})`)
    if (hasPermission(menus, tmp)) {
      if (tmp.children) {
        console.log(`过滤子路由: ${tmp.path}`)
        tmp.children = filterAsyncRoutes(tmp.children, menus)
        console.log(`过滤后子路由: ${tmp.path}`, tmp.children)
      }
      res.push(tmp)
      console.log(`✅ 添加路由: ${tmp.path}`)
    } else {
      console.log(`❌ 跳过路由: ${tmp.path}`)
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
  }
}

const actions = {
  generateRoutes({ commit, rootState }, menus) {
    return new Promise(resolve => {
      console.log('=== 生成路由 ===')
      console.log('用户菜单数据:', menus)
      console.log('异步路由配置:', asyncRoutes)
      console.log('用户信息:', rootState.user)
      
      // 检查是否为admin用户
      const userName = rootState.user.name
      const userRoles = rootState.user.roles
      const isAdmin = userName === 'admin' || 
                     userName === '超级管理员' ||
                     userName === 'administrator' ||
                     (Array.isArray(userRoles) && (
                       userRoles.includes('admin') || 
                       userRoles.includes('administrator') ||
                       userRoles.includes('超级管理员')
                     ))
      
      console.log('用户信息:', { userName, userRoles, isAdmin })
      
      let accessedRoutes = []
      
      if (isAdmin) {
        // admin用户显示所有未隐藏的菜单
        console.log('admin用户，显示所有未隐藏菜单')
        accessedRoutes = filterAsyncRoutes(asyncRoutes, [])
      } else {
        // 普通用户根据菜单权限过滤
        accessedRoutes = Array.isArray(menus) && menus.length > 0
          ? filterAsyncRoutes(asyncRoutes, menus)
          : []
      }
      
      console.log('过滤后的路由:', accessedRoutes)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },

  // 获取用户菜单
  getUserMenus({ commit, state }) {
    return new Promise((resolve, reject) => {
      menuApi.getUserMenus().then(response => {
        const { data } = response
        console.log('=== 获取用户菜单 ===')
        console.log('菜单数据:', data)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
