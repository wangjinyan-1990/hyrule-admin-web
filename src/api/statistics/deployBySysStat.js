import request from '@/utils/request'

// 获取各系统发版数统计
export function getDeployBySysStat(params) {
  return request({
    url: '/statistics/configurationStat/deployBySysStat',
    method: 'get',
    params
  })
}

export default {
  getDeployBySysStat
}
