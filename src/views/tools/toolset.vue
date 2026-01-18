<template>
  <div class="app-container">
    <h3>实用工具</h3>
    <el-row :gutter="20">
      <el-col
        v-for="item in toolList"
        :key="item.name"
        :xs="12" :sm="8" :md="6" :lg="4">
        <el-card
          shadow="hover"
          class="tool-card"
          @click.native="$router.push({ name: item.name })">
          <i :class="item.meta.icon || 'el-icon-tools'" />
          <div>{{ item.meta.title }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Toolset',
  computed: {
    toolList() {
      // 过滤出 /tools 下 hidden 的子路由
      const routes = this.$router.options.routes
      const toolsRoute = routes.find(r => r.path === '/tools')
      if (!toolsRoute || !toolsRoute.children) {
        return []
      }
      // 过滤出 hidden: true 的路由，排除 toolset 本身和 notebook
      return toolsRoute.children.filter(c => 
        c.hidden === true && 
        c.name !== 'toolset' && 
        c.name !== 'notebook' &&
        c.meta && 
        c.meta.title
      )
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.app-container h3 {
  margin-bottom: 20px;
  font-size: 18px;
  color: #303133;
}

.tool-card {
  text-align: center;
  cursor: pointer;
  margin-bottom: 15px;
  transition: all 0.3s;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tool-card i {
  font-size: 36px;
  color: #409eff;
  margin-bottom: 8px;
  display: block;
}

.tool-card div {
  font-size: 14px;
  color: #606266;
  margin-top: 8px;
}
</style>
