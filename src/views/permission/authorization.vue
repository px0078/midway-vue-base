<template>
  <div class="authorization">
    <div class="tree">
      <!-- tree -->
      <el-tree
        ref="tree"
        :data="menus"
        node-key="id"
        default-expand-all
        :props="{ label: 'name', children: 'children' }"
        :expand-on-click-node="false"
        :draggable="draggable"
        :show-checkbox="showCheckbox"
      >
        <span
          slot-scope="{ node, data }"
          class="flex flex-between"
          style="width: 100%;"
        >
          <span
            class="flex-none"
            :style="`${data.id === -1 ? 'font-weight: bold;' : ''}`"
          >
            {{
              node.label
            }}
          </span>
          <template v-if="data.id === -1">
            <div
              class="flex flex-middle"
              style="width: 100%;"
            >
              <span
                class="roles font-hidden-1"
                style="font-weight: bold;"
              >拥有该功能的角色</span>
              <span
                class="flex-none"
                style="width: 160px; font-weight: bold;"
              >拥有该功能的用户</span>
            </div>
          </template>
          <template v-else-if="assignList[data.id]">
            <div
              class="flex flex-middle"
              style="width: 100%;"
            >
              <span class="roles font-hidden-1">{{ assignList[data.id].role.join('、') }}</span>
              <span
                class="flex-none"
                style="width: 160px; color: rgb(24, 144, 255);"
                @click="handleClickUser(assignList[data.id].user)"
              >{{ assignList[data.id].user.length }}</span>
            </div>
          </template>
        </span>
      </el-tree>
    </div>
    <UserDialog
      :id="userDialogId"
      ref="user-dialog"
      title="用户表"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'underscore'
import { getAssign } from '@/api/menu'
import UserDialog from './components/AuthDialog'

export default {
  name: 'Authorization',
  components: {
    UserDialog
  },
  data() {
    return {
      formName: 'menuForm',
      showCheckbox: false,
      dialogVisible: false,
      dialogType: 'new',
      draggable: false,
      assignList: {},
      userDialogVisible: false,
      userDialogId: []
    }
  },
  computed: mapState({
    menus: state => [{ id: -1, name: '菜单功能', children: state.menus.menu }]
  }),
  created() {
    this.getMenus()
    this.getAssignList()
  },
  methods: {
    getMenus(noCache = false) {
      this.$store.dispatch('menus/getMenu', noCache)
    },

    async getAssignList() {
      const result = await getAssign()
      Object.keys(result).forEach(key => {
        result[key].user = _.uniq(result[key].user.reduce((a, b) => a.concat(b), []))
      })
      this.assignList = result
    },

    handleClickUser(ids) {
      this.userDialogId = ids
      this.$refs['user-dialog'].dialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.authorization {
  padding: 30px;
  .tree {
    .roles {
      box-sizing: border-box;
      width: 100%;
      padding: 0 20px;
      text-align: center;
    }
  }
}
</style>
