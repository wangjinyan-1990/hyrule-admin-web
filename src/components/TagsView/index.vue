<template>
  <div class="tags-view-container">
    <el-scrollbar class="tags-scroll" noresize>
      <div class="tags">
        <router-link
          v-for="tag in visitedViews"
          :key="tag.path"
          :to="tag.fullPath"
          class="tag-item"
          :class="{ active: tag.path === $route.path }"
        >
          <span>{{ tag.title }}</span>
          <i class="el-icon-close" @click.prevent.stop="close(tag)" />
        </router-link>
      </div>
    </el-scrollbar>
  </div>
  
</template>

<script>
export default {
  name: 'TagsView',
  computed: {
    visitedViews() {
      return this.$store.getters.visitedViews || []
    }
  },
  watch: {
    $route: {
      handler(route) {
        this.add(route)
      },
      immediate: true
    }
  },
  methods: {
    add(route) {
      if (route.name) this.$store.dispatch('tagsView/addView', route)
    },
    close(tag) {
      this.$store.dispatch('tagsView/delView', { name: tag.name, path: tag.path })
      if (tag.path === this.$route.path) {
        const last = (this.visitedViews || [])[this.visitedViews.length - 1]
        this.$router.push(last ? last.fullPath : '/')
      }
    }
  }
}
</script>

<style scoped>
.tags-view-container {
  height: 50px;
  background: transparent;
  border-bottom: none;
}
.tags-scroll { height: 50px; }
.tags { display: flex; align-items: center; height: 50px; padding: 0 8px; }
.tag-item {
  display: inline-flex;
  align-items: center;
  height: 28px;
  line-height: 28px;
  padding: 0 10px;
  margin: 11px 8px 0 0; /* 垂直居中到50px 导航行内 */
  background: #f0f2f5;
  border: 1px solid #e3e3e3;
  border-radius: 2px;
  color: #606266;
  font-size: 12px;
  white-space: nowrap;
}
.tag-item.active { background: #409eff; color: #fff; border-color: #409eff; }
.tag-item .el-icon-close { margin-left: 6px; font-size: 12px; }

/* 隐藏所有滚动条（不显示横向条与小三角），但保留横向滚动行为 */
::v-deep .el-scrollbar__wrap {
  overflow-x: auto;
  overflow-y: hidden !important;
  scrollbar-width: none;            /* Firefox */
  -ms-overflow-style: none;         /* IE/Edge */
}
::v-deep .el-scrollbar__wrap::-webkit-scrollbar { /* Chrome/Safari */
  width: 0;
  height: 0;
}
/* 隐藏 Element 自带的滚动条轨道与拇指 */
::v-deep .el-scrollbar__bar { display: none !important; }
</style>


