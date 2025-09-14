<template>
  <div>
    <!-- 搜索栏 -->
    <el-card id="search">
      <el-row>
        <el-col :span="20">
          <el-input v-model="searchModel.userName" placeholder="用户名"></el-input>
          <el-input v-model="searchModel.loginName" placeholder="登录名"></el-input>
          <el-input v-model="searchModel.phone" placeholder="电话"></el-input>
          <!-- icon是图标，可以修改为自己的 -->
          <el-button @click="getUserList" type="primary" round icon="el-icon-search">查询</el-button>
          <el-button @click="resetSearch" type="info" round icon="el-icon-refresh">重置</el-button>
        </el-col>
        <!-- align是对齐，right就是右对齐 -->
        <el-col :span="4" align="right">
          <el-button @click="handleAdd" type="primary" icon="el-icon-plus" circle>新增</el-button>
          <el-button @click="handleEdit" type="warning" icon="el-icon-edit" circle :disabled="!selectedRow">编辑</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 结果栏 -->
    <el-card>
      <el-table 
        :data="userList" 
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
        <el-table-column prop="email" label="邮箱" width="200"></el-table-column>
        <el-table-column prop="orgName" label="所属机构" width="150">
          <template slot-scope="scope">
            <span v-if="scope.row.orgName">{{ scope.row.orgName }}</span>
            <span v-else style="color: #999;">未分配</span>
          </template>
        </el-table-column>
        <el-table-column prop="roleNames" label="角色" width="150">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.roleNames" type="info" size="small">
              {{ scope.row.roleNames }}
            </el-tag>
            <span v-else style="color: #999;">无角色</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roleIds" label="角色ID" width="80" v-if="false"></el-table-column>
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
    <!-- 新增/编辑用户对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" @close="resetForm">
      <el-form ref="userFormRef" :model="userForm" :rules="rules" label-width="90px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="userForm.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="登录名" prop="loginName">
          <el-input v-model="userForm.loginName" placeholder="请输入登录名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入电话"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">在职</el-radio>
            <el-radio :label="0">离职</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="所属机构" prop="orgId">
          <el-input 
            v-model="userForm.orgName" 
            placeholder="请选择所属机构" 
            readonly 
            @click="handleOrgSelect">
            <el-button slot="append" icon="el-icon-search" @click="handleOrgSelect"></el-button>
          </el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="userForm.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roleList"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
    
    <!-- 机构选择器 -->
    <OrgSelector 
      v-model="orgSelectorVisible" 
      @confirm="handleOrgConfirm" 
      @close="resetOrgSelector">
    </OrgSelector>
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

  /* 固定表头样式优化 */
  .el-table .el-table__header-wrapper {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  /* 表格容器样式 */
  .el-table {
    border: 1px solid #ebeef5;
    border-radius: 4px;
  }

  /* 表头样式 */
  .el-table th {
    background-color: #fafafa;
    font-weight: 600;
  }
</style>

<script>
import userApi from '@/api/sys/user'
import orgApi from '@/api/sys/org'
import OrgSelector from '@/views/sys/common/OrgSelector'

export default {
  components: {
    OrgSelector
  },
  data(){
    return{
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 100,
        userName: '',
        loginName: '',
        phone: ''
      },
      userList: [],
      roleList: [],
      dialogVisible: false,
      isEdit: false,
      selectedRow: null,
      userForm: {
        userId: '',
        userName: '',
        loginName: '',
        email: '',
        phone: '',
        status: 1,
        orgId: '',
        orgName: '',
        roleIds: []
      },
      orgSelectorVisible: false,
      rules: {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
        ],
        loginName: [
          { required: true, message: '请输入登录名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在2到20个字符', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        orgId: [
          { required: true, message: '请选择所属机构', trigger: 'change' }
        ],
        roleIds: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },

  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑用户' : '新增用户';
    }
  },

  created(){
    this.getUserList();
    this.getRoleList();
  },

  methods:{
    handleSizeChange(pageSize){
      this.searchModel.pageSize = pageSize;
      this.getUserList();
    },
    handleCurrentChange(pageNo){
      this.searchModel.pageNo = pageNo;
      this.getUserList();
    },
    getUserList(){
      userApi.getUserList(this.searchModel).then(response =>{
        this.userList = response.data.rows;
        this.total = response.data.total;
      });
    },
    getRoleList(){
      // 这里需要调用角色API获取角色列表
      // 暂时使用模拟数据
      this.roleList = [
        { roleId: '0001', roleName: '开发人员' },
        { roleId: '0002', roleName: '测试人员' },
        { roleId: '0003', roleName: '管理员' }
      ];
    },
    resetSearch(){
      this.searchModel.userName = '';
      this.searchModel.loginName = '';
      this.searchModel.phone = '';
      this.searchModel.pageNo = 1;
      this.getUserList();
    },
    handleAdd(){
      this.isEdit = false;
      this.selectedRow = null;
      this.dialogVisible = true;
      this.resetForm();
    },
    handleEdit(row){
      if (row && row.userId) {
        // 双击行编辑
        this.selectedRow = row;
      } else if (!this.selectedRow) {
        this.$message.warning('请先选择要编辑的用户');
        return;
      }
      this.isEdit = true;
      this.dialogVisible = true;
      this.loadUserData();
    },
    handleRowChange(currentRow){
      this.selectedRow = currentRow;
    },
    loadUserData(){
      if (this.selectedRow) {
        this.userForm = {
          userId: this.selectedRow.userId,
          userName: this.selectedRow.userName,
          loginName: this.selectedRow.loginName,
          email: this.selectedRow.email || '',
          phone: this.selectedRow.phone || '',
          status: this.selectedRow.status,
          orgId: this.selectedRow.orgId || '',
          orgName: this.selectedRow.orgName || '',
          roleIds: this.selectedRow.roleIds ? this.selectedRow.roleIds.split(',') : []
        };
      }
    },
    resetForm(){
      if (this.$refs.userFormRef) {
        this.$refs.userFormRef.resetFields();
      }
      this.userForm = { userId: '', userName: '', loginName: '', email: '', phone: '', status: 1, orgId: '', orgName: '', roleIds: [] };
    },
    submitForm(){
      this.$refs.userFormRef.validate(valid => {
        if (!valid) return;
        const payload = {
          userName: this.userForm.userName,
          loginName: this.userForm.loginName,
          email: this.userForm.email,
          phone: this.userForm.phone,
          status: this.userForm.status,
          orgId: this.userForm.orgId,
          roleIds: this.userForm.roleIds.join(',')
        };

        if (this.isEdit) {
          // 编辑用户
          payload.userId = this.userForm.userId;
          userApi.updateUser(payload).then(() => {
            this.$message.success('编辑成功');
            this.dialogVisible = false;
            this.getUserList();
          }).catch(() => {
            this.$message.error('编辑失败');
          });
        } else {
          // 新增用户
          userApi.createUser(payload).then(() => {
            this.$message.success('新增成功');
            this.dialogVisible = false;
            this.getUserList();
          }).catch(() => {
            this.$message.error('新增失败');
          });
        }
      });
    },
    handleOrgSelect() {
      this.orgSelectorVisible = true;
    },
    handleOrgConfirm(orgId) {
      // 根据orgId找到机构名称
      this.findOrgNameById(orgId).then(orgName => {
        this.userForm.orgId = orgId;
        this.userForm.orgName = orgName;
      });
    },
    resetOrgSelector() {
      this.orgSelectorVisible = false;
    },
    async findOrgNameById(orgId) {
      try {
        // 调用机构API获取机构树，然后根据orgId查找机构名称
        const response = await orgApi.getOrgTree();
        const orgTree = response.data || [];
        return this.findOrgNameInTree(orgTree, orgId);
      } catch (error) {
        console.error('获取机构名称失败:', error);
        // 如果API调用失败，使用模拟数据作为备选
        const orgMap = {
          '1000': '汉东农信',
          '1001': '汉东农信-技术部',
          '1002': '汉东农信-业务部'
        };
        return orgMap[orgId] || '未知机构';
      }
    },
    findOrgNameInTree(orgTree, targetOrgId) {
      for (const org of orgTree) {
        if (org.orgId === targetOrgId) {
          return org.orgName;
        }
        if (org.children && org.children.length > 0) {
          const result = this.findOrgNameInTree(org.children, targetOrgId);
          if (result) {
            return result;
          }
        }
      }
      return null;
    }
  }
};
</script>
