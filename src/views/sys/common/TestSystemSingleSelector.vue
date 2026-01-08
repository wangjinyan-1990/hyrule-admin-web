<template>
  <el-dialog
    title="选择测试系统"
    :visible.sync="dialogVisible"
    width="90%"
    :close-on-click-modal="false"
    @close="handleClose">

    <!-- 搜索栏 -->
    <div style="margin-bottom: 15px;">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入系统名称搜索"
        prefix-icon="el-icon-search"
        @input="handleSearch"
        clearable>
      </el-input>
    </div>

    <!-- 系统列表 -->
    <div class="table-wrapper">
      <el-table
        ref="systemTable"
        :data="filteredSystemList"
        height="400"
        @current-change="handleCurrentChange"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDblClick"
        highlight-current-row
        style="width: 100%;">

      <el-table-column prop="systemId" label="系统ID" width="90"></el-table-column>
      <el-table-column prop="systemName" label="系统名称" min-width="150" show-overflow-tooltip></el-table-column>
      <el-table-column prop="orgName" label="负责机构" min-width="120" show-overflow-tooltip></el-table-column>
      <el-table-column prop="systemType" label="系统类型" width="90">
        <template slot-scope="scope">
          <el-tag :type="scope.row.systemType === '1' ? 'primary' : 'success'" size="small">
            {{ getSystemTypeText(scope.row.systemType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="systemStage" label="系统阶段" width="100">
        <template slot-scope="scope">
          <el-tag :type="getStageTagType(scope.row.systemStage)" size="small">
            {{ getStageText(scope.row.systemStage) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="testManagerName" label="测试经理" min-width="100" show-overflow-tooltip></el-table-column>
      <el-table-column prop="devManagerName" label="开发经理" min-width="100" show-overflow-tooltip></el-table-column>
      </el-table>
    </div>

    <!-- 已选择的系统 -->
    <div v-if="selectedSystem" style="margin-top: 15px; width: 100%;">
      <div style="margin-bottom: 10px; font-weight: bold; color: #606266;">已选择的系统：</div>
      <div style="width: 100%;">
        <el-tag
          closable
          @close="removeSystem"
          style="margin-right: 8px; margin-bottom: 8px;">
          {{ selectedSystem.systemName }}
        </el-tag>
      </div>
    </div>

    <!-- 分页 -->
    <div style="margin-top: 15px; width: 100%;">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        :current-page="searchModel.pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="searchModel.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="width: 100%;">
      </el-pagination>
    </div>

    <!-- 底部按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import testSystemApi from '@/api/test/baseManage/testSystem'

export default {
  name: 'TestSystemSingleSelector',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 已选择的系统ID（单选）
    selectedSystemId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dialogVisible: false,
      systemList: [],
      filteredSystemList: [],
      selectedSystem: null,
      total: 0,
      searchKeyword: '',
      searchModel: {
        pageNo: 1,
        pageSize: 20,
        systemName: ''
      },
      // 系统类型选项
      systemTypeOptions: [
        { dataValue: '1', dataName: '初测' },
        { dataValue: '2', dataName: '优化' }
      ],
      // 系统阶段选项
      systemStageOptions: [
        { dataValue: '1', dataName: '准备阶段' },
        { dataValue: '2', dataName: '实施阶段' },
        { dataValue: '3', dataName: '收尾阶段' }
      ]
    }
  },
  watch: {
    value(newVal) {
      this.dialogVisible = newVal;
      if (newVal) {
        this.loadSystemList();
      }
    },
    dialogVisible(newVal) {
      this.$emit('input', newVal);
    },
    selectedSystemId: {
      handler(newVal) {
        if (this.dialogVisible && this.systemList.length > 0) {
          this.initSelectedSystem();
          this.$nextTick(() => {
            this.setSelectedRow();
          });
        }
      },
      immediate: true
    }
  },
  mounted() {
    // 组件挂载后，如果有已选择的系统ID，初始化选择状态
    if (this.selectedSystemId) {
    }
  },
  methods: {
    // 加载系统列表
    async loadSystemList() {
      try {
        const response = await testSystemApi.getTestSystemList(this.searchModel);

        if (response.code === 20000) {
          this.systemList = response.data?.rows || [];
          this.total = response.data?.total || 0;
          this.filteredSystemList = [...this.systemList];

          // 先初始化已选择的系统，然后设置表格选中状态
          this.initSelectedSystem();
          this.$nextTick(() => {
            this.setSelectedRow();
          });
        } else {
          this.$message.error(response.message || '获取测试系统列表失败');
        }
      } catch (error) {
        this.$message.error('获取测试系统列表失败，请检查网络连接');
      }
    },

    // 初始化已选择的系统
    initSelectedSystem() {

      this.selectedSystem = null;
      if (this.selectedSystemId && this.systemList.length > 0) {
        // 从系统列表中找到对应的系统信息
        this.selectedSystem = this.systemList.find(system =>
          system.systemId === this.selectedSystemId
        );
      }
    },

    // 设置表格中已选择的行
    setSelectedRow() {

      if (this.$refs.systemTable && this.selectedSystem) {
        // 先清除所有选择
        this.$refs.systemTable.setCurrentRow(null);

        // 延迟设置选中状态，确保表格完全渲染
        setTimeout(() => {
          const row = this.filteredSystemList.find(system => system.systemId === this.selectedSystem.systemId);
          if (row) {
            this.$refs.systemTable.setCurrentRow(row);
          }
        }, 100);
      }
    },

    // 搜索处理
    handleSearch() {
      this.searchModel.systemName = this.searchKeyword;
      this.searchModel.pageNo = 1;
      this.loadSystemList();
    },

    // 分页大小改变
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.loadSystemList();
    },

    // 当前页改变
    handlePageChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.loadSystemList();
    },

    // 表格当前行改变
    handleCurrentChange(currentRow) {
      this.selectedSystem = currentRow;
    },

    // 行点击事件
    handleRowClick(row) {
      this.selectedSystem = row;
      this.$refs.systemTable.setCurrentRow(row);
    },

    // 行双击事件（直接确认选择）
    handleRowDblClick(row) {
      this.selectedSystem = row;
      this.$refs.systemTable.setCurrentRow(row);
      // 双击直接确认选择
      this.handleConfirm();
    },

    // 移除系统
    removeSystem() {
      this.selectedSystem = null;
      this.$refs.systemTable.setCurrentRow(null);
    },

    // 确认选择
    handleConfirm() {
      if (!this.selectedSystem) {
        this.$message.warning('请选择一个测试系统');
        return;
      }

      this.$emit('confirm', this.selectedSystem.systemId, this.selectedSystem.systemName, this.selectedSystem);
      this.handleClose();
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false;
      this.searchKeyword = '';
      this.searchModel.systemName = '';
      this.searchModel.pageNo = 1;
      this.$emit('close');
    },

    // 获取系统类型文本
    getSystemTypeText(type) {
      const item = this.systemTypeOptions.find(option => option.dataValue === type);
      return item ? item.dataName : '未知';
    },

    // 获取系统阶段文本
    getStageText(stage) {
      const item = this.systemStageOptions.find(option => option.dataValue === stage);
      return item ? item.dataName : '未知';
    },

    // 获取阶段标签类型
    getStageTagType(stage) {
      const typeMap = {
        '1': 'info',
        '2': 'warning',
        '3': 'success'
      };
      return typeMap[stage] || 'info';
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

/* 确保分页组件占满宽度 */
::v-deep .el-pagination {
  width: 100%;
  text-align: center;
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

/* 表格最小宽度，确保所有列都能显示 */
::v-deep .el-table {
  min-width: 800px;
}

/* 确保对话框内容区域有合适的最大宽度 */
::v-deep .el-dialog__body {
  max-width: 100%;
  overflow-x: hidden;
}

/* 表格包装器样式 */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}
</style>
