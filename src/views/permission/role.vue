<template>
  <div class="app-container">
    <el-button
      v-permission="['auth.group.create']"
      type="primary"
      @click="handleAddRole"
    >添加角色</el-button>
    <TableView
      :data="rolesList"
      :columns="columns"
      border
      class="roles-table"
    >
      <template v-slot="{ row, index }">
        <el-button
          v-permission="['auth.group.edit']"
          type="primary"
          size="small"
          @click="handleEdit(row)"
        >编辑</el-button>
        <el-button
          v-permission="['auth.group.destroy']"
          type="danger"
          size="small"
          @click="handleDelete(row, index)"
        >删除</el-button>
        <el-button
          v-permission="['auth.group.getUser']"
          type="primary"
          size="small"
          @click="handleUsers(row, index)"
        >用户表</el-button>
      </template>
    </TableView>

    <Pagination
      :total="total"
      :current-page.sync="paging.currentPage"
      :page-size.sync="paging.pageSize"
      @change="handlePageChange"
    />

    <!-- 编辑角色弹框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogType === 'edit' ? '编辑角色' : '新增角色'"
    >
      <el-form
        :ref="formName"
        :model="role"
        label-width="80px"
        label-position="left"
        :rules="submitRules"
      >
        <el-form-item
          label="角色"
          prop="name"
        >
          <el-input
            v-model="role.name"
            placeholder="角色名称"
            maxlength="10"
          />
        </el-form-item>
        <el-form-item
          label="角色描述"
          prop="describe"
        >
          <el-input
            v-model="role.describe"
            :autosize="{ minRows: 2, maxRows: 4 }"
            maxlength="30"
            type="textarea"
            placeholder="对角色的描述"
          />
        </el-form-item>
        <el-form-item
          label="菜单"
          prop="menuIds"
        >
          <div class="tree-wrap">
            <el-tree
              ref="tree"
              :check-strictly="true"
              :data="menu"
              show-checkbox
              default-expand-all
              node-key="id"
              highlight-current
              :props="{ label: 'name', children: 'children' }"
            />
          </div>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button
          type="danger"
          @click="dialogVisible = false"
        >取消</el-button>
        <el-button
          type="primary"
          @click="confirmRole()"
        >确认</el-button>
      </div>
    </el-dialog>

    <UserDialog
      :id="userDialogId"
      ref="user-dialog"
      title="用户设置"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'underscore'
import TableView from '@/components/Table'
import Pagination from '@/components/Pagination'
import { getRoles, addRole, deleteRole, updateRole, getRoleMenu } from '@/api/role'
import UserDialog from './components/UserDialog'

const getDefaultRole = () => ({
  id: '',
  name: '',
  describe: '',
  modules: []
})

const paging = {
  currentPage: 1,
  pageSize: 10
}

const columns = [
  {
    prop: 'name',
    label: '角色',
    width: 200
  },
  {
    prop: 'describe',
    label: '角色描述'
  },
  {
    prop: 'operate',
    label: '操作',
    slotName: 'default',
    width: 300
  }
]

const submitRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    {
      min: 1,
      max: 10,
      message: '请输入角色名称，长度 1 到 10 个字',
      trigger: 'blur'
    }
  ],
  describe: [
    { required: true, message: '请输入角色描述', trigger: 'blur' },
    {
      min: 1,
      max: 30,
      message: '请输入角色描述，长度 1 到 30 个字',
      trigger: 'blur'
    }
  ]
}

export default {
  name: 'RoleManage',
  components: { TableView, Pagination, UserDialog },
  data: () => ({
    columns,
    submitRules,
    formName: 'ruleForm',
    role: getDefaultRole(),
    rolesList: [],
    dialogVisible: false,
    dialogType: 'new',
    userList: [],
    userIdList: [],
    userSearch: '',
    userSearchField: 'name',
    paging: { ...paging },
    UserPaging: { ...paging },
    total: 1,
    userDialogVisible: false,
    userDialogId: ''
  }),
  computed: mapState({ menu: state => state.menus.menu }),
  watch: {
    dialogVisible(val) {
      if (!val) {
        this.$refs[this.formName].clearValidate()
        this.$refs.tree.setCheckedKeys([])
      }
    }
  },
  created() {
    this.getRoles()
    this.$store.dispatch('menus/getMenu')
  },
  methods: {
    async getRoles() {
      const { total, list } = await getRoles({ ...this.paging })
      this.rolesList = list
      this.total = total
    },
    async getRoleMenuIds(roleId) {
      const { list } = await getRoleMenu(roleId)
      this.$refs.tree.setCheckedKeys(list)
    },
    handleAddRole() {
      this.role = getDefaultRole()
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(row) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.role = { ...row }
      this.getRoleMenuIds(row.id)
    },

    handlePageChange() {
      this.getRoles()
    },

    async handleDelete(row, index) {
      await this.$confirm('确定要删除这个角色吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteRole(row.id)
      this.rolesList.splice(index, 1)
      this.$message({
        type: 'success',
        message: '删除成功'
      })
    },
    async confirmRole() {
      await this.$refs[this.formName].validate()
      const isEdit = this.dialogType === 'edit'
      this.role.modules = _.union(
        this.$refs.tree.getCheckedKeys(),
        this.$refs.tree.getHalfCheckedKeys(),
      )
      if (isEdit) {
        await updateRole(this.role.id, this.role)
        this.rolesList.some(role => {
          if (this.role.id === role.id) {
            Object.assign(role, this.role)
            return true
          }
          return false
        })
      } else {
        const { id } = await addRole(this.role)
        this.rolesList.push({ ...this.role, id })
      }

      this.dialogVisible = false
      this.$message({
        message: `${isEdit ? '编辑' : '添加'}角色成功`,
        type: 'success'
      })
    },

    handleUsers(row) {
      const { id } = row
      this.userDialogId = id
      this.$refs['user-dialog'].dialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .tree-wrap {
    max-height: 400px;
    overflow-y: scroll;
  }
}
</style>
