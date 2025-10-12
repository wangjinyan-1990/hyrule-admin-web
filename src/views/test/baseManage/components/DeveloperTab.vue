<template>
  <div class="developer-container">
    <!-- 搜索栏 -->
    <el-card id="search">
      <el-row>
        <el-col :span="20">
          <el-input v-model="searchModel.userName" placeholder="用户名" style="width: 150px; margin-right: 10px;"></el-input>
          <el-input v-model="searchModel.loginName" placeholder="登录名" style="width: 150px; margin-right: 10px;"></el-input>
          <el-input v-model="searchModel.phone" placeholder="电话" style="width: 150px; margin-right: 10px;"></el-input>
          <el-button @click="getDeveloperList" type="primary" round icon="el-icon-search">查询</el-button>
          <el-button @click="resetSearch" type="info" round icon="el-icon-refresh">重置</el-button>
        </el-col>
        <el-col :span="4" align="right">
          <el-tooltip content="用户系统分配" placement="top">
            <el-button @click="handleEdit" type="warning" icon="el-icon-edit" circle :disabled="!selectedRow"></el-button>
          </el-tooltip>
        </el-col>
      </el-row>
    </el-card>

    <!-- 结果栏 -->
    <el-card>
      <el-table
        :data="developerList"
        stripe
        style="width: 100%"
        height="500"
        @row-dblclick="handleEdit"
        @current-change="handleRowChange"
        highlight-current-row>
        <el-table-column type="index" width="55" label="序号"></el-table-column>
        <el-table-column prop="userId" label="用户ID" width="80" v-if="false"></el-table-column>
        <el-table-column prop="userName" label="姓名" width="120"></el-table-column>
        <el-table-column prop="loginName" label="登录名" width="120"></el-table-column>
        <el-table-column prop="phone" label="电话" width="150"></el-table-column>
        <el-table-column prop="orgName" label="所属机构" width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.orgName">{{ scope.row.orgName }}</span>
            <span v-else style="color: #999;">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="systemIds" label="所属系统ID" width="100" v-if="false"></el-table-column>
        <el-table-column prop="systemNames" label="所属系统" width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.systemNames">{{ scope.row.systemNames }}</span>
            <span v-else style="color: #999;">未分配</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="searchModel.pageNo"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="searchModel.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 用户系统分配对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" @close="resetForm">
      <el-form ref="developerFormRef" :model="developerForm" :rules="rules" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="developerForm.userName" disabled></el-input>
        </el-form-item>
        <el-form-item label="登录名">
          <el-input v-model="developerForm.loginName" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="developerForm.email" disabled></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="developerForm.phone" disabled></el-input>
        </el-form-item>
        <el-form-item label="所属机构">
          <el-input v-model="developerForm.orgName" disabled></el-input>
        </el-form-item>
        <el-form-item label="所属系统" prop="systemNames">
          <el-input
            v-model="systemDisplayText"
            placeholder="请选择所属系统"
            readonly
            @click="handleSystemSelect">
            <el-button slot="append" icon="el-icon-search" @click="handleSystemSelect"></el-button>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 测试系统选择器 -->
    <testSystemSelector
      v-model="systemSelectorVisible"
      :selected-system-ids="developerForm.systemIds ? developerForm.systemIds.split(',') : []"
      @confirm="handleSystemConfirm"
      @close="resetSystemSelector">
    </testSystemSelector>
  </div>
</template>

<script>
import systemUserApi from '@/api/test/baseManage/testSystemMember'
import testSystemSelector from '@/views/sys/common/TestSystemMultipleSelector'

export default {
  components: {
    testSystemSelector
  },
  name: 'DeveloperTab',
  data() {
    return {
      total: 0,
      roleId: '0001', // 默认角色ID，可以根据需要动态设置
      searchModel: {
        pageNo: 1,
        pageSize: 10,
        userName: '',
        loginName: '',
        phone: ''
      },
      developerList: [],
      dialogVisible: false,
      selectedRow: null,
      systemSelectorVisible: false,
      systemDisplayText: '',
      developerForm: {
        userId: '',
        userName: '',
        loginName: '',
        email: '',
        phone: '',
        orgName: '',
        systemIds: '',
        systemNames: ''
      },
      rules: {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
        ],
        loginName: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' }
        ],
        orgName: [
          { required: true, message: '请输入所属机构', trigger: 'blur' }
        ],
        systemNames: [
          { required: true, message: '请输入所属系统', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return '用户系统分配';
    }
  },
  created() {
    this.getDeveloperList();
  },
  methods: {
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.getDeveloperList();
    },
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getDeveloperList();
    },
    async getDeveloperList() {
      try {
        const response = await systemUserApi.getUsersByRoleId(this.roleId, this.searchModel);

        if (response.code === 20000) {
          // 适配新的数据格式：data.rows 和 data.total
          this.developerList = response.data?.rows || [];
          this.total = response.data?.total || this.developerList.length;
        } else {
          this.$message.error(response.message || '获取开发人员列表失败');
          this.developerList = [];
          this.total = 0;
        }
      } catch (error) {
        this.$message.error('获取开发人员列表失败，请检查网络连接');
        this.developerList = [];
        this.total = 0;
      }
    },
    resetSearch() {
      this.searchModel.userName = '';
      this.searchModel.loginName = '';
      this.searchModel.phone = '';
      this.searchModel.pageNo = 1;
      this.getDeveloperList();
    },
    handleEdit(row) {
      if (row && row.userId) {
        this.selectedRow = row;
      } else if (!this.selectedRow) {
        this.$message.warning('请先选择要编辑的开发人员');
        return;
      }
      this.dialogVisible = true;
      this.loadDeveloperData();
    },
    handleRowChange(currentRow) {
      this.selectedRow = currentRow;
    },
    loadDeveloperData() {
      if (this.selectedRow) {
        this.developerForm = {
          userId: this.selectedRow.userId,
          userName: this.selectedRow.userName,
          loginName: this.selectedRow.loginName,
          email: this.selectedRow.email || '',
          phone: this.selectedRow.phone || '',
          orgName: this.selectedRow.orgName || '',
          systemIds: this.selectedRow.systemIds || '',
          systemNames: this.selectedRow.systemNames || ''
        };
        this.updateSystemDisplayText();
      }
    },
    resetForm() {
      if (this.$refs.developerFormRef) {
        this.$refs.developerFormRef.resetFields();
      }
      this.developerForm = {
        userId: '',
        userName: '',
        loginName: '',
        email: '',
        phone: '',
        orgName: '',
        systemIds: '',
        systemNames: ''
      };
      this.systemDisplayText = '';
    },
    async submitForm() {
      this.$refs.developerFormRef.validate(async (valid) => {
        if (!valid) return;

        try {
          const response = await systemUserApi.updateUser(this.developerForm);

          if (response.code === 20000) {
            this.$message.success('编辑成功');
            this.dialogVisible = false;
            this.getDeveloperList();
          } else {
            this.$message.error(response.message || '编辑失败');
          }
        } catch (error) {
          this.$message.error('编辑失败，请检查网络连接');
        }
      });
    },
    // 系统选择器相关方法
    handleSystemSelect() {
      this.systemSelectorVisible = true;
    },
    handleSystemConfirm(selectedSystemIds, selectedSystemNames, selectedSystems) {
      this.developerForm.systemIds = selectedSystemIds.join(',');
      this.developerForm.systemNames = selectedSystemNames.join(',');
      this.updateSystemDisplayText();
    },
    resetSystemSelector() {
      this.systemSelectorVisible = false;
    },
    updateSystemDisplayText() {
      if (this.developerForm.systemNames) {
        this.systemDisplayText = this.developerForm.systemNames;
      } else {
        this.systemDisplayText = '';
      }
    }
  }
};
</script>

<style scoped>
.app-main {
  padding: 10px;
}

#search .el-input {
  width: 200px;
  margin-right: 10px;
}

.el-card {
  margin-bottom: 10px;
}

.el-table__body tr.current-row > td {
  background-color: #b3d9ff !important;
}

.el-table__body tr.current-row:hover > td {
  background-color: #b3d9ff !important;
}

.el-table__body tr:not(.current-row):hover > td {
  background-color: #f5f7fa !important;
}

/* 确保组件占满宽度 */
.developer-container {
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
}

/* 确保卡片占满宽度 */
::v-deep .el-card {
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
}

/* 减小表格行高 */
::v-deep .el-table th,
::v-deep .el-table td {
  height: 24px !important;
  line-height: 24px !important;
  padding: 0 !important;
  font-size: 12px !important;
}

::v-deep .el-table__row {
  height: 24px !important;
}

::v-deep .el-table .cell {
  padding: 0 5px !important;
  line-height: 24px !important;
}

::v-deep .el-button--mini {
  padding: 3px 6px !important;
  font-size: 10px !important;
}
</style>
