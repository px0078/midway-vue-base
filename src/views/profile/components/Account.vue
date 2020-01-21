<template>
  <el-form>
    <el-form-item label="昵称">
      <el-input v-model.trim="user.name" />
    </el-form-item>
    <el-form-item label="手机号">
      <el-input v-model.trim="user.mobile" />
    </el-form-item>
    <el-form-item label="签名">
      <el-input v-model.trim="user.remark" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">更新信息</el-button>
    </el-form-item>

    <el-form-item label="修改密码">
      <el-input v-model.trim="user.password" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="danger" @click="submitPassword">更新密码</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { setInfo, setPassword } from '@/api/user'

export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  methods: {
    async submit() {
      await setInfo(this.user)
      this.$message({
        type: 'success',
        message: '更新成功'
      })
    },
    async submitPassword() {
      await setPassword(this.user)
      this.$message({
        type: 'success',
        message: '修改成功'
      })
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>
