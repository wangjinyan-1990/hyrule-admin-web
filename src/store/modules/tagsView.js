const state = {
  visitedViews: [],
  cachedViews: []
}

const mutations = {
  ADD_VISITED_VIEW(state, view) {
    console.log('=== 尝试添加标签页 ===')
    console.log('路由名称:', view.name)
    console.log('路由路径:', view.path)
    console.log('完整路径:', view.fullPath)
    console.log('路由元信息:', view.meta)
    console.log('是否有children:', view.children ? view.children.length : 'no children')
    console.log('是否有redirect:', view.redirect)
    
    if (state.visitedViews.some(v => v.path === view.path)) {
      console.log('❌ 标签页已存在，跳过:', view.name)
      return
    }
    
    // 过滤掉中间层路由，只显示最终的子路由
    if (view.meta && view.meta.hidden) {
      console.log('❌ 跳过隐藏路由:', view.name)
      return
    }
    
    // 过滤掉有redirect的路由（中间层路由）
    if (view.redirect) {
      console.log('❌ 跳过重定向路由:', view.name)
      return
    }
    
    // 过滤掉有children的路由（中间层路由）
    if (view.children && view.children.length > 0) {
      console.log('❌ 跳过有子路由的路由:', view.name)
      return
    }
    
    // 特殊过滤：过滤掉特定的中间层路由
    if (view.name === 'baseManage' || view.name === 'test') {
      console.log('❌ 跳过特定中间层路由:', view.name)
      return
    }
    
    console.log('✅ 添加标签页:', view.name)
    state.visitedViews.push({
      name: view.name,
      path: view.path,
      fullPath: view.fullPath || view.path,
      title: view.meta && view.meta.title ? view.meta.title : (view.name || 'no-name')
    })
    console.log('当前标签页列表:', state.visitedViews.map(v => ({ name: v.name, path: v.path })))
  },
  ADD_CACHED_VIEW(state, view) {
    const name = view.name
    if (!name) return
    if (view.meta && view.meta.noCache) return
    if (state.cachedViews.includes(name)) return
    state.cachedViews.push(name)
  },
  DEL_VISITED_VIEW(state, view) {
    state.visitedViews = state.visitedViews.filter(v => v.path !== view.path)
  },
  DEL_CACHED_VIEW(state, view) {
    const name = view.name
    state.cachedViews = state.cachedViews.filter(n => n !== name)
  },
  DEL_OTHERS_VIEWS(state, view) {
    state.visitedViews = state.visitedViews.filter(v => v.path === view.path)
    state.cachedViews = state.cachedViews.filter(n => n === view.name)
  },
  DEL_ALL_VIEWS(state) {
    state.visitedViews = []
    state.cachedViews = []
  }
}

const actions = {
  addView({ commit }, view) {
    commit('ADD_VISITED_VIEW', view)
    commit('ADD_CACHED_VIEW', view)
  },
  delView({ commit }, view) {
    commit('DEL_VISITED_VIEW', view)
    commit('DEL_CACHED_VIEW', view)
  },
  delOthersViews({ commit }, view) {
    commit('DEL_OTHERS_VIEWS', view)
  },
  delAllViews({ commit }) {
    commit('DEL_ALL_VIEWS')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}


