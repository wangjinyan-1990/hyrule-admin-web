import request from '@/utils/request'

// 获取送测单列表
export function getSendTestList(params) {
  return request({
    url: '/test/sendTest/list',
    method: 'get',
    params
  })
}

export default {
  getSendTestList
}


