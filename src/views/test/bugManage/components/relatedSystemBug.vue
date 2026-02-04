<template>
  <div class="related-system-bug-container">
    <div class="empty-tip">暂无关联系统协同处理缺陷</div>
  </div>
</template>

<script>
export default {
  name: 'relatedSystemBug',
  props: {
    bugId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      loading: false
    }
  },
  watch: {
    bugId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // 可以在这里加载关联系统协同处理缺陷的数据
          // this.loadRelatedSystemBugs()
        }
      }
    }
  },
  methods: {
    // 加载关联系统协同处理缺陷
    // async loadRelatedSystemBugs() {
    //   if (!this.bugId) return
    //   this.loading = true
    //   try {
    //     // TODO: 调用API加载数据
    //   } catch (error) {
    //     console.error('加载关联系统协同处理缺陷失败:', error)
    //   } finally {
    //     this.loading = false
    //   }
    // }
  }
}
</script>

<style lang="scss" scoped>
.related-system-bug-container {
  padding: 20px;
  min-height: 200px;
}

.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}
</style>
