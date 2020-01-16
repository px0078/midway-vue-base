import store from '@/store'

export default {
  async inserted(el, binding, vnode) {
    const { value } = binding
    await store.dispatch('user/getSidebar')
    const uris = store.state.user.modules
    if (value && value instanceof Array && value.length > 0) {
      const permissionUri = value

      const hasPermission = permissionUri.some(uri => {
        return uris.includes(uri)
      })

      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(`need roles! Like v-permission="['admin','editor']"`)
    }
  }
}
