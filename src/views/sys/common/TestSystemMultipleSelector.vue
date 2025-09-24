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
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        highlight-current-row
        style="width: 100%;">
      
      <el-table-column type="selection" width="55"></el-table-column>
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
    <div v-if="selectedSystems.length > 0" style="margin-top: 15px; width: 100%;">
      <div style="margin-bottom: 10px; font-weight: bold; color: #606266;">已选择的系统：</div>
      <div style="width: 100%;">
        <el-tag
          v-for="system in selectedSystems"
          :key="system.systemId"
          closable
          @close="removeSystem(system)"
          style="margin-right: 8px; margin-bottom: 8px;">
          {{ system.systemName }}
        </el-tag>
      </div>
    </div>

    <!-- 分页 -->
    <div style="margin-top: 15px; width: 100%;">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
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
  name: 'TestSystemSelector',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 已选择的系统ID数组
    selectedSystemIds: {
      type: Array,
      default: () => []
    },
    // 是否多选
    multiple: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      systemList: [],
      filteredSystemList: [],
      selectedSystems: [],
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
    selectedSystemIds: {
      handler(newVal) {
        if (this.dialogVisible && this.systemList.length > 0) {
          this.initSelectedSystems();
          this.$nextTick(() => {
            this.setSelectedRows();
          });
        }
      },
      immediate: true
    }
  },
  mounted() {
    // 组件挂载后，如果有已选择的系统ID，初始化选择状态
    if (this.selectedSystemIds && this.selectedSystemIds.length > 0) {
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
          this.initSelectedSystems();
          this.$nextTick(() => {
            this.setSelectedRows();
          });
        } else {
          this.$message.error(response.message || '获取测试系统列表失败');
        }
      } catch (error) {
        this.$message.error('获取测试系统列表失败，请检查网络连接');
      }
    },

    // 初始化已选择的系统
    initSelectedSystems() {
      
      this.selectedSystems = [];
      if (this.selectedSystemIds && this.selectedSystemIds.length > 0) {
        // 从系统列表中找到对应的系统信息
        this.selectedSystems = this.systemList.filter(system => 
          this.selectedSystemIds.includes(system.systemId)
        );
      }
    },

    // 设置表格中已选择的行
    setSelectedRows() {
      
      if (this.$refs.systemTable && this.selectedSystems.length > 0) {
        // 先清除所有选择
        this.$refs.systemTable.clearSelection();
        
        // 延迟设置选中状态，确保表格完全渲染
        setTimeout(() => {
          this.selectedSystems.forEach(selectedSystem => {
            const row = this.filteredSystemList.find(system => system.systemId === selectedSystem.systemId);
            if (row) {
              this.$refs.systemTable.toggleRowSelection(row, true);
            }
          });
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
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.loadSystemList();
    },

    // 表格选择改变
    handleSelectionChange(selection) {
      if (this.multiple) {
        this.selectedSystems = [...selection];
      } else {
        this.selectedSystems = selection.length > 0 ? [selection[selection.length - 1]] : [];
      }
    },

    // 行点击事件
    handleRowClick(row) {
      if (!this.multiple) {
        this.selectedSystems = [row];
        this.$refs.systemTable.clearSelection();
        this.$refs.systemTable.toggleRowSelection(row, true);
      }
    },

    // 移除系统
    removeSystem(system) {
      const index = this.selectedSystems.findIndex(s => s.systemId === system.systemId);
      if (index > -1) {
        this.selectedSystems.splice(index, 1);
        // 同时取消表格中的选择
        const row = this.filteredSystemList.find(s => s.systemId === system.systemId);
        if (row) {
          this.$refs.systemTable.toggleRowSelection(row, false);
        }
      }
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedSystems.length === 0) {
        this.$message.warning('请至少选择一个测试系统');
        return;
      }
      
      const selectedSystemIds = this.selectedSystems.map(system => system.systemId);
      const selectedSystemNames = this.selectedSystems.map(system => system.systemName);
      this.$emit('confirm', selectedSystemIds, selectedSystemNames, this.selectedSystems);
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
