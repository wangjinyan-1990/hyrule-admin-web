import request from '@/utils/request'

export function query_microservices_instance(smartwebIp='', codeProgram='') {
  return request({
    url: '/api/dtpPlat/smartweb/microservice/instance',
    method: 'get',
    timeout: 120000,
    params: {
      smartwebIp: smartwebIp, // 确保参数名与后端 @RequestParam("smartwebIp") 一致
      codeProgram: codeProgram
    }
  })
}

export default {
  query_microservices_instance
}
