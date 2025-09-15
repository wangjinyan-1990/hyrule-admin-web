<template>
  <div>
    <!-- 搜索栏 -->
    <el-card id="search">
      <el-row>
        <el-col :span="20">
          <el-input v-model="searchModel.userName" placeholder="用户名" style="width: 200px; margin-right: 10px;"></el-input>
          <el-input v-model="searchModel.loginName" placeholder="登录名" style="width: 200px; margin-right: 10px;"></el-input>
          <el-input v-model="searchModel.phone" placeholder="电话" style="width: 200px; margin-right: 10px;"></el-input>
          <el-button @click="getTesterList" type="primary" round icon="el-icon-search">查询</el-button>
          <el-button @click="resetSearch" type="info" round icon="el-icon-refresh">重置</el-button>
        </el-col>
        <el-col :span="4" align="right">
          <el-button @click="handleEdit" type="warning" icon="el-icon-edit" circle :disabled="!selectedRow">编辑</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 结果栏 -->
    <el-card>
      <el-table 
        :data="testerList" 
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
        <el-table-column prop="systemNames" label="所属系统" width="200" show-overflow-tooltip></el-table-column>
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

    <!-- 编辑测试人员对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" @close="resetForm">
      <el-form ref="testerFormRef" :model="testerForm" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="testerForm.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="登录名" prop="loginName">
          <el-input v-model="testerForm.loginName" placeholder="请输入登录名"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="testerForm.phone" placeholder="请输入电话"></el-input>
        </el-form-item>
        <el-form-item label="所属机构" prop="orgName">
          <el-input v-model="testerForm.orgName" placeholder="请输入所属机构"></el-input>
        </el-form-item>
        <el-form-item label="所属系统" prop="systemNames">
          <el-input v-model="testerForm.systemNames" placeholder="请输入所属系统"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TesterTab',
  data() {
    return {
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 10,
        userName: '',
        loginName: '',
        phone: ''
      },
      testerList: [],
      dialogVisible: false,
      selectedRow: null,
      testerForm: {
        userId: '',
        userName: '',
        loginName: '',
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
      return '编辑测试人员';
    }
  },
  created() {
    this.getTesterList();
  },
  methods: {
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize;
      this.getTesterList();
    },
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo;
      this.getTesterList();
    },
    getTesterList() {
      // 模拟数据，实际应该调用API
      const mockData = [
        {
          userId: 'test001',
          userName: '王五',
          loginName: 'wangwu',
          phone: '13800138003',
          orgName: '汉东农信-技术部',
          systemIds: 'sys001,sys003',
          systemNames: '核心业务系统,风控管理系统'
        },
        {
          userId: 'test002',
          userName: '赵六',
          loginName: 'zhaoliu',
          phone: '13800138004',
          orgName: '汉东农信-技术部',
          systemIds: 'sys002',
          systemNames: '客户管理系统'
        }
      ];
      
      this.testerList = mockData;
      this.total = mockData.length;
    },
    resetSearch() {
      this.searchModel.userName = '';
      this.searchModel.loginName = '';
      this.searchModel.phone = '';
      this.searchModel.pageNo = 1;
      this.getTesterList();
    },
    handleEdit(row) {
      if (row && row.userId) {
        this.selectedRow = row;
      } else if (!this.selectedRow) {
        this.$message.warning('请先选择要编辑的测试人员');
        return;
      }
      this.dialogVisible = true;
      this.loadTesterData();
    },
    handleRowChange(currentRow) {
      this.selectedRow = currentRow;
    },
    loadTesterData() {
      if (this.selectedRow) {
        this.testerForm = {
          userId: this.selectedRow.userId,
          userName: this.selectedRow.userName,
          loginName: this.selectedRow.loginName,
          phone: this.selectedRow.phone || '',
          orgName: this.selectedRow.orgName || '',
          systemIds: this.selectedRow.systemIds || '',
          systemNames: this.selectedRow.systemNames || ''
        };
      }
    },
    resetForm() {
      if (this.$refs.testerFormRef) {
        this.$refs.testerFormRef.resetFields();
      }
      this.testerForm = {
        userId: '',
        userName: '',
        loginName: '',
        phone: '',
        orgName: '',
        systemIds: '',
        systemNames: ''
      };
    },
    submitForm() {
      this.$refs.testerFormRef.validate(valid => {
        if (!valid) return;
        
        // 实际应该调用API保存数据
        this.$message.success('编辑成功');
        this.dialogVisible = false;
        this.getTesterList();
      });
    },
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
</style>
