<template>
  <div>
    <!-- 搜索栏 -->
    <el-card id="search">
      <el-row>
        <el-col :span="18">
          <el-input v-model="searchModel.roleName" placeholder="角色名称"></el-input>
          <el-button @click="getRoleList" type="primary" round icon="el-icon-search">查询</el-button>
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
          <el-tooltip content="角色-用户管理" placement="top">
            <el-button @click="handleUserManage" type="success" icon="el-icon-user" circle :disabled="!selectedRow"></el-button>
          </el-tooltip>
          <el-tooltip content="角色-菜单管理" placement="top">
            <el-button @click="handleMenuManage" type="primary" icon="el-icon-menu" circle :disabled="!selectedRow"></el-button>
          </el-tooltip>
        </el-col>
      </el-row>
    </el-card>

    <!-- 结果栏 -->
    <el-card>
      <el-table :data="roleList" stripe style="width: 100%" @row-dblclick="handleEdit" @current-change="handleRowChange" highlight-current-row>
        <el-table-column type="index" width="55" label="序号"></el-table-column>
        <el-table-column prop="roleId" label="角色ID" width="80" v-if="false"></el-table-column>
        <el-table-column prop="roleName" label="角色名称" width="200"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="300"></el-table-column>
      </el-table>
    </el-card>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="searchModel.pageNo"
      :page-sizes="[100, 200, 300, 400]"
      :page-size="searchModel.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" @close="resetForm">
      <el-form ref="roleFormRef" :model="roleForm" :rules="rules" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="排序号" prop="sortNo">
          <el-input-number v-model="roleForm.sortNo" :min="1" :max="9999" placeholder="请输入排序号"></el-input-number>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="roleForm.remark" type="textarea" :rows="3" placeholder="请输入备注"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 角色用户管理弹窗 -->
    <el-dialog title="角色用户管理" :visible.sync="userManageVisible" width="800px" @close="resetUserManage">
      <div>
        <el-row style="margin-bottom: 10px;">
          <el-col :span="18">
            <el-input v-model="userSearchModel.userName" placeholder="用户名" style="width: 200px; margin-right: 10px;"></el-input>
            <el-button @click="getRoleUsers" type="primary" round icon="el-icon-search">查询</el-button>
            <el-button @click="resetUserSearch" type="info" round icon="el-icon-refresh">重置</el-button>
          </el-col>
          <el-col :span="6" align="right">
            <el-tooltip content="添加用户" placement="top">
              <el-button @click="handleAddUser" type="primary" icon="el-icon-plus" circle></el-button>
            </el-tooltip>
          </el-col>
        </el-row>

        <el-table :data="roleUserList" stripe style="width: 100%" @current-change="handleUserRowChange" highlight-current-row>
          <el-table-column type="index" width="55" label="序号"></el-table-column>
          <el-table-column prop="userId" label="用户ID" width="80" v-if="false"></el-table-column>
          <el-table-column prop="userName" label="用户名" width="150"></el-table-column>
          <el-table-column prop="loginName" label="登录名" width="150"></el-table-column>
          <el-table-column prop="phone" label="电话" width="150"></el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-tooltip content="移除角色" placement="top">
                <el-button @click="handleRemoveUser(scope.row)" type="danger" icon="el-icon-delete" circle size="mini"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          @size-change="handleUserSizeChange"
          @current-change="handleUserCurrentChange"
          :current-page="userSearchModel.pageNo"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="userSearchModel.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="userTotal"
          style="margin-top: 10px;">
        </el-pagination>
      </div>
    </el-dialog>

    <!-- 角色菜单管理弹窗 -->
    <el-dialog title="角色菜单管理" :visible.sync="menuManageVisible" width="560px" @close="resetMenuManage">
      <div style="max-height: 60vh; overflow: auto;">
        <el-tree
          ref="menuTreeRef"
          :data="menuTreeData"
          node-key="menuId"
          show-checkbox
          :default-checked-keys="checkedMenuIds"
          :props="{ label: 'title', children: 'children' }"
          :expand-on-click-node="false"
          :check-strictly="true"
          :default-expand-all="true"
          :check-on-click-node="true">
        </el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="menuManageVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRoleMenus">保 存</el-button>
      </span>
    </el-dialog>

    <!-- 用户选择组件 -->
    <UserSelectors
      v-model="addUserVisible"
      :excludeUserIds="roleUserIds"
      @confirm="handleUserSelect"
      @close="resetAddUser">
    </UserSelectors>
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
import roleApi from '@/api/sys/role'
import menuApi from '@/api/menu'
import UserSelectors from './common/UserMultipleSelector.vue'

export default {
  components: {
    UserSelectors
  },
  data(){
    return{
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 10
      },
      roleList: [],
      dialogVisible: false,
      isEdit: false,
      selectedRow: null,
      // 用户管理相关
      userManageVisible: false,
      userSearchModel: {
        pageNo: 1,
        pageSize: 10
      },
      roleUserList: [],
      userTotal: 0,
      selectedUserRow: null,
      // 添加用户相关
      addUserVisible: false,
      // 菜单管理相关
      menuManageVisible: false,
      menuTreeData: [],
      checkedMenuIds: [],
      roleForm: {
        roleId: '',
        roleName: '',
        sortNo: 1,
        remark: ''
      },
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 100, message: '长度在2到100个字符', trigger: 'blur' }
        ],
        sortNo: [
          { required: true, message: '请输入排序号', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    dialogTitle() {
      return this.isEdit ? '编辑角色' : '新增角色';
    },
    roleUserIds() {
      return this.roleUserList.map(user => user.userId);
    }
  },

  created(){
    this.getRoleList();
  },

  methods:{
    handleSizeChange(pageSize){
      this.searchModel.pageSize = pageSize;
      this.getRoleList();
    },
    handleCurrentChange(pageNo){
      this.searchModel.pageNo = pageNo;
      this.getRoleList();
    },
    getRoleList(){
      roleApi.getRoleList(this.searchModel).then(response =>{
        this.roleList = response.data.rows;
        this.total = response.data.total;
      });
    },
    resetSearch(){
      this.searchModel.roleName = '';
      this.searchModel.pageNo = 1;
      this.getRoleList();
    },
    handleAdd(){
      this.isEdit = false;
      this.selectedRow = null;
      this.dialogVisible = true;
      this.resetForm();
    },
    handleEdit(row){
      if (row && row.roleId) {
        // 双击行编辑
        this.selectedRow = row;
      } else if (!this.selectedRow) {
        this.$message.warning('请先选择要编辑的角色');
        return;
      }
      this.isEdit = true;
      this.dialogVisible = true;
      this.loadRoleData();
    },
    handleDelete(){
      if (!this.selectedRow) {
        this.$message.warning('请先选择要删除的角色');
        return;
      }
      this.$confirm('确定要删除该角色吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        roleApi.deleteRole(this.selectedRow.roleId).then(() => {
          this.$message.success('删除成功');
          this.selectedRow = null;
          this.getRoleList();
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
    loadRoleData(){
      if (this.selectedRow) {
        this.roleForm = {
          roleId: this.selectedRow.roleId,
          roleName: this.selectedRow.roleName,
          sortNo: this.selectedRow.sortNo,
          remark: this.selectedRow.remark || ''
        };
      }
    },
    resetForm(){
      if (this.$refs.roleFormRef) {
        this.$refs.roleFormRef.resetFields();
      }
      this.roleForm = { roleId: '', roleName: '', sortNo: 1, remark: '' };
    },
    submitForm(){
      this.$refs.roleFormRef.validate(valid => {
        if (!valid) return;
        const payload = {
          roleName: this.roleForm.roleName,
          sortNo: this.roleForm.sortNo,
          remark: this.roleForm.remark
        };

        if (this.isEdit) {
          // 编辑角色
          payload.roleId = this.roleForm.roleId;
          roleApi.updateRole(payload).then(() => {
            this.$message.success('编辑成功');
            this.dialogVisible = false;
            this.getRoleList();
          }).catch(() => {
            this.$message.error('编辑失败');
          });
        } else {
          // 新增角色
          roleApi.createRole(payload).then(() => {
            this.$message.success('新增成功');
            this.dialogVisible = false;
            this.getRoleList();
          }).catch(() => {
            this.$message.error('新增失败');
          });
        }
      });
    },
    // 用户管理相关方法
    handleUserManage(){
      if (!this.selectedRow) {
        this.$message.warning('请先选择要管理的角色');
        return;
      }
      this.userManageVisible = true;
      this.resetUserManage();
      this.getRoleUsers();
    },
    // 菜单管理
    async handleMenuManage(){
      if (!this.selectedRow) {
        this.$message.warning('请先选择要管理的角色');
        return;
      }
      this.menuManageVisible = true;
      await this.loadAllMenus();
      await this.loadRoleCheckedMenus();
    },
    async loadAllMenus(){
      try {
        // 获取所有菜单
        const res = await menuApi.getAllMenus()
        const list = Array.isArray(res && res.data) ? res.data : []
        // 特别检查基础管理相关菜单的ID
        const baseManageMenus = list.filter(m => m.title && (m.title.includes('基础管理') || m.title.includes('测试系统维护') || m.title.includes('系统成员管理')))

        // 只过滤隐藏菜单，显示所有非隐藏的菜单
        const visible = list.filter(m => m.hidden !== 1)

        // 构造成树
        const idToNode = {}
        visible.forEach(m => { idToNode[m.menuId] = { ...m, children: [] } })
        const roots = []
        visible.forEach(m => {
          if (m.parentId && idToNode[m.parentId]) {
            idToNode[m.parentId].children.push(idToNode[m.menuId])
          } else {
            roots.push(idToNode[m.menuId])
          }
        })
        this.menuTreeData = roots

        // 检查菜单树中menuId的类型
        if (this.menuTreeData.length > 0) {
        }
      } catch (e) {
        this.menuTreeData = []
      }
    },
    async loadRoleCheckedMenus(){
      try {
        // 获取角色权限菜单ID列表
        const res = await menuApi.getRoleMenus(this.selectedRow.roleId)
        const roleMenuIds = Array.isArray(res && res.data) ? res.data : []

        // 菜单树中的menuId是数字类型，所以直接使用数字数组

        // 检查菜单树中所有菜单的ID类型
        const allMenuIds = this.getAllMenuIdsFromTree(this.menuTreeData)

        // 检查角色权限菜单ID的类型

        // 找出不在角色权限中的菜单ID
        const notInRoleMenus = allMenuIds.filter(id => !roleMenuIds.includes(id))

        // 只勾选角色有权限的菜单（使用数字类型）
        this.checkedMenuIds = roleMenuIds
        this.$nextTick(() => {
          if (this.$refs.menuTreeRef) {

            // 先清除所有勾选
            this.$refs.menuTreeRef.setCheckedKeys([])

            // 使用setTimeout延迟设置，确保清除操作完成
            setTimeout(() => {
              this.$refs.menuTreeRef.setCheckedKeys(roleMenuIds)
            }, 100)
          } else {
          }
        })
      } catch (e) {
        this.checkedMenuIds = []
      }
    },
    resetMenuManage(){
      this.menuTreeData = [];
      this.checkedMenuIds = [];
    },
    // 递归获取菜单树中的所有菜单ID
    getAllMenuIdsFromTree(treeData) {
      const ids = []
      const traverse = (nodes) => {
        if (Array.isArray(nodes)) {
          nodes.forEach(node => {
            if (node.menuId) {
              // 保持原始类型，不强制转换
              ids.push(node.menuId)
            }
            if (node.children && node.children.length > 0) {
              traverse(node.children)
            }
          })
        }
      }
      traverse(treeData)
      return ids
    },
    async submitRoleMenus(){
      const checked = this.$refs.menuTreeRef.getCheckedKeys();
      const half = this.$refs.menuTreeRef.getHalfCheckedKeys ? this.$refs.menuTreeRef.getHalfCheckedKeys() : [];
      const keys = Array.from(new Set([...(checked || []), ...(half || [])]));

      // 菜单树返回的已经是数字类型，直接使用
      try {
        await menuApi.saveRoleMenus(this.selectedRow.roleId, keys);
        this.$message.success('保存成功');
        this.menuManageVisible = false;
      } catch (e) {
        this.$message.error('保存失败');
      }
    },
    resetUserManage(){
      this.userSearchModel = {
        pageNo: 1,
        pageSize: 10
      };
      this.roleUserList = [];
      this.userTotal = 0;
      this.selectedUserRow = null;
    },
    getRoleUsers(){
      roleApi.getRoleUsers(this.selectedRow.roleId, this.userSearchModel).then(response => {
        this.roleUserList = response.data.rows;
        this.userTotal = response.data.total;
      });
    },
    resetUserSearch(){
      this.userSearchModel.userName = '';
      this.userSearchModel.pageNo = 1;
      this.getRoleUsers();
    },
    handleUserSizeChange(pageSize){
      this.userSearchModel.pageSize = pageSize;
      this.getRoleUsers();
    },
    handleUserCurrentChange(pageNo){
      this.userSearchModel.pageNo = pageNo;
      this.getRoleUsers();
    },
    handleUserRowChange(currentRow){
      this.selectedUserRow = currentRow;
    },
    handleRemoveUser(user){
      this.$confirm('确定要移除该用户的角色吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        roleApi.removeUserRole(this.selectedRow.roleId, user.userId).then(() => {
          this.$message.success('移除成功');
          this.getRoleUsers();
        }).catch(() => {
          this.$message.error('移除失败');
        });
      }).catch(() => {
        this.$message.info('已取消移除');
      });
    },
    handleAddUser(){
      this.addUserVisible = true;
    },
    resetAddUser(){
      // 重置添加用户相关状态
    },
    handleUserSelect(users){
      // 批量添加用户到角色
      const promises = users.map(user =>
        roleApi.addUserRole(this.selectedRow.roleId, user.userId)
      );

      Promise.all(promises).then(() => {
        this.$message.success(`成功添加 ${users.length} 个用户`);
        this.getRoleUsers();
      }).catch(() => {
        this.$message.error('添加失败');
      });
    }
  }
};
</script>
