import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// 处理 baseURL，确保没有双斜杠
function normalizeBaseURL(baseURL) {
  if (!baseURL) return ''
  // 移除所有末尾的斜杠
  baseURL = baseURL.replace(/\/+$/, '')
  return baseURL
}

// create an axios instance
const service = axios.create({
  baseURL: normalizeBaseURL(process.env.VUE_APP_BASE_API), // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 50000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    
    // 确保 URL 没有双斜杠
    if (config.url) {
      const baseURL = config.baseURL || ''
      // 统一处理：确保最终 URL 没有双斜杠
      // 如果 baseURL 以 / 结尾，且 url 以 / 开头，移除 url 开头的斜杠
      if (baseURL.endsWith('/') && config.url.startsWith('/')) {
        config.url = config.url.substring(1)
      }
      // 如果 baseURL 不为空且不以 / 结尾，且 url 不以 / 开头，添加斜杠
      if (baseURL && !baseURL.endsWith('/') && !config.url.startsWith('/')) {
        config.url = '/' + config.url
      }
      // 如果 baseURL 为空，确保 url 以 / 开头（相对路径）
      if (!baseURL && !config.url.startsWith('/')) {
        config.url = '/' + config.url
      }
      // 最终检查：如果 url 以 // 开头，移除一个斜杠
      if (config.url.startsWith('//')) {
        config.url = config.url.substring(1)
      }
    }

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      const token = getToken()
      // 兼容多种后端约定
      config.headers['X-Token'] = token
      config.headers['token'] = token
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    // do something with request error
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    // 处理 blob 响应（文件下载）
    if (response.config.responseType === 'blob') {
      return response
    }

    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (!(res && (res.code === 20000 || res.code === 200 || res.success === true))) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      // 保留更多错误信息用于调试
      const error = new Error(res.message || 'Error')
      error.response = response
      error.data = res
      return Promise.reject(error)
    } else {
      return res
    }
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
