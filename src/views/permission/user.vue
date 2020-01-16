<template>
  <div class="app-container">
    <div class="navigator">
      <el-row :gutter="20">
        <el-col
          :span="8"
          class="flex flex-middle"
        >
          <el-select
            v-model="filterType"
            size="mini"
          >
            <el-option
              label="昵称"
              :value="1"
            />
            <el-option
              label="账号"
              :value="2"
            />
          </el-select>：
          <el-input
            v-model="filterKey"
            size="mini"
            type="text"
            clearable
          />
        </el-col>
        <el-col
          :span="6"
          :offset="1"
        >
          <el-button
            type="primary"
            size="mini"
            @click="filterSubmit"
          >查询</el-button>
          <el-button
            size="mini"
            @click="filterReset"
          >重置</el-button>
        </el-col>
      </el-row>
    </div>

    <TableView
      :data="userList"
      :columns="columns"
      border
      class="users-table"
    >
      <template v-slot:account="{ row }">
        <div>{{ row.account }}</div>
        <div v-if="row.oldAccount && row.account !== row.oldAccount">({{ row.oldAccount }})</div>
      </template>
      <template v-slot="{ row, index }">
        <el-button
          v-permission="['auth.user.edit', 'auth.user.update']"
          type="primary"
          size="mini"
          @click="handleEditRoles(row)"
        >编辑角色</el-button>
        <el-button
          v-permission="['auth.user.edit', 'auth.user.setPassword', 'auth.user.update']"
          type="primary"
          size="mini"
          @click="handleEdit(row)"
        >编辑</el-button>
        <el-button
          v-permission="['auth.user.destroy']"
          type="danger"
          size="mini"
          @click="handleDelete(row, index)"
        >删除</el-button>
        <el-button
          v-permission="['auth.user.authorization']"
          type="primary"
          size="mini"
          @click="handleAuthorization(row, index)"
        >权限表</el-button>
      </template>
    </TableView>

    <Pagination
      :total="total"
      :current-page.sync="paging.currentPage"
      :page-size.sync="paging.pageSize"
      @change="handlePageChange"
    />

    <!-- 用户弹出框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogType === 'edit' ? '编辑用户' : '新增用户'"
    >
      <el-form
        :ref="formName"
        :model="user"
        label-width="80px"
        label-position="left"
        :rules="submitRules"
      >
        <el-form-item
          label="昵称"
          prop="name"
        >
          <el-input
            v-model="user.name"
            placeholder="昵称"
            maxlength="10"
          />
        </el-form-item>
        <el-form-item
          label="账号"
          prop="account"
        >
          <el-input
            v-model="user.account"
            maxlength="20"
            type="text"
            placeholder="登录的账号"
          />
        </el-form-item>
        <el-form-item
          v-if="dialogType === 'new'"
          label="密码"
          prop="password"
        >
          <el-input
            v-model="user.password"
            maxlength="30"
            type="password"
            placeholder="登录的密码"
          />
        </el-form-item>
        <el-form-item
          label="手机"
          prop="mobile"
        >
          <el-input
            v-model="user.mobile"
            maxlength="13"
            type="tel"
            placeholder="绑定的手机号"
          />
        </el-form-item>
        <el-form-item
          label="邮箱"
          prop="email"
        >
          <el-input
            v-model="user.email"
            type="email"
            placeholder="绑定的邮箱"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button
          type="danger"
          @click="dialogVisible = false"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          @click="confirmUser()"
        >确认</el-button>
      </div>
    </el-dialog>

    <!-- 编辑角色弹出框 -->
    <el-dialog
      :visible.sync="roleDialogVisible"
      title="设置用户角色"
    >
      <div>
        <el-transfer
          ref="transfer"
          v-model="userRoles"
          :titles="['可添加', '已拥有']"
          :data="roles"
        />
      </div>

      <div style="text-align:right;">
        <el-button
          type="danger"
          @click="roleDialogVisible = false"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          @click="confirmUserRole()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <!-- 用户权限弹框 -->
    <el-dialog
      :visible.sync="userAuthVisible"
      :title="userAuthTitle"
      top="10vh"
    >
      <div style="max-height: 650px; overflow-y: auto;">
        <el-tree
          ref="tree"
          :data="menu"
          default-expand-all
          show-checkbox
          node-key="id"
          highlight-current
          :props="{ label: 'name', children: 'children' }"
          @check="handleNodeClick"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import TableView from '@/components/Table'
import Pagination from '@/components/Pagination'
import { listUser, updateUser, addUser, deleteUser, getUserDetail, getAuth } from '@/api/user'
import { getRoles, addRoleUser } from '@/api/role'

const columns = [
  {
    prop: 'name',
    label: '昵称',
    minWidth: 150
  },
  {
    prop: 'account',
    label: '账号',
    slotName: 'account',
    minWidth: 200
  },
  {
    prop: 'operate',
    label: '操作',
    slotName: 'default',
    minWidth: 400
  }
]

const UserShema = {
  account: '',
  name: '',
  mobile: '',
  email: '',
  password: ''
}

const paging = {
  currentPage: 1,
  pageSize: 10
}

const getDefaultUser = () => ({
  name: '',
  account: '',
  password: ''
})

const submitRules = {
  name: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    {
      min: 1,
      max: 10,
      message: '请输入昵称 1 到 10 个字',
      trigger: 'blur'
    }
  ],
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    {
      min: 4,
      max: 20,
      message: '请输入账号 4 到 20 个字',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      min: 6,
      max: 30,
      message: '请输入密码 6 到 30 个字',
      trigger: 'blur'
    }
  ],
  mobile: [{ required: false }],
  email: [{ required: false }]
}

const generateTransferData = data => {
  const newArray = []
  data.forEach(item => {
    newArray.push({
      key: item.id,
      label: item.name,
      ...item
    })
  })
  return newArray
}

export default {
  name: 'UserManage',
  components: { TableView, Pagination },

  data: () => ({
    columns,
    dialogType: 'new',
    dialogVisible: false,
    roleDialogVisible: false,
    user: getDefaultUser(),
    formName: 'ruleForm',
    paging,
    userList: [],
    submitRules,
    total: 0,
    roles: [],
    userRoles: [],
    filterType: 1,
    filterKey: '',
    userAuthVisible: false,
    userAuthTitle: '权限表',
    userAuthData: []
  }),

  computed: mapState({ menu: state => state.menus.menu }),

  watch: {
    userAuthVisible(v) {
      if (!v) {
        this.$refs.tree.setCheckedKeys([])
      }
    }
  },

  created() {
    this.getUsers()
  },

  methods: {
    async confirmUser() {
      await this.$refs[this.formName].validate()
      const isEdit = this.dialogType === 'edit'
      if (isEdit) {
        await updateUser(this.user)
        this.$message({
          type: 'success',
          message: '修改用户成功'
        })
        this.userList.some((item, index) => {
          if (item.id === this.user.id) {
            this.userList.splice(index, 1, this.user)
          }
          return item.id === this.user.id
        })
      } else {
        await addUser(this.user)
        this.$message({
          type: 'success',
          message: '添加用户成功'
        })
        this.userList.push(this.user)
        this.getUsers()
      }
      this.dialogVisible = false
    },

    async confirmUserRole() {
      const { sourceData, targetData } = this.$refs.transfer
      const add = targetData.map(item => addRoleUser({
        id: item.id,
        type: 'add',
        idList: [this.user.id]
      }))
      const reduce = sourceData.map(item => addRoleUser({
        id: item.id,
        type: 'remove',
        idList: [this.user.id]
      }))
      Promise.all([...add, ...reduce]).then(() => {
        this.$message({
          type: 'success',
          message: '操作成功'
        })
        this.roleDialogVisible = false
      })
    },

    handleAddUser() {
      this.dialogType = 'new'
      this.dialogVisible = true
      this.user = UserShema
    },

    async handleDelete(row, index) {
      await this.$confirm('确定要删除这个用户吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteUser(row.id)
      this.userList.splice(index, 1)
      this.$message({
        type: 'success',
        message: '删除成功'
      })
    },

    handleEdit(row) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.user = { ...row }
    },

    async handleEditRoles(row) {
      this.user = row
      // 这里是获取所有的角色，所以不用getter里的roles
      const { list } = await getRoles({
        currentPage: 1,
        pageSize: 1000
      })
      // 这里是查询所选用户的角色。
      const { roles: userRoles } = await getUserDetail(row.id)
      // eslint-disable-next-line no-underscore-dangle
      const _array = []
      list.forEach(item => userRoles.forEach(role => {
        const hasRole = item.name === role
        if (hasRole) {
          _array.push(item.id)
        }
        return hasRole
      }))
      this.roles = generateTransferData(list)
      this.userRoles = _array
      this.roleDialogVisible = true
    },

    handlePageChange() {
      this.getUsers()
    },

    async getUsers() {
      const data = {
        ...this.paging
      }
      if (this.filterKey) {
        if (this.filterType === 1) {
          data.name = this.filterKey
        } else if (this.filterType === 2) {
          data.account = this.filterKey
        }
      }
      const { currentPage, pageSize, total, list } = await listUser(data)
      this.userList = list
      this.paging = {
        currentPage,
        pageSize
      }
      this.total = total
    },

    filterSubmit() {
      this.paging.currentPage = 1
      this.getUsers()
    },

    filterReset() {
      this.filterType = 1
      this.filterKey = ''
      this.paging.currentPage = 1
      this.getUsers()
    },

    async handleAuthorization(row) {
      this.userAuthVisible = true
      this.$store.dispatch('menus/getMenu')
      const { id, name } = row
      const result = await getAuth({
        id
      })
      this.userAuthTitle = `${name}的权限表`
      // eslint-disable-next-line no-underscore-dangle
      this.userAuthData = result.map(i => i._id)
      setTimeout(() => {
        this.$refs.tree.setCheckedKeys(this.userAuthData)
      }, 100)
    },

    handleNodeClick() {
      this.$refs.tree.setCheckedKeys(this.userAuthData)
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .users-table {
    margin-top: 30px;
  }
  .tree-wrap {
    max-height: 400px;
    overflow-y: scroll;
  }
}
</style>
