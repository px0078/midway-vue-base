<template>
  <el-table
    ref="table"
    v-loading="loading"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <el-table-column
      v-for="column of tableTypeColumns"
      :key="column.type"
      :align="column.align || 'center'"
      v-bind="column"
    />
    <el-table-column
      v-for="column of tableColumns"
      :key="column.prop"
      :fixed="column.fixed || false"
      :align="column.align || 'center'"
      v-bind="column"
    >
      <template
        v-if="column.headSlotName"
        v-slot:header
      >
        <slot :name="column.headSlotName" />
      </template>
      <template v-slot="{ row, $index }">
        <slot
          v-if="column.slotName"
          :name="column.slotName"
          :row="row"
          :index="$index"
        />
        <span
          v-else
          :title="row[column.prop]"
        >{{ row[column.prop] }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'Table',
  props: {
    loading: { type: Boolean, default: false },
    columns: { type: Array, required: true }
  },

  computed: {
    tableColumns() {
      return this.columns.filter(column => !column.type)
    },

    tableTypeColumns() {
      return this.columns.filter(column => column.type)
    }
  },

  methods: {
    toggleRowSelection(row) {
      return this.$refs.table.toggleRowSelection(row, false)
    }
  }
}
</script>
