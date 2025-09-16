<template>
  <div class="base-manage-container">
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

<style scoped>
.base-manage-container {
  padding: 0;
  margin: 0;
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
}

/* 确保alert组件占满宽度 */
::v-deep .el-alert {
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
}

/* 确保alert内容区域占满宽度 */
::v-deep .el-alert__content {
  width: 100% !important;
  max-width: none !important;
  box-sizing: border-box;
}
</style>
