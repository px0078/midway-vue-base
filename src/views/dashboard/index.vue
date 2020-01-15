<template>
  <div class="dashboard-container">
    <div class="dashboard-editor-container" style="background-image: url(https://picsum.photos/700)" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  data() {
    return {
      currentRole: 'adminDashboard'
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  }

}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  position: relative;
  min-height: 700px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: rgb(240, 242, 245);

}
</style>
