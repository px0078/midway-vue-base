import { login, logout, getSidebar } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import avatarImage from '@/assets/image/avatar.png'
import { uniq, compact, flatten } from 'underscore'

const state = {
  token: getToken(),
  name: '',
  avatar: avatarImage,
  roles: [],
  id: '',
  account: '',
  modules: [],
  uri: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // SET_INTRODUCTION: (state, introduction) => {
  //   state.introduction = introduction
  // },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_ID: (state, id) => {
    state.id = id
  },
  SET_ACCOUNT: (state, account) => {
    state.account = account
  },
  SET_MODULES: (state, modules) => {
    state.modules = modules
  },
  SET_URI(state, menu) {
    let uri = []
    menu.map(item => {
      uri.push(item.uri.split(','))
    })
    uri = uniq(compact(flatten(uri)))
    state.uri = uri
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { id, name, roles, token, avatar = '', account } = response
        commit('SET_TOKEN', token)
        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        commit('SET_ROLES', roles)
        commit('SET_ID', id)
        commit('SET_ACCOUNT', account)
        setToken(token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // 获取用户的权限列表
  getSidebar({ commit }) {
    if (state.modules.length) return state.modules

    return new Promise(async(resolve, reject) => {
      try {
        const modules = await getSidebar()
        commit('SET_MODULES', modules)
        commit('SET_URI', modules)
        resolve(modules)
      } catch (err) {
        reject(err)
      }
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_NAME', '')
        commit('SET_AVATAR', '')
        commit('SET_ROLES', [])
        commit('SET_ID', '')
        commit('SET_ACCOUNT', '')
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_NAME', '')
      commit('SET_AVATAR', '')
      commit('SET_ROLES', [])
      commit('SET_ID', '')
      commit('SET_ACCOUNT', '')
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  changeRoles({ commit, dispatch }, role) {
    return new Promise(async resolve => {
      const token = role + '-token'

      commit('SET_TOKEN', token)
      setToken(token)

      const { roles } = await dispatch('getInfo')

      resetRouter()

      // generate accessible routes map based on roles
      const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })

      // dynamically add accessible routes
      router.addRoutes(accessRoutes)

      // reset visited views and cached views
      dispatch('tagsView/delAllViews', null, { root: true })

      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
