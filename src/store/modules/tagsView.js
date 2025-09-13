const state = {
  visitedViews: [],
  cachedViews: []
}

const mutations = {
  ADD_VISITED_VIEW(state, view) {
    if (state.visitedViews.some(v => v.path === view.path)) return
    state.visitedViews.push({
      name: view.name,
      path: view.path,
      fullPath: view.fullPath || view.path,
      title: view.meta && view.meta.title ? view.meta.title : (view.name || 'no-name')
    })
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


