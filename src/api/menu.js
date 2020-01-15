import { get, post, del, put } from '@/utils/request'

export function getMenus() {
  return get('/admin/module')
}

export function delMenus(data) {
  return del(`/admin/module/${data.id}`)
}

export function updateMenus(data) {
  const { id, ...params } = data
  return put(`/admin/module/${id}`, params)
}

export function getMenusDetail(data) {
  return get(`/admin/module/${data.id}`)
}

export function addMenus(data) {
  return post('/admin/module', data)
}

export function getAssign() {
  return get('/admin/auth')
}
