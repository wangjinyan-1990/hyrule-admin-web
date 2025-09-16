<template>
  <el-dialog
    title="选择角色"
    :visible.sync="dialogVisible"
    width="600px"
    @close="handleClose"
    :close-on-click-modal="false">

    <!-- 搜索栏 -->
    <div style="margin-bottom: 15px;">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入角色名称搜索"
        prefix-icon="el-icon-search"
        @input="handleSearch"
        clearable>
      </el-input>
    </div>

    <!-- 角色列表 -->
    <el-table
      ref="roleTable"
      :data="filteredRoleList"
      height="400"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
      highlight-current-row>

      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="roleId" label="角色ID" width="100"></el-table-column>
      <el-table-column prop="roleName" label="角色名称" width="150"></el-table-column>
    </el-table>

    <!-- 已选择的角色 -->
    <div v-if="selectedRoles.length > 0" style="margin-top: 15px;">
      <div style="margin-bottom: 10px; font-weight: bold; color: #606266;">已选择的角色：</div>
      <el-tag
        v-for="role in selectedRoles"
        :key="role.roleId"
        closable
        @close="removeRole(role)"
        style="margin-right: 8px; margin-bottom: 8px;">
        {{ role.roleName }}
      </el-tag>
    </div>

    <!-- 分页 -->
    <div style="margin-top: 15px; text-align: center;">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchModel.pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="searchModel.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
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
import roleApi from '@/api/sys/role'

export default {
  name: 'RoleSelector',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    // 已选择的角色ID数组
    selectedRoleIds: {
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
      roleList: [],
      filteredRoleList: [],
      selectedRoles: [],
      total: 0,
      searchKeyword: '',
      searchModel: {
        pageNo: 1,
        pageSize: 20,
        roleName: ''
      }
    }
  },
  watch: {
    value(newVal) {
      this.dialogVisible = newVal;
      if (newVal) {
        this.loadRoleList();
      }
    },
    dialogVisible(newVal) {
      this.$emit('input', newVal);
    }
  },
  methods: {
    // 加载角色列表
    async loadRoleList() {
      try {
        console.log('开始加载角色列表，搜索条件:', this.searchModel);
        const response = await roleApi.getRoleList(this.searchModel);
        console.log('角色列表API响应:', response);

        if (response.code === 20000) {
          this.roleList = response.data?.rows || [];
          this.total = response.data?.total || 0;
          this.filteredRoleList = [...this.roleList];
          console.log('角色列表加载成功，共', this.roleList.length, '条记录');
          
          // 先初始化已选择的角色，然后设置表格选中状态
          this.initSelectedRoles();
          this.$nextTick(() => {
            this.setSelectedRows();
          });
        } else {
          this.$message.error(response.message || '获取角色列表失败');
        }
      } catch (error) {
        console.error('获取角色列表失败:', error);
        this.$message.error('获取角色列表失败，请检查网络连接');
      }
    },

    // 初始化已选择的角色
    initSelectedRoles() {
      console.log('初始化已选择的角色，selectedRoleIds:', this.selectedRoleIds);
      console.log('当前角色列表:', this.roleList);
      
      this.selectedRoles = [];
      if (this.selectedRoleIds && this.selectedRoleIds.length > 0) {
        // 从角色列表中找到对应的角色信息
        this.selectedRoles = this.roleList.filter(role => 
          this.selectedRoleIds.includes(role.roleId)
        );
        console.log('过滤后的已选择角色:', this.selectedRoles);
      }
    },

    // 设置表格中已选择的行
    setSelectedRows() {
      console.log('设置表格选中行，selectedRoles:', this.selectedRoles);
      console.log('filteredRoleList:', this.filteredRoleList);
      
      if (this.$refs.roleTable && this.selectedRoles.length > 0) {
        this.selectedRoles.forEach(selectedRole => {
          const row = this.filteredRoleList.find(role => role.roleId === selectedRole.roleId);
          console.log('查找角色行:', selectedRole.roleId, '找到:', row);
          if (row) {
            this.$refs.roleTable.toggleRowSelection(row, true);
            console.log('设置行选中:', row.roleName);
          } else {
            console.warn('未找到角色行:', selectedRole.roleId);
          }
        });
      } else {
        console.log('表格引用不存在或没有已选择的角色');
      }
    },

    // 搜索处理
    handleSearch() {
      this.searchModel.roleName = this.searchKeyword;
      this.searchModel.pageNo = 1;
      this.loadRoleList();
    },

    // 分页大小改变
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.loadRoleList();
    },

    // 当前页改变
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.loadRoleList();
    },

    // 表格选择改变
    handleSelectionChange(selection) {
      if (this.multiple) {
        this.selectedRoles = [...selection];
      } else {
        this.selectedRoles = selection.length > 0 ? [selection[selection.length - 1]] : [];
      }
    },

    // 行点击事件
    handleRowClick(row) {
      if (!this.multiple) {
        this.selectedRoles = [row];
        this.$refs.roleTable.clearSelection();
        this.$refs.roleTable.toggleRowSelection(row, true);
      }
    },

    // 移除角色
    removeRole(role) {
      const index = this.selectedRoles.findIndex(r => r.roleId === role.roleId);
      if (index > -1) {
        this.selectedRoles.splice(index, 1);
        // 同时取消表格中的选择
        const row = this.filteredRoleList.find(r => r.roleId === role.roleId);
        if (row) {
          this.$refs.roleTable.toggleRowSelection(row, false);
        }
      }
    },

    // 确认选择
    handleConfirm() {
      if (this.selectedRoles.length === 0) {
        this.$message.warning('请至少选择一个角色');
        return;
      }

      const selectedRoleIds = this.selectedRoles.map(role => role.roleId);
      this.$emit('confirm', selectedRoleIds, this.selectedRoles);
      this.handleClose();
    },

    // 关闭对话框
    handleClose() {
      this.dialogVisible = false;
      this.searchKeyword = '';
      this.searchModel.roleName = '';
      this.searchModel.pageNo = 1;
      this.$emit('close');
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
</style>
