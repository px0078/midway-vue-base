import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout 1 min
})

const inqureReLogin = () => {
// to re-login
  MessageBox.confirm('您已退出登录或登录过期，点击确定重新登录', 'Confirm logout', {
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.dispatch('user/resetToken').then(() => {
      location.reload()
    })
  })
}

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // jwt token
      config.headers['Authorization'] = `Bearer ${getToken()}`
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
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
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== '0') {
      Message({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 用户登录过期后，需要清空用户数据并重新登录
      if (res.code === 401 || res.code === '401') {
        inqureReLogin()
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res.result
    }
  },
  error => {
    console.log('err' + error) // for debug
    const { response } = error
    let message
    if (response && response instanceof Object) {
      const { data, statusText } = response
      message = data ? data.msg || data.message || statusText : statusText
      // 登录过期
      if (response.status === 401) {
        inqureReLogin()
      }
    }
    Message({
      message: message || error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service

export function get(url, data, config = {}) {
  return service({ url, data, ...config })
}

export function del(url, data, config = {}) {
  return service({ url, data, method: 'delete', ...config })
}

export function post(url, data, config = {}) {
  return service({ url, data, method: 'post', ...config })
}

export function put(url, data, config = {}) {
  return service({ url, data, method: 'put', ...config })
}
