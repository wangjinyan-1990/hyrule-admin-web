import Layout from '@/layout'

const testRoute = {
  path: '/test',
  component: Layout,
  name: 'test',
  meta: { title: '测试模块', icon: 'testModule' },
  children: [
    {
      path: 'baseManage',
      name: 'baseManage',
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
      meta: { title: '用例管理', icon: 'usecaseManage' },
      children: [
        {
          path: 'requireRepository',
          name: 'requireRepository',
          component: () => import('@/views/test/usecaseManage/requireRepository'),
          meta: { title: '需求库', icon: 'requireRepository' }
        },
        {
          path: 'requireDetail',
          name: 'requireDetail',
          component: () => import('@/views/test/usecaseManage/requireDetail'),
          meta: { title: '需求点详情', icon: 'document', noCache: true },
          hidden: true
        },
        {
          path: 'usecaseRepository',
          name: 'usecaseRepository',
          component: () => import('@/views/test/usecaseManage/usecaseRepository'),
          meta: { title: '用例库', icon: 'usecaseRepository' }
        },
        {
          path: 'usecaseDetail',
          name: 'usecaseDetail',
          component: () => import('@/views/test/usecaseManage/usecaseDetail'),
          meta: { title: '用例详情', icon: 'document', noCache: true },
          hidden: true
        }
      ]
    },
    {
      path: 'bugManage',
      name: 'bugManage',
      meta: { title: '缺陷管理', icon: 'bugManage' },
      children: [
        {
          path: 'bugManage',
          name: 'bugManage',
          component: () => import('@/views/test/bugManage/bugManage'),
          meta: { title: '缺陷列表', icon: 'bugManage' }
        },
        {
          path: 'bugDetail',
          name: 'bugDetail',
          component: () => import('@/views/test/bugManage/bugDetail'),
          meta: { title: '缺陷详情', icon: 'document', noCache: true },
          hidden: true
        }
      ]
    }
  ]
}

export default testRoute
