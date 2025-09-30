import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

// 异步路由：根据权限或后端菜单动态过滤
export const asyncRoutes = [
  {
    path: '/sys',
    component: Layout,
    name: 'userManage',
    meta: { title: '系统管理', icon: 'sys' },
    children: [
      {
        path: 'user',
        name: 'user',
        component: () => import('@/views/sys/user'),
        meta: { title: '用户管理', icon: 'userManage' }
      },
      {
        path: 'role',
        name: 'role',
        component: () => import('@/views/sys/role'),
        meta: { title: '角色管理', icon: 'roleManage' }
      },
      {
        path: 'menu',
        name: 'menu',
        component: () => import('@/views/sys/menu'),
        meta: { title: '菜单管理', icon: 'menuManage' }
      },
      {
        path: 'org',
        name: 'org',
        component: () => import('@/views/sys/org'),
        meta: { title: '机构管理', icon: 'orgManage' }
      }
    ]
  },

  {
    path: '/test',
    component: Layout,
    name: 'test',
    meta: { title: '测试模块', icon: 'testModule' },
    children: [
      {
        path: 'baseManage',
        name: 'baseManage',
        component: () => import('@/views/test/baseManage/index'),
        meta: { title: '基础管理', icon: 'baseManage' },
        children: [
          {
            path: 'testSystem',
            name: 'testSystem',
            component: () => import('@/views/test/baseManage/testSystem'),
            meta: { title: '测试系统维护', icon: 'testSystem' }
          },
          {
            path: 'testSystemMember',
            name: 'testSystemMember',
            component: () => import('@/views/test/baseManage/testSystemMember'),
            meta: { title: '系统成员维护', icon: 'testSystemMember' }
          },
          {
            path: 'testDirectory',
            name: 'testDirectory',
            component: () => import('@/views/test/baseManage/testDirectory'),
            meta: { title: '测试目录维护', icon: 'testDirectory' }
          }
        ]
      },
      {
        path: 'usecaseManage',
        name: 'usecaseManage',
        component: () => import('@/views/test/usecaseManage/index'),
        redirect: '/test/usecaseManage/requireRepository',
        meta: { title: '用例管理', icon: 'usecaseManage' },
        children: [
          {
            path: 'requireRepository',
            name: 'requireRepository',
            component: () => import('@/views/test/usecaseManage/requireRepository'),
            meta: { title: '需求库', icon: 'requireRepository' }
          },
          {
            path: 'useCaseRepository',
            name: 'useCaseRepository',
            component: () => import('@/views/test/usecaseManage/useCaseRepository'),
            meta: { title: '用例库', icon: 'useCaseRepository' }
          },
          {
            path: 'useCaseExecution',
            name: 'useCaseExecution',
            component: () => import('@/views/test/usecaseManage/useCaseExecution'),
            meta: { title: '执行库', icon: 'useCaseExecution' }
          }
        ]
      }
    ]
  },

  {
    path: '/tools',
    component: Layout,
    redirect: '/tools',
    name: 'tools',
    meta: { title: '实用工具', icon: 'tools' },
    children: [
      {
        path: 'toolset',
        name: 'toolset',
        component: () => import('@/views/tools/toolset'),
        meta: { title: '工具集', icon: 'toolset' }
      },
      {
        path: 'notebook',
        name: 'notebook',
        component: () => import('@/views/tools/notebook'),
        meta: { title: '记事本', icon: 'notebook' }
      },
      {
        path: 'noteEditor/:noteId',
        name: 'noteEditor',
        component: () => import('@/views/tools/noteDetail'),
        meta: { title: '编辑笔记', icon: 'notebook' },
        hidden: true
      },
      {
        path: 'noteViewer/:noteId',
        name: 'noteViewer',
        component: () => import('@/views/tools/noteDetail'),
        meta: { title: '查看笔记', icon: 'notebook' },
        hidden: true
      }
    ]
  },

  {
    path: '/nested',
    component: Layout,
    redirect: '/nested/menu1',
    name: 'Nested',
    meta: { title: 'Nested', icon: 'nested' },
    children: [
      {
        path: 'menu1',
        component: () => import('@/views/nested/menu1/index'),
        name: 'Menu1',
        meta: { title: 'Menu1' },
        children: [
          {
            path: 'menu1-1',
            component: () => import('@/views/nested/menu1/menu1-1'),
            name: 'Menu1-1',
            meta: { title: 'Menu1-1' }
          },
          {
            path: 'menu1-2',
            component: () => import('@/views/nested/menu1/menu1-2'),
            name: 'Menu1-2',
            meta: { title: 'Menu1-2' },
            children: [
              {
                path: 'menu1-2-1',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
                name: 'Menu1-2-1',
                meta: { title: 'Menu1-2-1' }
              },
              {
                path: 'menu1-2-2',
                component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
                name: 'Menu1-2-2',
                meta: { title: 'Menu1-2-2' }
              }
            ]
          },
          {
            path: 'menu1-3',
            component: () => import('@/views/nested/menu1/menu1-3'),
            name: 'Menu1-3',
            meta: { title: 'Menu1-3' }
          }
        ]
      },
      {
        path: 'menu2',
        component: () => import('@/views/nested/menu2/index'),
        name: 'Menu2',
        meta: { title: 'menu2' }
      }
    ]
  },

  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes.concat(asyncRoutes)
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
