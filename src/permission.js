import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // 记录最近一次的有效访问路径，避免刷新后落入 /404
  if (to.path !== '/404') {
    try { sessionStorage.setItem('lastPath', to.fullPath || to.path) } catch (e) {}
  }

  // determine whether the user has logged in
  const hasToken = getToken()

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = store.getters.userName
      if (hasGetUserInfo) {
        // 如果误入 /404，且已登录，尝试跳回上次页面或首页
        if (to.path === '/404') {
          const lastPath = sessionStorage.getItem('lastPath')
          next({ path: lastPath && lastPath !== '/404' ? lastPath : '/' })
        } else {
          next()
        }
      } else {
        try {
          // get user info
          await store.dispatch('user/getUserInfo')
          // 加载菜单数据并设置到store中，但不动态添加路由
          const menus = await store.dispatch('menu/getUserMenus')
          const accessRoutes = await store.dispatch('menu/generateRoutes', menus)
          // 不调用 router.addRoutes(accessRoutes)，避免路由重复定义
          // 但是需要确保路由已经存在于静态配置中
          // 检查路由是否存在

          // 刷新后定位到原路径；若原路径是 /404，则退回到上次路径或首页
          if (to.path === '/404') {
            const lastPath = sessionStorage.getItem('lastPath')
            next({ path: lastPath && lastPath !== '/404' ? lastPath : '/', replace: true })
          } else {
            next({ ...to, replace: true })
          }
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
