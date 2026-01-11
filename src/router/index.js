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
    name: 'sys',
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
        path: 'rmbConverter',
        name: 'rmbConverter',
        component: () => import('@/components/Tools/rmbConverter'),
        meta: { title: '人民币大写转换', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'textCaseConverter',
        name: 'textCaseConverter',
        component: () => import('@/components/Tools/textCaseConverter'),
        meta: { title: '英文字母大小写转换', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'jsonFormatter',
        name: 'jsonFormatter',
        component: () => import('@/components/Tools/jsonFormatter'),
        meta: { title: 'JSON格式化', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'stringLengthCalculator',
        name: 'stringLengthCalculator',
        component: () => import('@/components/Tools/stringLengthCalculator'),
        meta: { title: '字符串长度计算', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'characterCountAnalyzer',
        name: 'characterCountAnalyzer',
        component: () => import('@/components/Tools/characterCountAnalyzer'),
        meta: { title: '字符出现次数统计', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'stringCountAnalyzer',
        name: 'stringCountAnalyzer',
        component: () => import('@/components/Tools/stringCountAnalyzer'),
        meta: { title: '字符串出现次数统计', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'colorSpaceConverter',
        name: 'colorSpaceConverter',
        component: () => import('@/components/Tools/colorSpaceConverter'),
        meta: { title: '颜色空间转换', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'baseConverter',
        name: 'baseConverter',
        component: () => import('@/components/Tools/baseConverter'),
        meta: { title: '进制转换器', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'passwordGenerator',
        name: 'passwordGenerator',
        component: () => import('@/components/Tools/passwordGenerator'),
        meta: { title: '随机密码生成', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'textEncoder',
        name: 'textEncoder',
        component: () => import('@/components/Tools/textEncoder'),
        meta: { title: '文本在线编码转换', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'imageBase64Encoder',
        name: 'imageBase64Encoder',
        component: () => import('@/components/Tools/imageBase64Encoder'),
        meta: { title: '图片base64编码', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'base64ImageDecoder',
        name: 'base64ImageDecoder',
        component: () => import('@/components/Tools/base64ImageDecoder'),
        meta: { title: 'base64还原图片', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'qrCodeGenerator',
        name: 'qrCodeGenerator',
        component: () => import('@/components/Tools/qrCodeGenerator'),
        meta: { title: '二维码在线生成', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'idCardGenerator',
        name: 'idCardGenerator',
        component: () => import('@/components/Tools/idCardGenerator'),
        meta: { title: '身份证号生成', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'imageTextRecognition',
        name: 'imageTextRecognition',
        component: () => import('@/components/Tools/imageTextRecognition'),
        meta: { title: '图片文字识别', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'rgbColorReference',
        name: 'rgbColorReference',
        component: () => import('@/components/Tools/rgbColorReference'),
        meta: { title: 'RGB颜色参考', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'primeFactorization',
        name: 'primeFactorization',
        component: () => import('@/components/Tools/primeFactorization'),
        meta: { title: '分解质因数', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'textDiffComparator',
        name: 'textDiffComparator',
        component: () => import('@/components/Tools/textDiffComparator'),
        meta: { title: '文本对比合并', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'textDeduplicator',
        name: 'textDeduplicator',
        component: () => import('@/components/Tools/textDeduplicator'),
        meta: { title: '文本去重内容行', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'expressionCalculator',
        name: 'expressionCalculator',
        component: () => import('@/components/Tools/expressionCalculator'),
        meta: { title: '计算器', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'loanCalculator',
        name: 'loanCalculator',
        component: () => import('@/components/Tools/loanCalculator'),
        meta: { title: '贷款计算器', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'dateCalculator',
        name: 'dateCalculator',
        component: () => import('@/components/Tools/dateCalculator'),
        meta: { title: '天数计算器', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'md5Tool',
        name: 'md5Tool',
        component: () => import('@/components/Tools/md5Tool'),
        meta: { title: 'MD5加解密工具', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'crontabCalculator',
        name: 'crontabCalculator',
        component: () => import('@/components/Tools/crontabCalculator'),
        meta: { title: 'Crontab执行时间计算', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'imageCompressor',
        name: 'imageCompressor',
        component: () => import('@/components/Tools/imageCompressor'),
        meta: { title: '图片压缩工具', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'pdfToDocConverter',
        name: 'pdfToDocConverter',
        component: () => import('@/components/Tools/pdfToDocConverter'),
        meta: { title: 'PDF转DOC转换器', icon: 'toolset' },
        hidden: true
      },
      {
        path: 'networkPolicyListProcess',
        name: 'networkPolicyListProcess',
        component: () => import('@/components/Tools/networkPolicyListProcess'),
        meta: { title: '网络策略清单加工', icon: 'toolset' },
        hidden: true
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
      },
      {
        path: 'viewAttachment/:attachmentId',
        name: 'viewAttachment',
        component: () => import('@/views/sys/common/ViewAttachment'),
        meta: { title: '附件预览', icon: 'document' },
        hidden: true
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
            path: 'requireDetail',
            name: 'requireDetail',
            component: () => import('@/views/test/usecaseManage/requireDetail'),
            meta: { title: '需求点详情', icon: 'document', noCache: true },
            hidden: true
          },
          {
            path: 'useCaseRepository',
            name: 'useCaseRepository',
            component: () => import('@/views/test/usecaseManage/usecaseRepository'),
            meta: { title: '用例库', icon: 'usecaseRepository' }
          },
          {
            path: 'usecaseDetail',
            name: 'usecaseDetail',
            component: () => import('@/views/test/usecaseManage/usecaseDetail'),
            meta: { title: '用例详情', icon: 'document', noCache: true },
            hidden: true
          },
          {
            path: 'useCaseExecution',
            name: 'useCaseExecution',
            component: () => import('@/views/test/usecaseManage/usecaseExecution'),
            meta: { title: '执行库', icon: 'usecaseExecution' }
          }
        ]
      },
      {
        path: 'bugManage',
        name: 'bugManage',
        component: () => import('@/views/test/bugManage/bugManage'),
        meta: { title: '缺陷管理', icon: 'bugManage' }
      },
      {
        path: 'bugDetail',
        name: 'bugDetail',
        component: () => import('@/views/test/bugManage/bugDetail'),
        meta: { title: '缺陷详情', icon: 'document', noCache: true },
        hidden: true
      }
    ]
  },
  {
    path: '/configuration',
    component: Layout,
    name: 'configuration',
    meta: { title: '配置管理', icon: 'nested' },
    children: [
      {
        path: 'sysConfigInfo',
        component: () => import('@/views/configuration/sysConfigInfo/index'),
        name: 'sysConfigInfo',
        meta: { title: '系统配置信息', icon: 'sysConfigInfo' }
      },

      {
        path: 'deploy',
        component: () => import('@/views/configuration/deploy/index'),
        name: 'deploy',
        redirect: '/configuration/deploy/record',
        meta: { title: '发版登记', icon: 'deploy' },
        children: [
          {
            path: 'record',
            name: 'deployRecord',
            component: () => import('@/views/configuration/deploy/deployRecord'),
            meta: { title: '发版记录', icon: 'deployRecord' }
          },
          {
            path: 'sitDeploy',
            name: 'sitDeploy',
            component: () => import('@/views/configuration/deploy/sitDeploy'),
            meta: { title: 'SIT发版', icon: 'sitDeploy' }
          },
          {
            path: 'patDeploy',
            name: 'patDeploy',
            component: () => import('@/views/configuration/deploy/patDeploy'),
            meta: { title: 'PAT发版', icon: 'patDeploy' }
          }
        ]
      }

    ]
  },

  {
    path: '/environment',
    component: Layout,
    redirect: '/environment/environmentList',
    name: 'environment',
    meta: { title: '环境管理', icon: 'environment' },
    children: [
      {
        path: 'environmentList',
        name: 'environmentList',
        component: () => import('@/views/environment/environmentList'),
        meta: { title: '环境清单', icon: 'environmentList' }
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
