import { getMenus } from '@/api/menu'

const state = {
  menu: [],
  updated: false,
  flatMenu: []
}

const mutations = {
  SET_MENU(state, menu) {
    state.menu = menu
  },
  SET_FLAT_MENU(state, menu) {
    state.flatMenu = menu
  },
  SET_UPDATE(state, updated) {
    state.updated = updated
  }
}

const actions = {
  /**
   * 这里是系统所有的权限，可分页
   */
  async getMenu({ commit }, noCache = false) {
    if (!noCache && state.updated) {
      return state.menu
    }
    const { list } = await getMenus()
    const menu = listMenuToTree(list)
    commit('SET_UPDATE', true)
    commit('SET_FLAT_MENU', list)
    commit('SET_MENU', menu)
    return menu
  }
}

function listMenuToTree(arr) {
  const map = arr.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {})
  const tree = []
  arr.forEach(item => {
    const parentItem = map[item.parent_id]
    if (parentItem) {
      if (!parentItem.children) parentItem.children = []
      parentItem.children.push(item)
    } else {
      tree.push(item)
    }
  })
  return tree
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
