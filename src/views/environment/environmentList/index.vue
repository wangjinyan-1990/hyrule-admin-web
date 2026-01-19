<template>
  <div>
    <!-- 搜索栏 -->
    <el-card id="search">
      <el-row>
        <el-col :span="18">
          <el-select v-model="searchModel.systemName" placeholder="系统名称" clearable filterable size="small" style="width: 150px; margin-right: 10px;">
            <el-option
              v-for="system in systemNameOptions"
              :key="system"
              :label="system"
              :value="system">
            </el-option>
          </el-select>
          <el-select v-model="searchModel.envId" placeholder="环境名称" clearable size="small" style="width: 150px; margin-right: 10px;">
            <el-option
              v-for="env in envOptions"
              :key="env.envId"
              :label="env.envName"
              :value="env.envId">
            </el-option>
          </el-select>
          <el-input v-model="searchModel.serverName" placeholder="服务名称" size="small" style="width: 150px; margin-right: 10px;"></el-input>
          <el-input v-model="searchModel.ipAddress" placeholder="主机地址" size="small" style="width: 150px; margin-right: 10px;"></el-input>
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
      <el-row style="margin-top: 15px;">
        <el-col :span="24">
          <el-button @click="handleImport" type="warning" size="small" round icon="el-icon-upload2">导入</el-button>
          <el-button @click="handleExport" type="success" size="small" round icon="el-icon-download" :disabled="environmentList.length === 0">导出</el-button>
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
        highlight-current-row
        class="environment-list-table">
        <el-table-column type="index" width="55" label="序号"></el-table-column>
        <el-table-column prop="envListId" label="环境清单Id" width="30" v-if="false"></el-table-column>
        <el-table-column prop="envId" label="环境Id" width="30" v-if="false"></el-table-column>
        <el-table-column prop="envName" label="环境名称" width="70" show-overflow-tooltip></el-table-column>
        <el-table-column prop="systemId" label="系统ID" width="30" v-if="false"></el-table-column>
        <el-table-column prop="systemName" label="系统名称" width="100" show-overflow-tooltip></el-table-column>
        <el-table-column prop="serverName" label="服务名称" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="ipAddress" label="主机地址" width="90" show-overflow-tooltip></el-table-column>
        <el-table-column prop="portInfo" label="端口信息" width="70" show-overflow-tooltip></el-table-column>
        <el-table-column prop="linkAddress" label="链接地址" min-width="180" show-overflow-tooltip>
          <template slot-scope="scope">
            <a
              v-if="scope.row.linkAddress"
              :href="scope.row.linkAddress"
              target="_blank"
              style="color: #409EFF; text-decoration: none;"
              @click.stop>
              {{ scope.row.linkAddress }}
            </a>
            <span v-else style="color: #999;">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="configurationPeopleNames" label="配置人员" min-width="70" show-overflow-tooltip>
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
              <el-input
                v-model="environmentListForm.envName"
                placeholder="请选择环境"
                readonly
                @click.native="handleSelectEnv">
                <el-button slot="append" icon="el-icon-search" @click="handleSelectEnv"></el-button>
              </el-input>
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
        <el-form-item label="配置人员" prop="configurationPeopleNames">
          <el-input
            v-model="environmentListForm.configurationPeopleNames"
            placeholder="请输入配置人员名称（多个人员用、分隔）">
          </el-input>
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

    <!-- 环境选择器 -->
    <EnvSingleSelector
      v-model="envSelectorVisible"
      :selectedEnvId="environmentListForm.envId"
      @confirm="handleEnvConfirm">
    </EnvSingleSelector>

    <!-- 系统选择器 -->
    <TestSystemSingleSelector
      v-model="systemSelectorVisible"
      :selectedSystemId="environmentListForm.systemId"
      @confirm="handleSystemConfirm">
    </TestSystemSingleSelector>

    <!-- 导入对话框 -->
    <el-dialog
      title="导入环境清单"
      :visible.sync="importDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      @close="handleImportDialogClose">
      <el-upload
        ref="upload"
        :http-request="handleUploadRequest"
        :file-list="fileList"
        :auto-upload="false"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
        :limit="1"
        accept=".xlsx,.xls"
        drag>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">只能上传xlsx/xls文件，且不超过10MB</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button @click="downloadTemplate" type="info">下载模板</el-button>
        <el-button @click="submitUpload" type="primary" :loading="uploading">确定导入</el-button>
      </div>
    </el-dialog>
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

  /* 减小表格行高 - 使用更强的选择器 */
  .environment-list-table th,
  .environment-list-table td {
    height: 24px !important;
    line-height: 24px !important;
    padding: 0 !important;
    font-size: 12px !important;
    min-height: 24px !important;
    max-height: 24px !important;
  }

  .environment-list-table .el-table__row {
    height: 24px !important;
    min-height: 24px !important;
    max-height: 24px !important;
  }

  .environment-list-table .cell {
    padding: 0 5px !important;
    line-height: 24px !important;
    height: 24px !important;
  }

  /* 强制覆盖表格头部和主体的行高 */
  .environment-list-table .el-table__header-wrapper .el-table th,
  .environment-list-table .el-table__body-wrapper .el-table td {
    height: 24px !important;
    line-height: 24px !important;
    padding: 0 !important;
    min-height: 24px !important;
    max-height: 24px !important;
    font-size: 12px !important;
  }

  /* 强制设置表格行高 */
  .environment-list-table tbody tr,
  .environment-list-table thead tr {
    height: 24px !important;
    min-height: 24px !important;
    max-height: 24px !important;
  }

  /* 针对具体的列 */
  .environment-list-table .el-table__header th,
  .environment-list-table .el-table__body td {
    height: 24px !important;
    line-height: 24px !important;
    padding: 0 !important;
    font-size: 12px !important;
  }

  /* 标签样式 */
  .environment-list-table .el-tag {
    font-size: 12px !important;
    height: 20px !important;
    line-height: 20px !important;
    padding: 0 5px !important;
  }
</style>

<script>
import environmentListApi from '@/api/environment/environmentList'
import environmentApi from '@/api/environment/environment'
import testSystemApi from '@/api/test/baseManage/testSystem'
import EnvSingleSelector from '@/views/sys/common/EnvSingleSelector'
import TestSystemSingleSelector from '@/views/sys/common/TestSystemSingleSelector'

export default {
  components: {
    EnvSingleSelector,
    TestSystemSingleSelector
  },
  data(){
    return{
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 20,
        systemName: '',
        envId: '',
        serverName: '',
        ipAddress: ''
      },
      envOptions: [],
      systemNameOptions: [],
      environmentList: [],
      dialogVisible: false,
      isEdit: false,
      selectedRow: null,
      envSelectorVisible: false,
      systemSelectorVisible: false,
      importDialogVisible: false,
      fileList: [],
      uploading: false,
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
        configurationPeopleNames: '',
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
    this.loadSystemNameOptions();
  },

  methods:{
    handleSizeChange(pageSize){
      this.searchModel.pageSize = pageSize;
      // 改变每页条数时，重置到第一页
      this.searchModel.pageNo = 1;
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
        systemName: this.searchModel.systemName, // 模糊查询
        envId: this.searchModel.envId,
        serverName: this.searchModel.serverName, // 模糊查询
        ipAddress: this.searchModel.ipAddress // 模糊查询
      };

      environmentListApi.getEnvironmentList(queryParams).then(response => {
        // request拦截器已经返回了response.data，所以response就是后端返回的数据
        // 检查API响应结构，支持多种格式
        let responseData = null;

        // 优先处理标准分页格式：{code: 20000, data: {rows: [], total: 0}}
        if (response.code === 20000 && response.data) {
          if (response.data.rows && Array.isArray(response.data.rows)) {
            responseData = response.data;
          } else if (Array.isArray(response.data)) {
            // data直接是数组格式（非分页）
            // 前端分页处理
            const startIndex = (this.searchModel.pageNo - 1) * this.searchModel.pageSize;
            const endIndex = startIndex + this.searchModel.pageSize;
            this.environmentList = response.data.slice(startIndex, endIndex);
            this.total = response.data.length;
            return;
          }
        }

        // 处理直接格式：{rows: [], total: 0} 或 {code: 20000, rows: [], total: 0}
        if (!responseData && (response.rows || response.total !== undefined)) {
          responseData = response;
        }

        // 处理嵌套格式：{data: {rows: [], total: 0}}
        if (!responseData && response.data && (response.data.rows || response.data.total !== undefined)) {
          responseData = response.data;
        }

        // 处理数组格式（非分页，应该避免这种情况）
        if (!responseData && Array.isArray(response)) {
          // 前端分页处理
          const startIndex = (this.searchModel.pageNo - 1) * this.searchModel.pageSize;
          const endIndex = startIndex + this.searchModel.pageSize;
          this.environmentList = response.slice(startIndex, endIndex);
          this.total = response.length;
          return;
        }

        if (responseData) {
          const rows = responseData.rows || [];
          const total = responseData.total !== undefined ? responseData.total : rows.length;

          // 如果后端返回的数据量超过pageSize，说明后端没有正确分页，需要前端处理
          if (rows.length > this.searchModel.pageSize) {
            // 前端分页处理：根据pageNo和pageSize截取数据
            const startIndex = (this.searchModel.pageNo - 1) * this.searchModel.pageSize;
            const endIndex = startIndex + this.searchModel.pageSize;
            this.environmentList = rows.slice(startIndex, endIndex);
            this.total = total;
          } else {
            // 后端已经正确分页，直接使用
            this.environmentList = rows;
            this.total = total;
          }
        } else {
          // 如果都不匹配，输出错误
          this.$message.error('获取环境清单列表失败：响应数据格式不正确');
          this.environmentList = [];
          this.total = 0;
        }
      }).catch(error => {
        this.$message.error('获取环境清单列表失败：' + (error.message || '网络错误'));
        this.environmentList = [];
        this.total = 0;
      });
    },
    resetSearch(){
      this.searchModel.systemName = '';
      this.searchModel.envId = '';
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
            configurationPeopleNames: this.selectedRow.configurationPeopleNames || '',
            remark: this.selectedRow.remark || ''
          };
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
                configurationPeopleNames: data.configurationPeopleNames || '',
                remark: data.remark || ''
              };
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
        configurationPeopleNames: '',
        remark: ''
      };
    },
    submitForm(){
      this.$refs.environmentListFormRef.validate(valid => {
        if (!valid) return;

        const payload = {
          envId: this.environmentListForm.envId,
          systemId: this.environmentListForm.systemId,
          serverName: this.environmentListForm.serverName,
          ipAddress: this.environmentListForm.ipAddress,
          portInfo: this.environmentListForm.portInfo || '',
          linkAddress: this.environmentListForm.linkAddress || '',
          configurationPeopleNames: this.environmentListForm.configurationPeopleNames || '',
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
    // 加载系统名称选项（用于查询条件下拉选择）
    loadSystemNameOptions(){
      testSystemApi.getTestSystemList({ pageNo: 1, pageSize: 1000 }).then(response => {
        let systemList = [];
        
        // 优先处理数组格式的响应
        if (Array.isArray(response)) {
          systemList = response;
        } else if (response.data) {
          if (Array.isArray(response.data)) {
            systemList = response.data;
          } else if (response.data.rows && Array.isArray(response.data.rows)) {
            systemList = response.data.rows;
          }
        } else if (response.code === 20000 && response.data) {
          if (Array.isArray(response.data)) {
            systemList = response.data;
          } else if (response.data.rows && Array.isArray(response.data.rows)) {
            systemList = response.data.rows;
          }
        } else if (response.rows && Array.isArray(response.rows)) {
          systemList = response.rows;
        }

        // 从系统列表中提取唯一的系统名称
        const systemNameSet = new Set();
        systemList.forEach(system => {
          if (system.systemName) {
            systemNameSet.add(system.systemName);
          }
        });
        this.systemNameOptions = Array.from(systemNameSet).sort();
      }).catch(error => {
        this.systemNameOptions = [];
      });
    },
    // 加载环境选项（用于查询条件下拉选择）
    loadEnvOptions(){
      environmentApi.getEnvironmentList({ pageNo: 1, pageSize: 1000 }).then(response => {
        // 优先处理数组格式的响应
        if (Array.isArray(response)) {
          this.envOptions = response;
          return;
        }

        // 处理包装在data中的数组
        if (response.data) {
          if (Array.isArray(response.data)) {
            // data直接是数组格式
            this.envOptions = response.data;
            return;
          } else if (response.data.rows && Array.isArray(response.data.rows)) {
            // data中有rows字段（分页格式）
            this.envOptions = response.data.rows;
            return;
          }
        }

        // 处理其他可能的格式
        if (response.code === 20000 && response.data) {
          if (Array.isArray(response.data)) {
            this.envOptions = response.data;
            return;
          } else if (response.data.rows && Array.isArray(response.data.rows)) {
            this.envOptions = response.data.rows;
            return;
          }
        }

        // 处理直接包含rows的格式
        if (response.rows && Array.isArray(response.rows)) {
          this.envOptions = response.rows;
          return;
        }

        // 如果都不匹配，输出警告
        this.envOptions = [];
      }).catch(error => {
        this.envOptions = [];
      });
    },
    // 选择环境（用于表单中的环境选择器）
    handleSelectEnv(){
      this.envSelectorVisible = true;
    },
    // 环境选择确认
    handleEnvConfirm(envId, envName, env){
      if (env) {
        this.environmentListForm.envId = env.envId;
        this.environmentListForm.envName = env.envName || '';
      } else if (envId && envName) {
        this.environmentListForm.envId = envId;
        this.environmentListForm.envName = envName;
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
    // 导出环境清单
    async handleExport() {
      try {
        const params = {
          ...this.searchModel
        };
        const response = await environmentListApi.exportEnvironmentList(params);

        // 创建下载链接
        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `环境清单_${new Date().getTime()}.xlsx`;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);

        this.$message.success('导出成功');
      } catch (error) {
        this.$message.error('导出失败：' + (error.message || '网络错误'));
      }
    },
    // 导入环境清单
    handleImport() {
      this.importDialogVisible = true;
      this.fileList = [];
    },
    // 下载导入模板
    async downloadTemplate() {
      try {
        const response = await environmentListApi.downloadImportTemplate();

        const blob = new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '环境清单导入模板.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);

        this.$message.success('模板下载成功');
      } catch (error) {
        this.$message.error('模板下载失败：' + (error.message || '网络错误'));
      }
    },
    // 上传前检查
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     file.type === 'application/vnd.ms-excel' ||
                     file.name.endsWith('.xlsx') ||
                     file.name.endsWith('.xls');
      const isLt10M = file.size / 1024 / 1024 < 10;

      if (!isExcel) {
        this.$message.error('只能上传Excel文件!');
        return false;
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过10MB!');
        return false;
      }
      return true;
    },
    // 文件列表变化
    handleFileChange(file, fileList) {
      // 限制只能选择一个文件，如果选择了新文件，清除旧文件
      if (fileList.length > 1) {
        this.fileList = [fileList[fileList.length - 1]];
        // 同步更新 el-upload 组件的 fileList
        this.$nextTick(() => {
          if (this.$refs.upload) {
            this.$refs.upload.fileList = this.fileList;
          }
        });
      } else {
        this.fileList = fileList;
      }
    },
    // 导入对话框关闭时清除文件列表
    handleImportDialogClose() {
      this.fileList = [];
      this.uploading = false;
      // 清除 el-upload 组件的文件列表
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles();
      }
    },
    // 自定义上传请求（使用 http-request）
    async handleUploadRequest(options) {
      try {
        const formData = new FormData();
        formData.append('file', options.file);

        const response = await environmentListApi.importEnvironmentList(formData);

        if (response.code === 20000 || response.code === 200) {
          this.$message.success('导入成功');
          this.importDialogVisible = false;
          this.fileList = [];
          this.getEnvironmentList();
        } else {
          this.$message.error('导入失败：' + (response.message || '未知错误'));
          // 导入失败时清除文件列表
          this.fileList = [];
          if (this.$refs.upload) {
            this.$refs.upload.clearFiles();
          }
        }
        this.uploading = false;
      } catch (error) {
        this.$message.error('导入失败：' + (error.message || '网络错误'));
        // 导入失败时清除文件列表
        this.fileList = [];
        if (this.$refs.upload) {
          this.$refs.upload.clearFiles();
        }
        this.uploading = false;
      }
    },
    // 提交上传
    submitUpload() {
      // 使用 el-upload 组件的 fileList 来检查
      const uploadFileList = this.$refs.upload ? this.$refs.upload.fileList : this.fileList;
      if (!uploadFileList || uploadFileList.length === 0) {
        this.$message.warning('请先选择要上传的文件');
        return;
      }
      this.uploading = true;
      this.$refs.upload.submit();
    }
  }
};
</script>
