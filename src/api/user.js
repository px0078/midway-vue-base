import request from '@/utils/request'

export function login({ username, password }) {
  return request({
    url: '/admin/passport/login',
    method: 'post',
    data: {
      account: username,
      password
    }
  })
}

export function getInfo(token) {
  return request({
    url: `/admin/user/${token}`,
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/admin/passport/logout',
    method: 'post'
  })
}
