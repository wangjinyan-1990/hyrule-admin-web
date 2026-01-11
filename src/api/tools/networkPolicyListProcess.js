import request from '@/utils/request'

// 下载模板
export function downloadTemplate() {
  return request({
    url: '/tools/networkPolicyListProcess/downloadTemplate',
    method: 'get',
    responseType: 'blob'
  })
}

// 加工网络策略清单
export function processNetworkPolicyList(formData) {
  return request({
    url: '/tools/networkPolicyListProcess/process',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    responseType: 'blob',
    timeout: 60000 // 60秒超时，因为文件处理可能需要较长时间
  })
}

export default {
  downloadTemplate,
  processNetworkPolicyList
}
