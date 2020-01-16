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

export function getSidebar() {
  return request({
    url: `/admin/passport/module`,
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/admin/passport/logout',
    method: 'post'
  })
}

export function listUser(parmas) {
  return request({
    url: '/admin/user',
    method: 'get',
    parmas
  })
}
