<template>
  <div class="execution-related-bugs-container">
    <div class="tab-content">
      <el-alert
        title="功能开发中"
        type="info"
        :closable="false"
        show-icon>
      </el-alert>
    </div>
  </div>
</template>

<script>
export default {
  name: 'executionRelatedBugs',
  props: {
    // 用例执行ID
    usecaseExecutionId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      loading: false,
      bugsList: []
    }
  },
  mounted() {
    if (this.usecaseExecutionId) {
      this.loadDefects()
    }
  },
  watch: {
    usecaseExecutionId(newVal) {
      if (newVal) {
        this.loadDefects()
      }
    }
  },
  methods: {
    // 加载关联的缺陷
    async loadDefects() {
      if (!this.usecaseExecutionId) {
        return
      }
      // TODO: 实现加载关联缺陷的逻辑
      this.loading = true
      try {
        // 调用API加载关联缺陷
        // const response = await xxxApi.getRelatedBugs(this.usecaseExecutionId)
        // this.bugsList = response.data || []
      } catch (error) {
        console.error('加载关联缺陷失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.execution-related-bugs-container {
  padding: 20px;
}

.tab-content {
  min-height: 200px;
}
</style>
