const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  permission_routes: state => state.menu && state.menu.routes,
  visitedViews: state => state.tagsView && state.tagsView.visitedViews,
  cachedViews: state => state.tagsView && state.tagsView.cachedViews
}
export default getters
