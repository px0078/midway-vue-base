import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/routes',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/admin/group',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/admin/group',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/admin/group/${id}`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/admin/group/${id}`,
    method: 'delete'
  })
}

/*
通过id获取角色的权限
*/
export function getRoleMenu(id) {
  return request({
    url: `/admin/group/${id}`,
    method: 'get'
  })
}

/*
* 获取角色下的用户
*/
export function getRoleUser({ id, ...data }) {
  return request({
    url: `/admin/group/user/${id}`,
    method: 'get',
    params: data
  })
}

/*
添加角色中的用户
*/
export function addRoleUser({ id, ...data }) {
  return request({
    url: `/admin/group/user/${id}`,
    method: 'put',
    data
  })
}
