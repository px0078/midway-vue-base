import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: '我的', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/permission',
    component: Layout,
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: '系统权限',
      icon: 'lock',
      uri: 'system.auth'
    },
    children: [
      {
        path: 'role',
        component: () => import('@/views/permission/role'),
        name: 'RoleManage',
        meta: {
          icon: 'peoples',
          title: '角色管理',
          uri: 'system.auth.group'
        }
      },
      {
        path: 'menu',
        component: () => import('@/views/permission/menu'),
        name: 'MenuManage',
        meta: {
          icon: 'tree-table',
          title: '菜单管理',
          uri: 'system.auth.module'
        }
      },
      {
        path: 'user',
        component: () => import('@/views/permission/user'),
        name: 'UserManage',
        meta: {
          icon: 'user',
          title: '用户管理',
          uri: 'system.auth.user'
        }
      },
      {
      // 权限查询
        path: 'authorization',
        component: () => import('@/views/permission/authorization'),
        name: 'authorization',
        meta: {
          icon: 'password',
          title: '权限管理',
          uri: 'system.auth.auth'
        }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
