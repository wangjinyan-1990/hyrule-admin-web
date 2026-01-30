<template>
  <div class="relation-content">
    <div class="relation-header">
      <el-button
        v-if="mode !== 'view'"
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="handleAdd"
      >
        添加缺陷
      </el-button>
    </div>

    <el-table
      :data="bugsList"
      border
      stripe
      style="width: 100%; margin-top: 10px;"
      max-height="300"
    >
      <el-table-column prop="bugId" label="缺陷ID" width="180" />
      <el-table-column prop="bugTitle" label="缺陷标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="bugStatus" label="状态" width="100" />
      <el-table-column prop="severity" label="严重程度" width="100" />
    </el-table>

    <div v-if="bugsList.length === 0" class="empty-tip">
      暂无关联缺陷
    </div>
  </div>
</template>

<script>
export default {
  name: 'RequireRelatedBugs',
  props: {
    requirePointId: {
      type: [String, Number],
      default: null
    },
    mode: {
      type: String,
      default: 'view'
    }
  },
  data() {
    return {
      bugsList: []
    }
  },
  watch: {
    requirePointId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.loadBugs()
        }
      }
    }
  },
  methods: {
    // 加载关联缺陷
    async loadBugs() {
      // TODO: 实现加载关联缺陷的API调用
      this.bugsList = []
    },

    // 添加缺陷
    handleAdd() {
      this.$message.info('添加关联缺陷功能开发中')
      // TODO: 实现添加关联缺陷的对话框
    }
  }
}
</script>

<style lang="scss" scoped>
.relation-content {
  padding: 10px 0;
}

.relation-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

// 关联缺陷表格字体大小
::v-deep .el-table {
  font-size: 12px;

  th {
    font-size: 12px;
  }

  td {
    font-size: 12px;
  }

  .cell {
    font-size: 12px;
  }
}
</style>

