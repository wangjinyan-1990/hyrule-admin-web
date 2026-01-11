<template>
  <el-dialog title="选择用户" :visible.sync="visible" width="600px" @close="handleClose">
    <div>
      <el-row style="margin-bottom: 10px;">
        <el-col :span="18">
          <el-input v-model="searchModel.userName" placeholder="用户名" style="width: 200px; margin-right: 10px;"></el-input>
          <el-button @click="getUserList" type="primary" round icon="el-icon-search">查询</el-button>
          <el-button @click="resetSearch" type="info" round icon="el-icon-refresh">重置</el-button>
        </el-col>
      </el-row>

      <el-table 
        :data="userList" 
        stripe 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        ref="userTable">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column type="index" width="55" label="序号"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="80" v-if="false"></el-table-column>
        <el-table-column prop="userName" label="用户名" width="150"></el-table-column>
        <el-table-column prop="loginName" label="登录名" width="150"></el-table-column>
        <el-table-column prop="phone" label="电话" width="150"></el-table-column>
      </el-table>

      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="searchModel.pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="searchModel.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="margin-top: 10px;">
      </el-pagination>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm" :disabled="selectedUsers.length === 0">
        确定 (已选择 {{ selectedUsers.length }} 个用户)
      </el-button>
    </span>
  </el-dialog>
</template>

<style>
  /* 表格选中行高亮颜色 */
  .el-table__body tr.current-row > td {
    background-color: #b3d9ff !important;
  }

  /* 鼠标悬停时保持选中行的颜色不变 */
  .el-table__body tr.current-row:hover > td {
    background-color: #b3d9ff !important;
  }

  /* 未选中行的悬停效果 */
  .el-table__body tr:not(.current-row):hover > td {
    background-color: #f5f7fa !important;
  }
</style>

<script>
import userApi from '@/api/sys/user'

export default {
  name: 'UserSelectors',
  props: {
    // 控制弹窗显示
    value: {
      type: Boolean,
      default: false
    },
    // 排除的用户ID列表（可选）
    excludeUserIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchModel: {
        pageNo: 1,
        pageSize: 10,
        userName: ''
      },
      userList: [],
      total: 0,
      selectedUsers: [], // 当前页面的选中项
      allSelectedUsers: [], // 所有已选中的用户（跨页面）
      selectedUserIds: [] // 已选用户的ID列表，用于快速查找
    }
  },
  computed: {
    visible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.resetData();
        this.getUserList();
      }
    }
  },
  methods: {
    resetData() {
      this.searchModel = {
        pageNo: 1,
        pageSize: 10,
        userName: ''
      };
      this.userList = [];
      this.total = 0;
      this.selectedUsers = [];
      this.allSelectedUsers = [];
      this.selectedUserIds = [];
    },
    getUserList() {
      userApi.getUserList(this.searchModel).then(response => {
        let users = response.data.rows || [];
        // 过滤掉排除的用户
        if (this.excludeUserIds && this.excludeUserIds.length > 0) {
          users = users.filter(user => !this.excludeUserIds.includes(user.userId));
        }
        this.userList = users;
        this.total = response.data.total;
        
        // 数据加载后，恢复之前已选中用户的选中状态
        this.$nextTick(() => {
          this.restoreSelection();
        });
      });
    },
    resetSearch() {
      this.searchModel.userName = '';
      this.searchModel.pageNo = 1;
      this.getUserList();
    },
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.getUserList();
    },
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getUserList();
    },
    handleSelectionChange(selection) {
      // 更新当前页面的选中项
      this.selectedUsers = selection;
      
      // 获取当前页面选中用户的ID列表
      const currentPageSelectedIds = selection.map(user => user.userId);
      
      // 移除当前页面中取消选中的用户
      this.allSelectedUsers = this.allSelectedUsers.filter(user => {
        // 如果用户不在当前页面，保留
        const isInCurrentPage = this.userList.some(u => u.userId === user.userId);
        if (!isInCurrentPage) {
          return true;
        }
        // 如果用户在当前页面，检查是否被选中
        return currentPageSelectedIds.includes(user.userId);
      });
      
      // 添加当前页面新选中的用户
      selection.forEach(user => {
        const exists = this.allSelectedUsers.some(u => u.userId === user.userId);
        if (!exists) {
          this.allSelectedUsers.push(user);
        }
      });
      
      // 更新已选用户ID列表
      this.selectedUserIds = this.allSelectedUsers.map(user => user.userId);
    },
    
    // 恢复选中状态
    restoreSelection() {
      if (!this.$refs.userTable) {
        return;
      }
      
      // 清除所有选中状态
      this.$refs.userTable.clearSelection();
      
      // 恢复之前已选中用户的选中状态
      this.userList.forEach(user => {
        if (this.selectedUserIds.includes(user.userId)) {
          this.$refs.userTable.toggleRowSelection(user, true);
        }
      });
    },
    handleConfirm() {
      if (this.allSelectedUsers.length === 0) {
        this.$message.warning('请先选择用户');
        return;
      }
      // 返回所有已选中的用户（跨页面）
      this.$emit('confirm', this.allSelectedUsers);
      this.handleClose();
    },
    handleClose() {
      this.visible = false;
      this.$emit('close');
    }
  }
}
</script>
