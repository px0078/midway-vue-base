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

export function listUser(params) {
  return request({
    url: '/admin/user',
    method: 'get',
    params
  })
}

/*
获取用户的详细信息
*/
export function getUserDetail(id) {
  return request({
    url: `/admin/user/${id}`,
    method: 'get'
  })
}

/*
删除用户
*/
export function deleteUser(id) {
  return request({
    url: `/admin/user/${id}`,
    method: 'delete'
  })
}

/*
更新用户信息
*/
export function updateUser({ _id, ...data }) {
  return request({
    url: `/admin/user/${_id}`,
    method: 'put',
    data
  })
}

/*
* 获取一个用户的权限
*/
export function getAuth({ _id }) {
  return request({
    url: `/admin/user/${_id}/auth`,
    method: 'get'
  })
}

/*
通过Id获取用户
*/
export function getUserById(data) {
  return request({
    url: `/admin/user/users`,
    method: 'post',
    data
  })
}

/*
创建新用户
*/
export function addUser(data) {
  return request({
    url: `/admin/user`,
    method: 'post',
    data
  })
}
