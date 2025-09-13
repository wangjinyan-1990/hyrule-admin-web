import menuApi from '@/api/menu'
import { constantRoutes, asyncRoutes } from '@/router'

// 判断是否有权限访问路由
function hasPermission(menus, route) {
  if (route.meta && route.meta.title) {
    return menus.some(menu => menu.title === route.meta.title)
  } else {
    return true
  }
}

// 过滤异步路由表
export function filterAsyncRoutes(routes, menus) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(menus, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, menus)
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
  }
}

const actions = {
  generateRoutes({ commit }, menus) {
    return new Promise(resolve => {
      const accessedRoutes = Array.isArray(menus) && menus.length > 0
        ? filterAsyncRoutes(asyncRoutes, menus)
        : asyncRoutes
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
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
