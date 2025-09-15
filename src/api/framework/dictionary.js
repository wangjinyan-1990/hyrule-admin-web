import request from '@/utils/request'


export function getDictionaryList(dataType) {
  return request({
    url: `/framework/dictionary/type/${dataType}`,
    method: 'get'
  })
}

export default {
  getDictionaryList
}
