<template>
  <div>
    <!-- 搜索栏 -->
    <el-card id="search">
      <el-row>
        <el-col :span="18">
          <el-input v-model="searchModel.systemName" placeholder="系统名称" style="width: 200px; margin-right: 10px;"></el-input>
          <el-input v-model="searchModel.configurationPeopleNames" placeholder="人员名称" style="width: 200px; margin-right: 10px;"></el-input>
          <el-button @click="getSysConfigInfoList" type="primary" round icon="el-icon-search">查询</el-button>
          <el-button @click="resetSearch" type="info" round icon="el-icon-refresh">重置</el-button>
        </el-col>
        <!-- align是对齐，right就是右对齐 -->
        <el-col :span="6" align="right">
          <el-tooltip content="新增" placement="top">
            <el-button @click="handleAdd" type="primary" icon="el-icon-plus" circle></el-button>
          </el-tooltip>
          <el-tooltip content="编辑" placement="top">
            <el-button @click="handleEdit" type="warning" icon="el-icon-edit" circle :disabled="!selectedRow"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button @click="handleDelete" type="danger" icon="el-icon-delete" circle :disabled="!selectedRow"></el-button>
          </el-tooltip>
        </el-col>
      </el-row>
    </el-card>

    <!-- 结果栏 -->
    <el-card>
      <el-table
        :data="sysConfigInfoList"
        stripe
        style="width: 100%"
        @row-dblclick="handleEdit"
        @current-change="handleRowChange"
        highlight-current-row>
        <el-table-column type="index" width="55" label="序号"></el-table-column>
        <el-table-column prop="configurationId" label="配置ID" width="80" v-if="false"></el-table-column>
        <el-table-column prop="systemId" label="系统ID" width="100" v-if="false"></el-table-column>
        <el-table-column prop="systemName" label="系统名称" width="200"></el-table-column>
        <el-table-column prop="sysAbbreviation" label="系统简称" width="150"></el-table-column>
        <el-table-column prop="privateToken" label="访问令牌" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="configurationPeopleNames" label="配置人员" min-width="200" show-overflow-tooltip>
          <template slot-scope="scope">
            {{ scope.row.configurationPeopleNames || '未配置' }}
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

    <!-- 新增/编辑系统配置信息对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" @close="resetForm">
      <el-form ref="sysConfigInfoFormRef" :model="sysConfigInfoForm" :rules="rules" label-width="100px">
        <el-form-item label="系统" prop="systemId">
          <el-input
            v-model="sysConfigInfoForm.systemName"
            placeholder="请选择系统"
            readonly
            @click.native="handleSelectSystem">
            <el-button slot="append" icon="el-icon-search" @click="handleSelectSystem"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="系统简称" prop="sysAbbreviation">
          <el-input v-model="sysConfigInfoForm.sysAbbreviation" placeholder="请输入系统简称（只能为字母和数字）" maxlength="50" @input="handleSysAbbreviationInput"></el-input>
        </el-form-item>
        <el-form-item label="访问令牌" prop="privateToken">
          <el-input v-model="sysConfigInfoForm.privateToken" placeholder="请输入访问令牌"></el-input>
        </el-form-item>
        <el-form-item label="配置人员" prop="configurationPeopleIds">
          <el-input
            v-model="sysConfigInfoForm.configurationPeopleNames"
            placeholder="请选择配置人员"
            readonly
            @click.native="handleSelectUsers">
            <el-button slot="append" icon="el-icon-search" @click="handleSelectUsers"></el-button>
          </el-input>
          <div v-if="sysConfigInfoForm.selectedUsers && sysConfigInfoForm.selectedUsers.length > 0" style="margin-top: 10px;">
            <el-tag
              v-for="(user, index) in sysConfigInfoForm.selectedUsers"
              :key="user.userId"
              closable
              @close="removeUser(index)"
              style="margin-right: 8px; margin-bottom: 8px;">
              {{ user.userName }}
            </el-tag>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 系统选择器 -->
    <TestSystemSingleSelector
      v-model="systemSelectorVisible"
      :selectedSystemId="sysConfigInfoForm.systemId"
      @confirm="handleSystemConfirm">
    </TestSystemSingleSelector>

    <!-- 用户选择器 -->
    <UserMultipleSelector
      v-model="userSelectorVisible"
      @confirm="handleUserConfirm">
    </UserMultipleSelector>
  </div>
</template>

<style>
  .app-main{
    /* 边距 */
    padding: 10px;
  }

  #search .el-input{
    width: 200px;
    margin-right: 10px;
  }

  .el-card{
    /* 底部边距 */
    margin-bottom: 10px ;
  }

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
import sysConfigInfoApi from '@/api/configuration/sysConfigInfo/sysConfigInfo'
import TestSystemSingleSelector from '@/views/sys/common/TestSystemSingleSelector'
import UserMultipleSelector from '@/views/sys/common/UserMultipleSelector'

export default {
  components: {
    TestSystemSingleSelector,
    UserMultipleSelector
  },
  data(){
    return{
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 10,
        systemName: '',
        configurationPeopleNames: ''
      },
      sysConfigInfoList: [],
      dialogVisible: false,
      isEdit: false,
      selectedRow: null,
      systemSelectorVisible: false,
      userSelectorVisible: false,
      sysConfigInfoForm: {
        configurationId: '',
        systemId: '',
        systemName: '',
        sysAbbreviation: '',
        privateToken: '',
        configurationPeopleIds: '',
        configurationPeopleNames: '',
        selectedUsers: []
      },
      rules: {
        systemId: [
          { required: true, message: '请选择系统', trigger: 'change' }
        ],
        sysAbbreviation: [
          { required: true, message: '请输入系统简称', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9]+$/, message: '系统简称只能为字母和数字', trigger: 'blur' }
        ],
        privateToken: [
          { required: true, message: '请输入访问令牌', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑系统配置信息' : '新增系统配置信息';
    }
  },

  created(){
    this.getSysConfigInfoList();
  },

  methods:{
    handleSizeChange(pageSize){
      this.searchModel.pageSize = pageSize;
      this.getSysConfigInfoList();
    },
    handleCurrentChange(pageNo){
      this.searchModel.pageNo = pageNo;
      this.getSysConfigInfoList();
    },
    getSysConfigInfoList(){
      // 构建查询参数，排除 configurationPeopleIds 和 systemId
      const queryParams = {
        pageNo: this.searchModel.pageNo,
        pageSize: this.searchModel.pageSize,
        systemName: this.searchModel.systemName,
        configurationPeopleNames: this.searchModel.configurationPeopleNames
      };
      sysConfigInfoApi.getSysConfigInfoList(queryParams).then(response => {
        // request拦截器已经返回了response.data，所以response就是后端返回的数据
        // 检查API响应结构，支持多种格式
        let responseData = null
        if (response.code === 20000 && response.data) {
          // 格式：{code: 20000, data: {rows: [], total: 0}}
          responseData = response.data
        } else if (response.rows || response.total !== undefined) {
          // 直接格式：{rows: [], total: 0} 或 {code: 20000, rows: [], total: 0}
          responseData = response
        } else if (response.data && (response.data.rows || response.data.total !== undefined)) {
          // 嵌套格式：{data: {rows: [], total: 0}}
          responseData = response.data
        }

        if (responseData) {
          const rows = responseData.rows || [];
          // 直接赋值，保持原始数据结构
          this.sysConfigInfoList = rows;
          this.total = responseData.total || 0;
        } else {
          this.$message.error('获取系统配置信息列表失败：响应数据格式不正确');
        }
      }).catch(error => {
        this.$message.error('获取系统配置信息列表失败');
      });
    },
    resetSearch(){
      this.searchModel.systemName = '';
      this.searchModel.configurationPeopleNames = '';
      this.searchModel.pageNo = 1;
      this.getSysConfigInfoList();
    },
    handleAdd(){
      this.isEdit = false;
      this.selectedRow = null;
      this.dialogVisible = true;
      this.resetForm();
    },
    handleEdit(row){
      if (row && row.configurationId) {
        // 双击行编辑
        this.selectedRow = row;
      } else if (!this.selectedRow) {
        this.$message.warning('请先选择要编辑的系统配置信息');
        return;
      }
      this.isEdit = true;
      this.dialogVisible = true;
      this.loadSysConfigInfoData();
    },
    handleDelete(){
      if (!this.selectedRow) {
        this.$message.warning('请先选择要删除的系统配置信息');
        return;
      }
      this.$confirm('确定要删除该系统配置信息吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        sysConfigInfoApi.deleteSysConfigInfo(this.selectedRow.configurationId).then(() => {
          this.$message.success('删除成功');
          this.selectedRow = null;
          this.getSysConfigInfoList();
        }).catch(() => {
          this.$message.error('删除失败');
        });
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    handleRowChange(currentRow){
      this.selectedRow = currentRow;
    },
    loadSysConfigInfoData(){
      if (this.selectedRow) {
        // 如果列表数据中已有完整信息，直接使用
        if (this.selectedRow.systemName && this.selectedRow.privateToken) {
          this.sysConfigInfoForm = {
            configurationId: this.selectedRow.configurationId,
            systemId: this.selectedRow.systemId,
            systemName: this.selectedRow.systemName || '',
            sysAbbreviation: this.selectedRow.sysAbbreviation || '',
            privateToken: this.selectedRow.privateToken || '',
            configurationPeopleIds: this.selectedRow.configurationPeopleIds || '',
            configurationPeopleNames: this.selectedRow.configurationPeopleNames || '',
            selectedUsers: this.selectedRow.selectedUsers || []
          };
          // 如果有配置人员IDs但没有selectedUsers，需要解析
          if (this.sysConfigInfoForm.configurationPeopleIds && !this.sysConfigInfoForm.selectedUsers.length) {
            // 这里假设后端会返回用户信息，如果没有则需要通过API获取
            // 暂时保持为空数组，用户可以在编辑时重新选择
            this.sysConfigInfoForm.selectedUsers = [];
          }
        } else {
          // 加载详情数据
          sysConfigInfoApi.getSysConfigInfoDetail(this.selectedRow.configurationId).then(response => {
            if (response.code === 20000) {
              const data = response.data;
              this.sysConfigInfoForm = {
                configurationId: data.configurationId,
                systemId: data.systemId,
                systemName: data.systemName || '',
                sysAbbreviation: data.sysAbbreviation || '',
                privateToken: data.privateToken || '',
                configurationPeopleIds: data.configurationPeopleIds || '',
                userName: data.userName || '',
                selectedUsers: data.selectedUsers || []
              };
              // 如果有配置人员IDs但没有selectedUsers，需要解析
              if (this.sysConfigInfoForm.configurationPeopleIds && !this.sysConfigInfoForm.selectedUsers.length) {
                this.sysConfigInfoForm.selectedUsers = [];
              }
            } else {
              this.$message.error(response.message || '获取系统配置信息详情失败');
            }
          }).catch(() => {
            this.$message.error('获取系统配置信息详情失败');
          });
        }
      }
    },
    resetForm(){
      if (this.$refs.sysConfigInfoFormRef) {
        this.$refs.sysConfigInfoFormRef.resetFields();
      }
      this.sysConfigInfoForm = {
        configurationId: '',
        systemId: '',
        systemName: '',
        sysAbbreviation: '',
        privateToken: '',
        configurationPeopleIds: '',
        userName: '',
        selectedUsers: []
      };
    },
    submitForm(){
      this.$refs.sysConfigInfoFormRef.validate(valid => {
        if (!valid) return;

        // 处理配置人员IDs
        let configurationPeopleIds = '';
        if (this.sysConfigInfoForm.selectedUsers && this.sysConfigInfoForm.selectedUsers.length > 0) {
          configurationPeopleIds = this.sysConfigInfoForm.selectedUsers.map(user => user.userId).join(',');
        }

        const payload = {
          systemId: this.sysConfigInfoForm.systemId,
          sysAbbreviation: this.sysConfigInfoForm.sysAbbreviation,
          privateToken: this.sysConfigInfoForm.privateToken,
          configurationPeopleIds: configurationPeopleIds
        };

        if (this.isEdit) {
          // 编辑系统配置信息
          payload.configurationId = this.sysConfigInfoForm.configurationId;
          sysConfigInfoApi.updateSysConfigInfo(payload).then(() => {
            this.$message.success('编辑成功');
            this.dialogVisible = false;
            this.getSysConfigInfoList();
          }).catch(() => {
            this.$message.error('编辑失败');
          });
        } else {
          // 新增系统配置信息
          sysConfigInfoApi.createSysConfigInfo(payload).then(() => {
            this.$message.success('新增成功');
            this.dialogVisible = false;
            this.getSysConfigInfoList();
          }).catch(() => {
            this.$message.error('新增失败');
          });
        }
      });
    },
    // 系统简称输入限制（只允许字母和数字）
    handleSysAbbreviationInput(value) {
      // 只保留字母和数字
      this.sysConfigInfoForm.sysAbbreviation = value.replace(/[^a-zA-Z0-9]/g, '');
    },
    // 选择系统
    handleSelectSystem(){
      this.systemSelectorVisible = true;
    },
    // 系统选择确认
    handleSystemConfirm(systemId, systemName, system){
      if (system) {
        this.sysConfigInfoForm.systemId = system.systemId;
        this.sysConfigInfoForm.systemName = system.systemName;
      } else if (systemId && systemName) {
        this.sysConfigInfoForm.systemId = systemId;
        this.sysConfigInfoForm.systemName = systemName;
      }
    },
    // 选择用户
    handleSelectUsers(){
      this.userSelectorVisible = true;
    },
    // 用户选择确认
    handleUserConfirm(users){
      if (users && users.length > 0) {
        this.sysConfigInfoForm.selectedUsers = users;
        // 更新显示的用户名称（用英文逗号分隔）
        this.sysConfigInfoForm.userName = users.map(user => user.userName).join(',');
      }
    },
    // 移除用户
    removeUser(index){
      this.sysConfigInfoForm.selectedUsers.splice(index, 1);
      // 更新显示的用户名称
      if (this.sysConfigInfoForm.selectedUsers.length > 0) {
        this.sysConfigInfoForm.userName = this.sysConfigInfoForm.selectedUsers.map(user => user.userName).join(',');
      } else {
        this.sysConfigInfoForm.userName = '';
      }
    }
  }
};
</script>
