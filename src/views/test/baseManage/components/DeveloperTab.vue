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
          <el-tooltip content="保存开发组长" placement="top">
            <el-button 
              @click="batchSaveDevLeader" 
              type="success" 
              icon="el-icon-check" 
              circle
              :disabled="!hasDevLeaderChanges"
              :loading="savingDevLeader"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="用户系统分配" placement="top">
            <el-button @click="handleEdit" type="warning" icon="el-icon-edit" circle :disabled="!selectedRow" style="margin-left: 10px;"></el-button>
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
        <el-table-column prop="devLeader" label="开发组长" width="100" align="center">
          <template slot-scope="scope">
            <el-checkbox
              v-model="scope.row.devLeader"
              :true-label="1"
              :false-label="0"
            ></el-checkbox>
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
      originalDeveloperList: [], // 保存原始数据，用于对比变化
      savingDevLeader: false, // 保存中状态
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
    },
    // 检查是否有开发组长变更
    hasDevLeaderChanges() {
      if (!this.originalDeveloperList || this.originalDeveloperList.length === 0) {
        return false;
      }
      return this.developerList.some((item, index) => {
        const original = this.originalDeveloperList[index];
        return original && original.userId === item.userId && original.devLeader !== item.devLeader;
      });
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
          const list = response.data?.rows || [];
          // 确保 devLeader 字段存在，后端返回的是字符串 "0" 或 "1"，需要转换为数字
          this.developerList = list.map(item => ({
            ...item,
            devLeader: item.devLeader !== undefined ? parseInt(item.devLeader) || 0 : 0
          }));
          // 保存原始数据副本，用于对比变化
          this.originalDeveloperList = this.developerList.map(item => ({
            ...item,
            devLeader: item.devLeader
          }));
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
      this.originalDeveloperList = [];
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
    },
    // 批量保存开发组长变更
    async batchSaveDevLeader() {
      if (!this.hasDevLeaderChanges) {
        this.$message.warning('没有需要保存的变更');
        return;
      }

      // 找出所有变更的数据
      const changes = [];
      this.developerList.forEach((item, index) => {
        const original = this.originalDeveloperList[index];
        if (original && original.userId === item.userId && original.devLeader !== item.devLeader) {
          changes.push({
            userId: item.userId,
            devLeader: item.devLeader // 0 或 1
          });
        }
      });

      if (changes.length === 0) {
        this.$message.warning('没有需要保存的变更');
        return;
      }

      this.savingDevLeader = true;
      try {
        // 批量更新：循环调用单个更新接口
        const updatePromises = changes.map(change => 
          systemUserApi.updateUserBugRolePermission({
            userId: change.userId,
            devLeader: change.devLeader
          })
        );

        const results = await Promise.all(updatePromises);
        
        // 检查是否有失败的
        const failedResults = results.filter(result => result.code !== 20000);
        if (failedResults.length > 0) {
          this.$message.error(`部分更新失败，共${failedResults.length}条`);
          // 重新加载数据以恢复状态
          await this.getDeveloperList();
        } else {
          this.$message.success(`成功保存${changes.length}条开发组长设置`);
          // 更新原始数据
          this.originalDeveloperList = this.developerList.map(item => ({
            ...item,
            devLeader: item.devLeader
          }));
        }
      } catch (error) {
        console.error('批量保存开发组长失败:', error);
        this.$message.error('批量保存失败，请检查网络连接');
        // 重新加载数据以恢复状态
        await this.getDeveloperList();
      } finally {
        this.savingDevLeader = false;
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
