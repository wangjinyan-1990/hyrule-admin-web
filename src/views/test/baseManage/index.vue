<template>
  <div style="padding: 0; margin: 0;">
    <el-alert :closable="false">
      <router-view />
    </el-alert>
  </div>
</template>

<script>
export default {
  name: 'BaseManage'
}
</script>
