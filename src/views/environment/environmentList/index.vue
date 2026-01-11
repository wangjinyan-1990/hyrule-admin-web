<template>
  <div>
    <!-- 搜索栏 -->
    <el-card id="search">
      <el-row>
        <el-col :span="18">
          <el-input v-model="searchModel.systemName" placeholder="系统名称" style="width: 150px; margin-right: 10px;"></el-input>
          <el-input v-model="searchModel.envName" placeholder="环境名称" style="width: 150px; margin-right: 10px;"></el-input>
          <el-input v-model="searchModel.serverName" placeholder="服务名称" style="width: 150px; margin-right: 10px;"></el-input>
          <el-input v-model="searchModel.ipAddress" placeholder="主机地址" style="width: 150px; margin-right: 10px;"></el-input>
          <el-button @click="getEnvironmentList" type="primary" round icon="el-icon-search">查询</el-button>
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
        :data="environmentList"
        stripe
        style="width: 100%"
        @row-dblclick="handleEdit"
        @current-change="handleRowChange"
        highlight-current-row>
        <el-table-column type="index" width="55" label="序号"></el-table-column>
        <el-table-column prop="envListId" label="环境清单Id" width="100" v-if="false"></el-table-column>
        <el-table-column prop="envId" label="环境Id" width="80" v-if="false"></el-table-column>
        <el-table-column prop="envName" label="环境名称" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="systemId" label="系统ID" width="100" v-if="false"></el-table-column>
        <el-table-column prop="systemName" label="系统名称" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="serverName" label="服务名称" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="ipAddress" label="主机地址" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="portInfo" label="端口信息" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="linkAddress" label="链接地址" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="configurationPeopleNames" label="配置人员" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.configurationPeopleNames">{{ scope.row.configurationPeopleNames }}</span>
            <span v-else style="color: #999;">未配置</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip>
          <template slot-scope="scope">
            <span v-if="scope.row.remark">{{ scope.row.remark }}</span>
            <span v-else style="color: #999;">-</span>
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

    <!-- 新增/编辑环境清单对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="700px" @close="resetForm">
      <el-form ref="environmentListFormRef" :model="environmentListForm" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="环境" prop="envId">
              <el-select v-model="environmentListForm.envId" placeholder="请选择环境" style="width: 100%;" @change="handleEnvChange">
                <el-option
                  v-for="env in envOptions"
                  :key="env.envId"
                  :label="env.envName"
                  :value="env.envId">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系统" prop="systemId">
              <el-input
                v-model="environmentListForm.systemName"
                placeholder="请选择系统"
                readonly
                @click.native="handleSelectSystem">
                <el-button slot="append" icon="el-icon-search" @click="handleSelectSystem"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="服务名称" prop="serverName">
              <el-input v-model="environmentListForm.serverName" placeholder="请输入服务名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主机地址" prop="ipAddress">
              <el-input v-model="environmentListForm.ipAddress" placeholder="请输入主机地址"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="端口信息" prop="portInfo">
              <el-input v-model="environmentListForm.portInfo" placeholder="请输入端口信息"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="链接地址" prop="linkAddress">
              <el-input v-model="environmentListForm.linkAddress" placeholder="请输入链接地址"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="配置人员" prop="configurationPeopleIds">
          <el-input
            v-model="environmentListForm.configurationPeopleNames"
            placeholder="请选择配置人员"
            readonly
            @click.native="handleSelectUsers">
            <el-button slot="append" icon="el-icon-search" @click="handleSelectUsers"></el-button>
          </el-input>
          <div v-if="environmentListForm.selectedUsers && environmentListForm.selectedUsers.length > 0" style="margin-top: 10px;">
            <el-tag
              v-for="(user, index) in environmentListForm.selectedUsers"
              :key="user.userId"
              closable
              @close="removeUser(index)"
              style="margin-right: 8px; margin-bottom: 8px;">
              {{ user.userName }}
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="environmentListForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注">
          </el-input>
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
      :selectedSystemId="environmentListForm.systemId"
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
import environmentListApi from '@/api/environment/environmentList'
import environmentApi from '@/api/environment/environment'
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
        envName: '',
        serverName: '',
        ipAddress: ''
      },
      environmentList: [],
      dialogVisible: false,
      isEdit: false,
      selectedRow: null,
      systemSelectorVisible: false,
      userSelectorVisible: false,
      envOptions: [],
      environmentListForm: {
        envListId: '',
        envId: '',
        envName: '',
        systemId: '',
        systemName: '',
        serverName: '',
        ipAddress: '',
        portInfo: '',
        linkAddress: '',
        configurationPeopleIds: '',
        configurationPeopleNames: '',
        selectedUsers: [],
        remark: ''
      },
      rules: {
        envId: [
          { required: true, message: '请选择环境', trigger: 'change' }
        ],
        systemId: [
          { required: true, message: '请选择系统', trigger: 'change' }
        ],
        serverName: [
          { required: true, message: '请输入服务名称', trigger: 'blur' }
        ],
        ipAddress: [
          { required: true, message: '请输入主机地址', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑环境清单' : '新增环境清单';
    }
  },

  created(){
    this.getEnvironmentList();
    this.loadEnvOptions();
  },

  methods:{
    handleSizeChange(pageSize){
      this.searchModel.pageSize = pageSize;
      this.getEnvironmentList();
    },
    handleCurrentChange(pageNo){
      this.searchModel.pageNo = pageNo;
      this.getEnvironmentList();
    },
    getEnvironmentList(){
      const queryParams = {
        pageNo: this.searchModel.pageNo,
        pageSize: this.searchModel.pageSize,
        systemName: this.searchModel.systemName,
        envName: this.searchModel.envName,
        serverName: this.searchModel.serverName,
        ipAddress: this.searchModel.ipAddress
      };
      environmentListApi.getEnvironmentList(queryParams).then(response => {
        let responseData = null
        if (response.code === 20000 && response.data) {
          responseData = response.data
        } else if (response.rows || response.total !== undefined) {
          responseData = response
        } else if (response.data && (response.data.rows || response.data.total !== undefined)) {
          responseData = response.data
        }

        if (responseData) {
          const rows = responseData.rows || [];
          this.environmentList = rows;
          this.total = responseData.total || 0;
        } else {
          this.$message.error('获取环境清单列表失败：响应数据格式不正确');
        }
      }).catch(error => {
        this.$message.error('获取环境清单列表失败');
      });
    },
    resetSearch(){
      this.searchModel.systemName = '';
      this.searchModel.envName = '';
      this.searchModel.serverName = '';
      this.searchModel.ipAddress = '';
      this.searchModel.pageNo = 1;
      this.getEnvironmentList();
    },
    handleAdd(){
      this.isEdit = false;
      this.selectedRow = null;
      this.dialogVisible = true;
      this.resetForm();
    },
    handleEdit(row){
      if (row && row.envListId) {
        this.selectedRow = row;
      } else if (!this.selectedRow) {
        this.$message.warning('请先选择要编辑的环境清单');
        return;
      }
      this.isEdit = true;
      this.dialogVisible = true;
      this.loadEnvironmentListData();
    },
    handleDelete(){
      if (!this.selectedRow) {
        this.$message.warning('请先选择要删除的环境清单');
        return;
      }
      this.$confirm('确定要删除该环境清单吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        environmentListApi.deleteEnvironmentList(this.selectedRow.envListId).then(() => {
          this.$message.success('删除成功');
          this.selectedRow = null;
          this.getEnvironmentList();
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
    loadEnvironmentListData(){
      if (this.selectedRow) {
        if (this.selectedRow.systemName && this.selectedRow.serverName) {
          this.environmentListForm = {
            envListId: this.selectedRow.envListId,
            envId: this.selectedRow.envId,
            envName: this.selectedRow.envName || '',
            systemId: this.selectedRow.systemId || '',
            systemName: this.selectedRow.systemName || '',
            serverName: this.selectedRow.serverName || '',
            ipAddress: this.selectedRow.ipAddress || '',
            portInfo: this.selectedRow.portInfo || '',
            linkAddress: this.selectedRow.linkAddress || '',
            configurationPeopleIds: this.selectedRow.configurationPeopleIds || '',
            configurationPeopleNames: this.selectedRow.configurationPeopleNames || '',
            selectedUsers: this.selectedRow.selectedUsers || [],
            remark: this.selectedRow.remark || ''
          };
          if (this.environmentListForm.configurationPeopleIds && !this.environmentListForm.selectedUsers.length) {
            this.environmentListForm.selectedUsers = [];
          }
        } else {
          environmentListApi.getEnvironmentListDetail(this.selectedRow.envListId).then(response => {
            if (response.code === 20000) {
              const data = response.data;
              this.environmentListForm = {
                envListId: data.envListId,
                envId: data.envId,
                envName: data.envName || '',
                systemId: data.systemId || '',
                systemName: data.systemName || '',
                serverName: data.serverName || '',
                ipAddress: data.ipAddress || '',
                portInfo: data.portInfo || '',
                linkAddress: data.linkAddress || '',
                configurationPeopleIds: data.configurationPeopleIds || '',
                configurationPeopleNames: data.configurationPeopleNames || '',
                selectedUsers: data.selectedUsers || [],
                remark: data.remark || ''
              };
              if (this.environmentListForm.configurationPeopleIds && !this.environmentListForm.selectedUsers.length) {
                this.environmentListForm.selectedUsers = [];
              }
            } else {
              this.$message.error(response.message || '获取环境清单详情失败');
            }
          }).catch(() => {
            this.$message.error('获取环境清单详情失败');
          });
        }
      }
    },
    resetForm(){
      if (this.$refs.environmentListFormRef) {
        this.$refs.environmentListFormRef.resetFields();
      }
      this.environmentListForm = {
        envListId: '',
        envId: '',
        envName: '',
        systemId: '',
        systemName: '',
        serverName: '',
        ipAddress: '',
        portInfo: '',
        linkAddress: '',
        configurationPeopleIds: '',
        configurationPeopleNames: '',
        selectedUsers: [],
        remark: ''
      };
    },
    submitForm(){
      this.$refs.environmentListFormRef.validate(valid => {
        if (!valid) return;

        let configurationPeopleIds = '';
        if (this.environmentListForm.selectedUsers && this.environmentListForm.selectedUsers.length > 0) {
          configurationPeopleIds = this.environmentListForm.selectedUsers.map(user => user.userId).join(',');
        }

        const payload = {
          envId: this.environmentListForm.envId,
          systemId: this.environmentListForm.systemId,
          serverName: this.environmentListForm.serverName,
          ipAddress: this.environmentListForm.ipAddress,
          portInfo: this.environmentListForm.portInfo || '',
          linkAddress: this.environmentListForm.linkAddress || '',
          configurationPeopleIds: configurationPeopleIds,
          remark: this.environmentListForm.remark || ''
        };

        if (this.isEdit) {
          payload.envListId = this.environmentListForm.envListId;
          environmentListApi.updateEnvironmentList(payload).then(() => {
            this.$message.success('编辑成功');
            this.dialogVisible = false;
            this.getEnvironmentList();
          }).catch(() => {
            this.$message.error('编辑失败');
          });
        } else {
          environmentListApi.createEnvironmentList(payload).then(() => {
            this.$message.success('新增成功');
            this.dialogVisible = false;
            this.getEnvironmentList();
          }).catch(() => {
            this.$message.error('新增失败');
          });
        }
      });
    },
    // 加载环境选项
    loadEnvOptions(){
      environmentApi.getEnvironmentList({ pageNo: 1, pageSize: 1000 }).then(response => {
        if (response.code === 20000 && response.data) {
          this.envOptions = response.data.rows || [];
        } else if (response.rows) {
          this.envOptions = response.rows || [];
        }
      }).catch(() => {
        // 如果加载失败，使用空数组
        this.envOptions = [];
      });
    },
    // 环境选择变化
    handleEnvChange(envId){
      const selectedEnv = this.envOptions.find(env => env.envId === envId);
      if (selectedEnv) {
        this.environmentListForm.envName = selectedEnv.envName || '';
      }
    },
    // 选择系统
    handleSelectSystem(){
      this.systemSelectorVisible = true;
    },
    // 系统选择确认
    handleSystemConfirm(systemId, systemName, system){
      if (system) {
        this.environmentListForm.systemId = system.systemId;
        this.environmentListForm.systemName = system.systemName;
      } else if (systemId && systemName) {
        this.environmentListForm.systemId = systemId;
        this.environmentListForm.systemName = systemName;
      }
    },
    // 选择用户
    handleSelectUsers(){
      this.userSelectorVisible = true;
    },
    // 用户选择确认
    handleUserConfirm(users){
      if (users && users.length > 0) {
        this.environmentListForm.selectedUsers = users;
        this.environmentListForm.configurationPeopleNames = users.map(user => user.userName).join('、');
      }
    },
    // 移除用户
    removeUser(index){
      this.environmentListForm.selectedUsers.splice(index, 1);
      if (this.environmentListForm.selectedUsers.length > 0) {
        this.environmentListForm.configurationPeopleNames = this.environmentListForm.selectedUsers.map(user => user.userName).join('、');
      } else {
        this.environmentListForm.configurationPeopleNames = '';
      }
    }
  }
};
</script>
