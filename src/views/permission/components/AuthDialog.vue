<template>
  <div class="user-dialog">
    <el-dialog
      :visible.sync="dialogVisible"
      :title="title"
      top="10vh"
      @open="handleDialogOpen"
      @close="handleDialogClose"
    >
      <div class="nav flex flex-middle flex-between">
        <div
          class="flex flex-middle"
          style="width: 300px"
        >
          <el-select
            v-model="filter"
            size="mini"
            style="margin-right: 10px;"
          >
            <el-option
              :value="1"
              label="昵称"
            />
            <el-option
              :value="2"
              label="账号"
            />
          </el-select>
          <el-input
            v-model="searchKey"
            size="mini"
          />
        </div>
        <div>
          <el-button
            type="primary"
            size="mini"
            @click="handleSearch"
          >查询</el-button>
          <el-button
            size="mini"
            @click="handleReset"
          >重置</el-button>
        </div>
      </div>
      <div class="table">
        <TableView
          :data="list"
          :columns="columns"
          border
        />
      </div>
      <div class="footer">
        <Pagination
          :total="total"
          :current-page.sync="paging.pageNo"
          :page-size.sync="paging.pageSize"
          @change="handlePageChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TableView from '@/components/Table'
import Pagination from '@/components/Pagination'
import { getUserById } from '@/api/user'

const columns = [
  {
    prop: 'account',
    label: '账号',
    minWidth: 150
  },
  {
    prop: 'name',
    label: '昵称',
    minWidth: 150
  }
]
const defaultPaing = {
  pageSize: 10,
  pageNo: 1
}

export default {
  name: 'DialogVisible',
  components: {
    TableView,
    Pagination
  },
  props: {
    title: {
      type: String,
      default: '用户'
    },
    id: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      list: [],
      columns,
      total: 0,
      dialogVisible: false,
      paging: { ...defaultPaing },
      filter: 1, // account
      searchKey: ''
    }
  },
  methods: {
    handleSearch() {
      this.paging = { ...defaultPaing }
      this.getRoleUser()
    },
    handleReset() {
      this.searchKey = ''
      this.filter = 1
      this.paging = { ...defaultPaing }
      this.getRoleUser()
    },
    handleDialogOpen() {
      this.getRoleUser()
    },
    async getRoleUser() {
      const { pageSize, pageNo } = this.paging

      const { list, total } = await getUserById({
        ids: this.id,
        pageSize,
        pageNo,
        searchType: this.filter,
        searchKey: this.searchKey
      })
      this.list = list
      this.total = total
    },
    handleDialogClose() {
      this.paging = { ...defaultPaing }
      this.searchKey = ''
      this.filter = 1
      this.list = []
    },
    handlePageChange() {
      this.getRoleUser()
    }
  }
}
</script>

<style lang="scss">
.user-dialog {
  .nav {
    margin-bottom: 20px;
  }
}
</style>
