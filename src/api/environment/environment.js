import request from '@/utils/request'

// 获取环境列表
export function getEnvironmentList(params) {
  return request({
    url: '/env/environment/list',
    method: 'get',
    params
  })
}

export default {
  getEnvironmentList
}
