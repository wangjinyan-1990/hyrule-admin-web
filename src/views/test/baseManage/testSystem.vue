<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card id="search">
      <el-row>
        <el-col :span="24">
          <!-- 第一排查询条件 -->
          <el-row style="margin-bottom: 10px;">
            <el-col :span="6">
              <el-input v-model="searchModel.systemName" placeholder="系统名称"></el-input>
            </el-col>
            <el-col :span="6">
              <el-select v-model="searchModel.systemType" placeholder="系统类型" clearable>
                <el-option
                  v-for="item in systemTypeOptions"
                  :key="item.dataValue"
                  :label="item.dataName"
                  :value="item.dataValue">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="searchModel.systemStage" placeholder="系统阶段" clearable>
                <el-option
                  v-for="item in systemStageOptions"
                  :key="item.dataValue"
                  :label="item.dataName"
                  :value="item.dataValue">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="6">
              <!-- 展开/收起按钮 -->
              <el-button
                @click="toggleMoreSearch"
                type="text"
                :icon="showMoreSearch ? 'el-icon-arrow-up' : 'el-icon-arrow-down'">
                {{ showMoreSearch ? '收起' : '展开' }}
              </el-button>
              <!-- 查询和重置按钮 -->
              <el-button @click="getTestSystemList" type="primary" round icon="el-icon-search">查询</el-button>
              <el-button @click="resetSearch" type="info" round icon="el-icon-refresh">重置</el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      
      <!-- 展开的搜索条件 -->
      <el-row v-show="showMoreSearch" style="margin-top: -10px;">
        <el-col :span="6">
          <el-input v-model="searchModel.orgName" placeholder="负责机构"></el-input>
        </el-col>
        <el-col :span="6">
          <el-input v-model="searchModel.testManagerName" placeholder="测试经理"></el-input>
        </el-col>
        <el-col :span="6">
          <el-input v-model="searchModel.devManagerName" placeholder="开发经理"></el-input>
        </el-col>
        <el-col :span="6">
          <!-- 空白占位 -->
        </el-col>
      </el-row>
    </el-card>

    <!-- 结果栏 -->
    <el-card style="padding-top: 0;">
    <!-- 操作按钮 -->
    <div style="margin: 0 0 2px 0; text-align: right;">
      <el-tooltip content="新增" placement="top">
        <el-button @click="handleAdd" type="primary" icon="el-icon-plus" circle></el-button>
      </el-tooltip>
      <el-tooltip content="编辑" placement="top">
        <el-button @click="handleEdit" type="warning" icon="el-icon-edit" circle :disabled="!selectedRow"></el-button>
      </el-tooltip>
      <el-tooltip content="删除" placement="top">
        <el-button @click="handleDelete" type="danger" icon="el-icon-delete" circle :disabled="!selectedRow"></el-button>
      </el-tooltip>
    </div>
      
      <div class="table-wrapper">
        <el-table
          :data="testSystemList"
          stripe
          style="width: 100%"
          height="500"
          @row-dblclick="handleEdit"
          @current-change="handleRowChange"
          highlight-current-row>
        <el-table-column type="index" width="55" label="序号"></el-table-column>
        <el-table-column prop="systemId" label="系统ID" width="100" v-if="false"></el-table-column>
        <el-table-column prop="systemName" label="系统名称" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="orgName" label="负责机构" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="systemType" label="系统类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.systemType === '1' ? 'primary' : 'success'" size="small">
              {{ getSystemTypeText(scope.row.systemType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="systemStage" label="系统阶段" width="120">
          <template slot-scope="scope">
            <el-tag :type="getStageTagType(scope.row.systemStage)" size="small">
              {{ getStageText(scope.row.systemStage) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="testManagerName" label="测试经理" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="devManagerName" label="开发经理" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="planStartTime" label="计划开始" width="120">
          <template slot-scope="scope">
            {{ formatDate(scope.row.planStartTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="planEndTime" label="计划结束" width="120">
          <template slot-scope="scope">
            {{ formatDate(scope.row.planEndTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        </el-table>
      </div>
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

    <!-- 新增/编辑测试系统对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px" @close="resetForm">
      <el-form ref="testSystemFormRef" :model="testSystemForm" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="系统名称" prop="systemName">
              <el-input v-model="testSystemForm.systemName" placeholder="请输入系统名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责机构" prop="orgId">
              <el-input
                v-model="testSystemForm.orgName"
                placeholder="请选择负责机构"
                readonly
                @click="handleOrgSelect">
                <el-button slot="append" icon="el-icon-search" @click="handleOrgSelect"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="系统类型" prop="systemType">
              <el-select v-model="testSystemForm.systemType" placeholder="请选择系统类型" style="width: 100%">
                <el-option
                  v-for="item in systemTypeOptions"
                  :key="item.dataValue"
                  :label="item.dataName"
                  :value="item.dataValue">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="系统阶段" prop="systemStage">
              <el-select v-model="testSystemForm.systemStage" placeholder="请选择系统阶段" style="width: 100%">
                <el-option
                  v-for="item in systemStageOptions"
                  :key="item.dataValue"
                  :label="item.dataName"
                  :value="item.dataValue">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="测试经理" prop="systemTestManagerId">
              <el-input
                v-model="testSystemForm.testManagerName"
                placeholder="请选择测试经理"
                readonly
                @click="handleTestManagerSelect">
                <el-button slot="append" icon="el-icon-search" @click="handleTestManagerSelect"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开发经理" prop="systemDevManagerId">
              <el-input
                v-model="testSystemForm.devManagerName"
                placeholder="请选择开发经理"
                readonly
                @click="handleDevManagerSelect">
                <el-button slot="append" icon="el-icon-search" @click="handleDevManagerSelect"></el-button>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划开始时间" prop="planStartTime">
              <el-date-picker
                v-model="testSystemForm.planStartTime"
                type="date"
                placeholder="选择计划开始时间"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划结束时间" prop="planEndTime">
              <el-date-picker
                v-model="testSystemForm.planEndTime"
                type="date"
                placeholder="选择计划结束时间"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="实际开始时间">
              <el-date-picker
                v-model="testSystemForm.actualStartTime"
                type="date"
                placeholder="选择实际开始时间"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际结束时间">
              <el-date-picker
                v-model="testSystemForm.actualEndTime"
                type="date"
                placeholder="选择实际结束时间"
                style="width: 100%">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="系统描述" prop="systemDescription">
          <el-input
            v-model="testSystemForm.systemDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入系统描述">
          </el-input>
        </el-form-item>

        <el-form-item label="修改历史记录">
          <el-input
            v-model="testSystemForm.changeHistory"
            type="textarea"
            :rows="2"
            placeholder="请输入修改历史记录">
          </el-input>
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

    <!-- 用户选择器 -->
    <UserSingleSelector
      v-model="userSelectorVisible"
      @confirm="handleUserConfirm"
      @close="resetUserSelector">
    </UserSingleSelector>
  </div>
</template>

<script>
import testSystemApi from '@/api/test/baseManage/testSystem'
import dictionaryApi from '@/api/framework/dictionary'
import orgApi from '@/api/sys/org'
import userApi from '@/api/sys/user'
import OrgSelector from '@/views/sys/common/OrgSelector'
import UserSingleSelector from '@/views/sys/common/UserSingleSelector'

export default {
  components: {
    OrgSelector,
    UserSingleSelector
  },
  data(){
    return{
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 100,
        systemName: '',
        systemType: '',
        systemStage: '',
        orgName: '',
        testManagerName: '',
        devManagerName: ''
      },
      showMoreSearch: false,
      testSystemList: [],
      systemTypeOptions: [],
      systemStageOptions: [],
      dialogVisible: false,
      isEdit: false,
      selectedRow: null,
      testSystemForm: {
        systemId: '',
        systemName: '',
        orgId: '',
        orgName: '',
        systemType: '',
        systemStage: '',
        isUse: '1',
        systemDescription: '',
        planStartTime: '',
        planEndTime: '',
        actualStartTime: '',
        actualEndTime: '',
        systemTestManagerId: '',
        testManagerName: '',
        systemDevManagerId: '',
        devManagerName: '',
        changeHistory: ''
      },
      orgSelectorVisible: false,
      userSelectorVisible: false,
      currentUserType: '', // 'testManager' 或 'devManager'
      rules: {
        systemName: [
          { required: true, message: '请输入系统名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
        ],
        orgId: [
          { required: true, message: '请选择负责机构', trigger: 'change' }
        ],
        systemType: [
          { required: true, message: '请选择系统类型', trigger: 'change' }
        ],
        systemStage: [
          { required: true, message: '请选择系统阶段', trigger: 'change' }
        ],
        isUse: [
          { required: true, message: '请选择使用状态', trigger: 'change' }
        ]
      }
    }
  },

  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑测试系统' : '新增测试系统';
    }
  },

  created(){
    this.initializeComponent();
  },

  mounted() {
    // 强制设置表格行高
    this.$nextTick(() => {
      this.forceTableRowHeight();
    });
  },

  methods:{
    // 强制设置表格行高
    forceTableRowHeight() {
      setTimeout(() => {
        // 设置所有表格行高度
        const allRows = document.querySelectorAll('.el-table__row');
        allRows.forEach(row => {
          row.style.height = '24px';
          row.style.minHeight = '24px';
          row.style.maxHeight = '24px';
        });

        // 设置所有表格单元格高度
        const allCells = document.querySelectorAll('.el-table th, .el-table td');
        allCells.forEach(cell => {
          cell.style.height = '24px';
          cell.style.lineHeight = '24px';
          cell.style.fontSize = '12px';
          cell.style.padding = '0';
        });

        // 设置表头行高度
        const headerRows = document.querySelectorAll('.el-table__header tr');
        headerRows.forEach(row => {
          row.style.height = '24px';
          row.style.minHeight = '24px';
          row.style.maxHeight = '24px';
        });

        // 设置表体行高度
        const bodyRows = document.querySelectorAll('.el-table__body tr');
        bodyRows.forEach(row => {
          row.style.height = '24px';
          row.style.minHeight = '24px';
          row.style.maxHeight = '24px';
        });

      }, 100);
    },

    async initializeComponent() {
      try {
        // 先设置默认选项，确保组件能正常渲染
        this.setDefaultOptions();
        // 然后尝试加载数据字典
        await this.loadDictionaryOptions();
        // 最后加载数据
        this.getTestSystemList();
      } catch (error) {
        // 即使初始化失败，也要确保组件能显示
        this.setDefaultOptions();
      }
    },
    handleSizeChange(pageSize){
      this.searchModel.pageSize = pageSize;
      this.getTestSystemList();
    },
    handleCurrentChange(pageNo){
      this.searchModel.pageNo = pageNo;
      this.getTestSystemList();
    },
    getTestSystemList(){
      testSystemApi.getTestSystemList(this.searchModel)
        .then(response => {
          this.testSystemList = response.data.rows || [];
          this.total = response.data.total || 0;
          
          // 数据加载完成后强制设置表格行高
          this.$nextTick(() => {
            setTimeout(() => {
              this.forceTableRowHeight();
            }, 200);
          });
        })
        .catch(error => {
          this.$message.error('获取数据失败: ' + (error.message || '未知错误'));
          // 设置空数据，确保组件能正常显示
          this.testSystemList = [];
          this.total = 0;
        });
    },
    resetSearch(){
      this.searchModel.systemName = '';
      this.searchModel.systemType = '';
      this.searchModel.systemStage = '';
      this.searchModel.orgName = '';
      this.searchModel.testManagerName = '';
      this.searchModel.devManagerName = '';
      this.searchModel.pageNo = 1;
      this.getTestSystemList();
    },
    toggleMoreSearch(){
      this.showMoreSearch = !this.showMoreSearch;
    },
    async loadDictionaryOptions(){
      try {
        // 并行加载所有数据字典
        const [systemTypeRes, systemStageRes] = await Promise.all([
          dictionaryApi.getDictionaryList('systemType'),
          dictionaryApi.getDictionaryList('systemStage')
        ]);

        this.systemTypeOptions = systemTypeRes.data || [];
        this.systemStageOptions = systemStageRes.data || [];
      } catch (error) {
        this.$message.error('加载数据字典失败');
        // 设置默认选项作为备选
        this.setDefaultOptions();
      }
    },
    setDefaultOptions(){
      // 如果数据字典加载失败，使用默认选项
      this.systemTypeOptions = [
        { dataValue: '1', dataName: '初测' },
        { dataValue: '2', dataName: '优化' }
      ];
      this.systemStageOptions = [
        { dataValue: '1', dataName: '准备阶段' },
        { dataValue: '2', dataName: '实施阶段' },
        { dataValue: '3', dataName: '收尾阶段' }
      ];
    },
    handleAdd(){
      this.isEdit = false;
      this.selectedRow = null;
      this.dialogVisible = true;
      this.resetForm();
    },
    handleEdit(row){
      if (row && row.systemId) {
        this.selectedRow = row;
      } else if (!this.selectedRow) {
        this.$message.warning('请先选择要编辑的测试系统');
        return;
      }
      this.isEdit = true;
      this.dialogVisible = true;
      this.loadTestSystemData();
    },
    handleDelete(){
      if (!this.selectedRow) {
        this.$message.warning('请先选择要删除的测试系统');
        return;
      }
      this.$confirm('确定要删除该测试系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        testSystemApi.deleteTestSystem(this.selectedRow.systemId).then(() => {
          this.$message.success('删除成功');
          this.getTestSystemList();
          this.selectedRow = null;
        }).catch(() => {
          this.$message.error('删除失败');
        });
      });
    },
    handleRowChange(currentRow){
      this.selectedRow = currentRow;
    },
    loadTestSystemData(){
      if (this.selectedRow) {
        this.testSystemForm = {
          systemId: this.selectedRow.systemId,
          systemName: this.selectedRow.systemName,
          orgId: this.selectedRow.orgId,
          orgName: this.selectedRow.orgName,
          systemType: this.selectedRow.systemType,
          systemStage: this.selectedRow.systemStage,
          isUse: this.selectedRow.isUse,
          systemDescription: this.selectedRow.systemDescription || '',
          planStartTime: this.selectedRow.planStartTime,
          planEndTime: this.selectedRow.planEndTime,
          actualStartTime: this.selectedRow.actualStartTime,
          actualEndTime: this.selectedRow.actualEndTime,
          systemTestManagerId: this.selectedRow.systemTestManagerId,
          testManagerName: this.selectedRow.testManagerName,
          systemDevManagerId: this.selectedRow.systemDevManagerId,
          devManagerName: this.selectedRow.devManagerName,
          changeHistory: this.selectedRow.changeHistory || ''
        };
      }
    },
    resetForm(){
      if (this.$refs.testSystemFormRef) {
        this.$refs.testSystemFormRef.resetFields();
      }
      this.testSystemForm = {
        systemId: '',
        systemName: '',
        orgId: '',
        orgName: '',
        systemType: '',
        systemStage: '',
        isUse: '1',
        systemDescription: '',
        planStartTime: '',
        planEndTime: '',
        actualStartTime: '',
        actualEndTime: '',
        systemTestManagerId: '',
        testManagerName: '',
        systemDevManagerId: '',
        devManagerName: '',
        changeHistory: ''
      };
    },
    submitForm(){
      this.$refs.testSystemFormRef.validate(valid => {
        if (!valid) return;

        const payload = { ...this.testSystemForm };

        if (this.isEdit) {
          testSystemApi.updateTestSystem(payload).then(() => {
            this.$message.success('编辑成功');
            this.dialogVisible = false;
            this.getTestSystemList();
          }).catch(() => {
            this.$message.error('编辑失败');
          });
        } else {
          testSystemApi.createTestSystem(payload).then(() => {
            this.$message.success('新增成功');
            this.dialogVisible = false;
            this.getTestSystemList();
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
      this.findOrgNameById(orgId).then(orgName => {
        this.testSystemForm.orgId = orgId;
        this.testSystemForm.orgName = orgName;
      });
    },
    resetOrgSelector() {
      this.orgSelectorVisible = false;
    },
    handleTestManagerSelect() {
      this.currentUserType = 'testManager';
      this.userSelectorVisible = true;
    },
    handleDevManagerSelect() {
      this.currentUserType = 'devManager';
      this.userSelectorVisible = true;
    },
    handleUserConfirm(userInfo) {
      // 直接使用UserSingleSelector传递的用户信息
      if (this.currentUserType === 'testManager') {
        this.testSystemForm.systemTestManagerId = userInfo.userId;
        this.testSystemForm.testManagerName = userInfo.userName;
        // 强制更新视图
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      } else if (this.currentUserType === 'devManager') {
        this.testSystemForm.systemDevManagerId = userInfo.userId;
        this.testSystemForm.devManagerName = userInfo.userName;
        // 强制更新视图
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      }
    },
    resetUserSelector() {
      this.userSelectorVisible = false;
      this.currentUserType = '';
    },
    async findOrgNameById(orgId) {
      try {
        const response = await orgApi.getOrgTree();
        const orgTree = response.data || [];
        return this.findOrgNameInTree(orgTree, orgId);
      } catch (error) {
        return '未知机构';
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
    },
    async findUserNameById(userId) {
      try {
        // 调用用户API获取用户信息
        const response = await userApi.getUserList({
          pageNo: 1,
          pageSize: 1000,
          userId: userId
        });

        if (response.data && response.data.rows && response.data.rows.length > 0) {
          const user = response.data.rows.find(u => u.userId === userId);
          return user ? user.userName : '未知用户';
        }

        // 如果通过userId没找到，尝试通过loginName查找
        const response2 = await userApi.getUserList({
          pageNo: 1,
          pageSize: 1000,
          loginName: userId
        });

        if (response2.data && response2.data.rows && response2.data.rows.length > 0) {
          const user = response2.data.rows[0];
          return user.userName;
        }

        return '未知用户';
      } catch (error) {
        // 如果API调用失败，使用模拟数据作为备选
        const userMap = {
          '1': '张三',
          '2': '李四',
          '3': '王五'
        };
        return userMap[userId] || '未知用户';
      }
    },
    getStageTagType(stage) {
      const typeMap = {
        '1': 'info',
        '2': 'warning',
        '3': 'success'
      };
      return typeMap[stage] || 'info';
    },
    getStageText(stage) {
      const item = this.systemStageOptions.find(option => option.dataValue === stage);
      return item ? item.dataName : '未知';
    },
    getSystemTypeText(type) {
      const item = this.systemTypeOptions.find(option => option.dataValue === type);
      return item ? item.dataName : '未知';
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    },
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      return new Date(dateTime).toLocaleString();
    }
  }
};
</script>

<style>
  .page-container {
    padding: 0;
    margin: 0;
    width: 100%;
    overflow-x: auto;
  }
  
  .app-main{
    padding: 10px;
  }

  #search .el-input, #search .el-select{
    width: 200px;
    margin-right: 10px;
  }
  
  #search .el-button {
    padding: 8px 12px;
    font-size: 12px;
  }

  .el-card{
    margin-bottom: 10px;
  }

  /* 表格容器水平滚动 */
  .table-wrapper {
    width: 100%;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    margin: 0;
    padding: 0;
  }
  
  .table-wrapper .el-table {
    min-width: 1500px !important;
    width: 1500px !important;
  }
  
  /* 强制覆盖Element UI的默认样式 */
  .el-table {
    min-width: 1500px !important;
    width: 1500px !important;
  }
  
  /* 覆盖el-alert__content的宽度限制 */
  .el-alert__content {
    width: 100% !important;
    max-width: none !important;
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

  /* 减小表格行高 - 使用更强的选择器 */
  ::v-deep .el-table th,
  ::v-deep .el-table td {
    height: 24px !important;
    line-height: 24px !important;
    padding: 0 !important;
    font-size: 12px !important;
    min-height: 24px !important;
    max-height: 24px !important;
  }

  ::v-deep .el-table__row {
    height: 24px !important;
    min-height: 24px !important;
    max-height: 24px !important;
  }

  ::v-deep .el-table .cell {
    padding: 0 5px !important;
    line-height: 24px !important;
    height: 24px !important;
  }

  /* 强制覆盖表格头部和主体的行高 */
  ::v-deep .el-table__header-wrapper .el-table th,
  ::v-deep .el-table__body-wrapper .el-table td {
    height: 24px !important;
    line-height: 24px !important;
    padding: 0 !important;
    min-height: 24px !important;
    max-height: 24px !important;
  }

  /* 强制设置表格行高 */
  ::v-deep .el-table tbody tr,
  ::v-deep .el-table thead tr {
    height: 24px !important;
    min-height: 24px !important;
    max-height: 24px !important;
  }

  ::v-deep .el-button--mini {
    padding: 3px 6px !important;
    font-size: 10px !important;
    height: 20px !important;
    line-height: 18px !important;
  }

  /* 针对标签的样式优化 */
  ::v-deep .el-tag {
    height: 18px !important;
    line-height: 16px !important;
    padding: 0 5px !important;
    font-size: 10px !important;
  }
</style>