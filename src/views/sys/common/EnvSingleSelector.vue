<template>
  <el-dialog
    title="选择环境"
    :visible.sync="dialogVisible"
    width="70%"
    :close-on-click-modal="false"
    @close="handleClose">

    <!-- 搜索栏 -->
    <div style="margin-bottom: 15px;">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入环境名称搜索"
        prefix-icon="el-icon-search"
        @input="handleSearch"
        clearable>
      </el-input>
    </div>

    <!-- 环境列表 -->
    <div class="table-wrapper">
      <el-table
        ref="envTable"
        :data="filteredEnvList"
        height="400"
        @current-change="handleCurrentChange"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblClick"
        highlight-current-row
        style="width: 100%;">

      <el-table-column prop="envId" label="环境ID" width="100"></el-table-column>
      <el-table-column prop="envName" label="环境名称" min-width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="testStage" label="测试阶段" width="120">
        <template slot-scope="scope">
          <el-tag :type="getTestStageTagType(scope.row.testStage)" size="small">
            {{ scope.row.testStage || '-' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip>
        <template slot-scope="scope">
          <span v-if="scope.row.remark">{{ scope.row.remark }}</span>
          <span v-else style="color: #999;">-</span>
        </template>
      </el-table-column>
    </el-table>
    </div>

    <!-- 已选择的环境 -->
    <div v-if="selectedEnv" style="margin-top: 15px; width: 100%;">
      <div style="margin-bottom: 10px; font-weight: bold; color: #606266;">已选择的环境：</div>
      <div style="width: 100%;">
        <el-tag
          closable
          @close="removeEnv"
          style="margin-right: 8px; margin-bottom: 8px;">
          {{ selectedEnv.envName }}
        </el-tag>
      </div>
    </div>

    <!-- 底部按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import environmentApi from '@/api/environment/environment'

export default {
  name: 'EnvSingleSelector',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 已选择的环境ID（单选）
    selectedEnvId: {
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      envList: [],
      filteredEnvList: [],
      selectedEnv: null,
      searchKeyword: ''
    }
  },
  watch: {
    value(newVal) {
      this.dialogVisible = newVal;
      if (newVal) {
        this.loadEnvList();
      }
    },
    dialogVisible(newVal) {
      this.$emit('input', newVal);
    },
    selectedEnvId: {
      handler(newVal) {
        if (this.dialogVisible && this.envList.length > 0) {
          this.initSelectedEnv();
          this.$nextTick(() => {
            this.setSelectedRow();
          });
        }
      },
      immediate: true
    }
  },
  methods: {
    // 加载环境列表
    async loadEnvList() {
      try {
        const response = await environmentApi.getEnvironmentList({ pageNo: 1, pageSize: 1000 });

        // 处理多种响应格式
        let envData = [];
        if (Array.isArray(response)) {
          envData = response;
        } else if (response.data) {
          if (Array.isArray(response.data)) {
            envData = response.data;
          } else if (response.data.rows && Array.isArray(response.data.rows)) {
            envData = response.data.rows;
          }
        } else if (response.rows && Array.isArray(response.rows)) {
          envData = response.rows;
        } else if (response.code === 20000 && response.data) {
          if (Array.isArray(response.data)) {
            envData = response.data;
          }
        }

        this.envList = envData;
        this.filteredEnvList = [...this.envList];

        // 先初始化已选择的环境，然后设置表格选中状态
        this.initSelectedEnv();
        this.$nextTick(() => {
          this.setSelectedRow();
        });
      } catch (error) {
        console.error('获取环境列表失败', error);
        this.$message.error('获取环境列表失败，请检查网络连接');
      }
    },

    // 初始化已选择的环境
    initSelectedEnv() {
      this.selectedEnv = null;
      if (this.selectedEnvId && this.envList.length > 0) {
        // 从环境列表中找到对应的环境信息
        this.selectedEnv = this.envList.find(env =>
          env.envId == this.selectedEnvId
        );
      }
    },

    // 设置表格中已选择的行
    setSelectedRow() {
      if (this.$refs.envTable && this.selectedEnv) {
        // 先清除所有选择
        this.$refs.envTable.setCurrentRow(null);

        // 延迟设置选中状态，确保表格完全渲染
        setTimeout(() => {
          const row = this.filteredEnvList.find(env => env.envId == this.selectedEnv.envId);
          if (row) {
            this.$refs.envTable.setCurrentRow(row);
          }
        }, 100);
      }
    },

    // 搜索处理
    handleSearch() {
      const keyword = this.searchKeyword.toLowerCase().trim();
      if (!keyword) {
        this.filteredEnvList = [...this.envList];
        return;
      }
      this.filteredEnvList = this.envList.filter(env => {
        return (env.envName && env.envName.toLowerCase().includes(keyword)) ||
               (env.testStage && env.testStage.toLowerCase().includes(keyword)) ||
               (env.remark && env.remark.toLowerCase().includes(keyword));
      });
    },

    // 表格当前行改变
    handleCurrentChange(currentRow) {
      this.selectedEnv = currentRow;
    },

    // 行点击事件
    handleRowClick(row) {
      this.selectedEnv = row;
      this.$refs.envTable.setCurrentRow(row);
    },

    // 行双击事件（直接确认选择）
    handleRowDblClick(row) {
      this.selectedEnv = row;
      this.$refs.envTable.setCurrentRow(row);
      // 双击直接确认选择
      this.handleConfirm();
    },

    // 移除环境
    removeEnv() {
      this.selectedEnv = null;
      this.$refs.envTable.setCurrentRow(null);
    },

    // 确认选择
    handleConfirm() {
      if (!this.selectedEnv) {
        this.$message.warning('请选择一个环境');
        return;
      }

      this.$emit('confirm', this.selectedEnv.envId, this.selectedEnv.envName, this.selectedEnv);
      this.handleClose();
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false;
      this.searchKeyword = '';
      this.$emit('close');
    },

    // 获取测试阶段标签类型
    getTestStageTagType(stage) {
      if (!stage) return 'info';
      const stageUpper = stage.toUpperCase();
      const typeMap = {
        'SIT': 'primary',
        'PAT': 'success',
        'UAT': 'warning',
        'PROD': 'danger'
      };
      return typeMap[stageUpper] || 'info';
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

/* 表格行点击样式 */
.el-table__body tr {
  cursor: pointer;
}

.el-table__body tr:hover {
  background-color: #f5f7fa;
}

/* 减小表格行高和字体 */
::v-deep .el-table td {
  padding: 4px 0;
  font-size: 12px;
}

::v-deep .el-table th {
  padding: 4px 0;
  font-size: 12px;
}

::v-deep .el-table .cell {
  font-size: 12px;
  line-height: 1.4;
}

/* 确保对话框内容占满宽度 */
::v-deep .el-dialog__body {
  width: 100%;
  padding: 20px;
}

/* 确保表格占满宽度 */
::v-deep .el-table {
  width: 100% !important;
}

/* 确保搜索框占满宽度 */
::v-deep .el-input {
  width: 100%;
}

/* 确保对话框不会超出屏幕 */
::v-deep .el-dialog {
  max-width: 95vw;
  margin: 0 auto;
}

/* 确保表格容器有水平滚动 */
::v-deep .el-table__body-wrapper {
  overflow-x: auto;
}

/* 确保表格头部也有滚动 */
::v-deep .el-table__header-wrapper {
  overflow-x: auto;
}

/* 表格包装器样式 */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>
