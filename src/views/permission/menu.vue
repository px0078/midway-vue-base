<template>
  <div class="app-container flex flex-between">

    <!-- tree -->
    <el-tree
      ref="tree"
      :data="menus"
      node-key="id"
      default-expand-all
      :props="{label:'name',children:'children'}"
      :expand-on-click-node="false"
      :draggable="draggable"
      :show-checkbox="showCheckbox"
      @node-drop="handleDrop"
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>{{ node.label }}</span>
        <span>
          <el-button v-if="data._id !== -1" v-permission="['auth.module.edit']" type="text" size="small" title="编辑" @click="() => edit(data)">
            <i class="el-icon-edit" />
          </el-button>
          <el-button v-permission="['auth.module.create']" type="text" size="small" title="添加子菜单" @click="() => append(data)">
            <i class="el-icon-plus" />
          </el-button>
          <el-button v-if="data._id !== -1" v-permission="['auth.module.destroy']" type="text" size="small" title="删除该项菜单及所有子菜单" @click="() => handleDelete(node, data)">
            <i class="el-icon-minus" />
          </el-button>
        </span>
      </span>
    </el-tree>

    <!-- 修改，添加菜单。弹窗 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogType==='edit'?'编辑菜单':'新增菜单'"
      :close-on-click-modal="false"
    >
      <el-form :ref="formName" :model="menu" label-width="80px" label-position="left" :rules="submitMenus">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="menu.name" placeholder="菜单名称" maxlength="10" />
        </el-form-item>
        <el-form-item label="uri路径" prop="uri">
          <el-input v-model="menu.uri" type="textarea" placeholder="接口uri地址" />
        </el-form-item>
        <el-form-item label="描述" prop="describe">
          <el-input v-model="menu.describe" placeholder="描述" />
        </el-form-item>

      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">
          取消
        </el-button>
        <el-button type="primary" @click="confirmMenu()">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 菜单导入导出按钮 -->
    <!-- <div class="menus-button">
      <el-button v-permission="['auth.module.import']" size="mini" @click="importMenus">导入菜单</el-button>
      <template v-if="showCheckbox">
        <el-button size="mini" type="danger" @click="exportCancel">取消</el-button>
        <el-button size="mini" type="primary" @click="exportMenus">确定</el-button>
      </template>
      <template v-else>
        <el-button v-permission="['auth.module.export']" size="mini" @click="showCheckbox = true">导出菜单</el-button>
      </template>
      <input ref="importFile" class="hidden" type="file" accept="text/plain" @change="handleInputChange">
    </div> -->

  </div>
</template>

<script>
import { mapState } from 'vuex'
import _ from 'underscore'
import {
  delMenus,
  updateMenus,
  addMenus
} from '@/api/menu.js'
import { idValidator } from '@/utils'

const menu = {
  name: '',
  // url: '',
  uri: '',
  iconfont: '',
  describe: '',
  sort: 0,
  show: 0,
  parent_id: ''
}

const submitMenus = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    {
      min: 2,
      max: 10,
      message: '请输入角色名称，长度 2 到 10 个字',
      trigger: 'blur'
    }
  ],
  uri: [
    { validator: idValidator, required: true, trigger: 'blur' }
  ],
  describe: [
    { required: false, message: '描述', trigger: 'blur' },
    {
      min: 2,
      max: 40,
      message: '请输入图标地址 2 到 40 个字',
      trigger: 'blur'
    }
  ],
  sort: [
    { required: false, message: '请输入菜单权重', trigger: 'blur' }
  ]
}

export default {
  name: 'MenuManage',
  data: () => ({
    menu,
    submitMenus,
    formName: 'menuForm',
    showCheckbox: false,
    dialogVisible: false,
    dialogType: 'new',
    draggable: false
  }),
  computed: mapState({
    menus: state => [{ id: -1, name: '菜单', children: state.menus.menu }]
  }),
  watch: {
    dialogVisible(val) {
      if (!val) {
        this.$refs[this.formName].clearValidate()
      }
    }
  },
  created() {
    this.getMenus()
  },
  methods: {

    append(data) {
      this.menu = { ...menu }
      this.menu.parent_id = data._id

      this.dialogType = 'new'
      this.dialogVisible = true
    },

    edit(data) {
      this.menu = data
      this.dialogType = 'edit'
      this.dialogVisible = true
    },

    getMenus(noCache = false) {
      this.$store.dispatch('menus/getMenu', noCache)
    },

    /**
     * 拖拽
     *  */
    async handleDrop(from, to, dropType) {
      let data
      if (dropType === 'inner') {
        // 拖到了 to 的里面，parent_id 就是 to.data._id
        data = {
          name: from.data.name,
          id: from.data._id,
          parent_id: to.data._id
        }
      } else if (dropType === 'after' || dropType === 'before') {
        // 拖到了 to 的前面或后面，平级，parent_id 就是 to.parent.data._id
        data = {
          name: from.data.name,
          id: from.data._id,
          parent_id: to.parent.data._id
        }
      }
      if (data.parent_id === -1) data.parent_id = ''
      await updateMenus(data)
      this.$message({
        type: 'success',
        message: '排序成功'
      })
      this.getMenus(true)
    },

    // async getRoleMenuIds(roleId) {
    //   const { list } = await getRoleMenu(roleId)
    //   this.$refs.tree.setCheckedKeys(list)
    // },

    handleUri(val) {
      return _.compact(val.split(',').map(item => {
        if (item.trim()) return item.trim()
      })).sort().join(',')
    },

    async handleAdd() {
      if (this.menu.parent_id === -1) this.menu.parent_id = ''
      if (this.menu.uri) this.menu.uri = this.handleUri(this.menu.uri)
      await addMenus(this.menu)
      this.getMenus(true)
      this.$message({
        type: 'success',
        message: '添加成功'
      })
      this.menu = { ...menu }
    },

    async handleEdit() {
      if (this.menu.uri) this.menu.uri = this.handleUri(this.menu.uri)
      await updateMenus(this.menu)
      this.getMenus(true)
      this.$message({
        type: 'success',
        message: '修改成功'
      })
    },
    async handleDelete(node, data) {
      await this.$confirm('确定要删除这个菜单吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await delMenus({
        id: data._id
      })
      this.getMenus(true)
      this.$message({
        type: 'success',
        message: '删除成功'
      })
    },
    async confirmMenu() {
      if (this.dialogType === 'new') {
        this.handleAdd()
      } else {
        this.handleEdit()
      }
      this.dialogVisible = false
    }
    // async exportMenus() {
    //   const keys = _.compact(this.$refs.tree.getCheckedKeys().map(item => {
    //     if (item !== -1) return item
    //   }))
    //   const result = await exportMenus({
    //     ids: keys
    //   })
    //   downloadFile(result, 'export_menus.txt')
    //   this.exportCancel()
    // },
    // async exportCancel() {
    //   this.$refs.tree.setCheckedKeys([])
    //   this.showCheckbox = false
    // },
    // async importMenus() {
    //   this.$refs.importFile.click()
    // },
    // async handleInputChange(evt) {
    //   const file = evt.target.files[0]
    //   await importMenus(file)
    //   this.getMenus(true)
    //   this.$message({
    //     type: 'success',
    //     message: '成功导入'
    //   })
    // }
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
  .hidden {
    position: absolute;
    z-index: -10;
    width: 1px;
    height: 1px;
    opacity: 0;
    text-indent: -9999px;
  }
}
</style>
