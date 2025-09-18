const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  userId: state => state.user.userId,
  avatar: state => state.user.avatar,
  userName: state => state.user.userName,
  roleIds: state => state.user.roleIds,
  permission_routes: state => state.menu && state.menu.routes,
  visitedViews: state => state.tagsView && state.tagsView.visitedViews,
  cachedViews: state => state.tagsView && state.tagsView.cachedViews
}
export default getters
