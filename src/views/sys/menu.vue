<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 10px;">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-select v-model="selectedRoleId" placeholder="请选择角色" @change="onRoleChange" clearable>
            <el-option
              v-for="role in roleList"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleId">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="16">
      <el-button type="primary" icon="el-icon-plus" @click="onAddTopLevel">
        新增
      </el-button>
          <el-button v-if="selectedRoleId" type="success" icon="el-icon-check" @click="saveRoleMenus">
            保存角色菜单权限
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 新增一级菜单弹窗 -->
    <el-dialog title="新增一级菜单" :visible.sync="addDialogVisible" width="520px" @closed="resetAddForm">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="100px">
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="addForm.title" maxlength="30" placeholder="例如：系统管理" />
        </el-form-item>
        <el-form-item label="路由名" prop="name">
          <el-input v-model="addForm.name" maxlength="50" placeholder="例如：SysManage" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="addForm.path" placeholder="例如：/sys" />
        </el-form-item>
        <el-form-item label="重定向" prop="redirect">
          <el-input v-model="addForm.redirect" placeholder="例如：/sys/user" />
        </el-form-item>
        <el-form-item label="组件" prop="component">
          <el-input v-model="addForm.component" placeholder="例如：layout/index 或 views/sys/index" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="addForm.icon" placeholder="例如：sys、user、menuManage 等" />
          <div v-if="addForm.icon" style="margin-top: 6px;">
            <svg-icon :icon-class="addForm.icon" />
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="adding" @click="submitAdd">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 新建下级菜单弹窗 -->
    <el-dialog title="新建下级菜单" :visible.sync="childDialogVisible" width="520px" @closed="resetChildForm">
      <el-form ref="childFormRef" :model="childForm" :rules="childRules" label-width="120px">
        <el-form-item label="上级菜单">
          <el-input :value="currentParent && currentParent.title" disabled />
        </el-form-item>
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="childForm.title" maxlength="30" placeholder="例如：用户管理" />
        </el-form-item>
        <el-form-item label="路由名" prop="name">
          <el-input v-model="childForm.name" maxlength="50" placeholder="例如：UserManage" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="childForm.path" placeholder="例如：/sys/user" />
        </el-form-item>
        <el-form-item label="重定向" prop="redirect">
          <el-input v-model="childForm.redirect" placeholder="可留空" />
        </el-form-item>
        <el-form-item label="组件" prop="component">
          <el-input v-model="childForm.component" placeholder="例如：views/sys/user/index" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="childForm.icon" placeholder="例如：user" />
          <div v-if="childForm.icon" style="margin-top: 6px;">
            <svg-icon :icon-class="childForm.icon" />
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="childDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="addingChild" @click="submitAddChild">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改菜单弹窗 -->
    <el-dialog title="修改菜单" :visible.sync="editDialogVisible" width="520px" @closed="resetEditForm">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="editForm.title" maxlength="30" />
        </el-form-item>
        <el-form-item label="路由名" prop="name">
          <el-input v-model="editForm.name" maxlength="50" />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="editForm.path" />
        </el-form-item>
        <el-form-item label="重定向" prop="redirect">
          <el-input v-model="editForm.redirect" />
        </el-form-item>
        <el-form-item label="组件" prop="component">
          <el-input v-model="editForm.component" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="editForm.icon" />
          <div v-if="editForm.icon" style="margin-top: 6px;">
            <svg-icon :icon-class="editForm.icon" />
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="editing" @click="submitEdit">保 存</el-button>
      </span>
    </el-dialog>

    <el-card shadow="never">
      <el-table
        :data="menuTree"
        row-key="menuId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :lazy="true"
        :load="loadNodeChildren"
        border
        style="width: 100%"
        v-loading="loading"
        ref="menuTable"
      >
        <el-table-column v-if="selectedRoleId" type="selection" width="55" :selectable="isSelectable" @selection-change="onSelectionChange" />
        <el-table-column prop="title" label="菜单名称" min-width="180" />
        <el-table-column prop="path" label="路径" min-width="120" />
        <el-table-column prop="name" label="路由名" min-width="120" />
        <el-table-column prop="redirect" label="目标路径" min-width="200" />
        <el-table-column prop="icon" label="图标" width="120">
          <template slot-scope="scope">
            <svg-icon v-if="scope.row.icon" :icon-class="scope.row.icon" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="hidden" label="隐藏" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.hidden === 1 ? 'danger' : 'success'">
              {{ scope.row.hidden === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220">
          <template slot-scope="scope">
            <el-button type="text" size="mini" @click="onEdit(scope.row)">修改</el-button>
            <el-divider direction="vertical"></el-divider>
            <el-button type="text" size="mini" @click="onDelete(scope.row)">删除</el-button>
            <el-divider direction="vertical"></el-divider>
            <el-button v-if="!isButton(scope.row)" type="text" size="mini" @click="onAddChild(scope.row)">添加下级</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import menuApi from '@/api/menu'
import roleApi from '@/api/sys/role'
import { buildMenuTree } from '@/utils/menu'

export default {
  name: 'MenuManage',
  data() {
    return {
      loading: false,
      menus: [],
      menuTree: [],
      // 角色相关
      selectedRoleId: null,
      roleList: [],
      roleMenuIds: [], // 角色已分配的菜单ID列表
      selectedMenuIds: [], // 当前选中的菜单ID列表
      // 新增一级菜单
      addDialogVisible: false,
      adding: false,
      addForm: {
        title: '',
        name: '',
        path: '',
        redirect: '',
        component: '',
        icon: ''
      },
      addRules: {
        title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
        name: [{ required: true, message: '请输入路由名', trigger: 'blur' }],
        path: [
          { required: true, message: '请输入路径', trigger: 'blur' },
          { validator: (rule, value, callback) => {
              if (!/^\//.test(value)) return callback(new Error('路径需以/开头'))
              callback()
            }, trigger: 'blur' }
        ],
        component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }]
      },
      // 新建下级
      childDialogVisible: false,
      addingChild: false,
      currentParent: null,
      childForm: {
        title: '',
        name: '',
        path: '',
        redirect: '',
        component: '',
        icon: ''
      },
      childRules: {
        title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
        name: [{ required: true, message: '请输入路由名', trigger: 'blur' }],
        path: [
          { required: true, message: '请输入路径', trigger: 'blur' },
          { validator: (rule, value, callback) => {
              if (!/^\//.test(value)) return callback(new Error('路径需以/开头'))
              callback()
            }, trigger: 'blur' }
        ],
        component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }]
      },
      // 编辑
      editDialogVisible: false,
      editing: false,
      editForm: {
        menuId: undefined,
        title: '',
        name: '',
        path: '',
        redirect: '',
        component: '',
        icon: ''
      },
      editRules: {
        title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
        name: [{ required: true, message: '请输入路由名', trigger: 'blur' }],
        path: [
          { required: true, message: '请输入路径', trigger: 'blur' },
          { validator: (rule, value, callback) => {
              if (!/^\//.test(value)) return callback(new Error('路径需以/开头'))
              callback()
            }, trigger: 'blur' }
        ],
        component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.loadMenus()
    this.loadRoles()
  },
  methods: {
    isButton(row) {
      // 兼容后端1/0或字符串
      return row.isLeaf === '2' || row.sysMenuTp === '2'
    },
    async loadMenus() {
      this.loading = true
      try {
        const res = await menuApi.getAllMenus()
        const data = res && res.data ? res.data : []
        this.menus = Array.isArray(data) ? data : []
        const fullTree = buildMenuTree(this.menus, null)
        // 仅展示一级菜单：不默认展开；“首页”不显示展开图标
        this.menuTree = fullTree.map(top => {
          const node = { ...top }
          if (node.title === '首页') {
            // 移除 children 以隐藏加号
            delete node.children
            node.hasChildren = false
          } else {
            // 根据 isLeaf 设置是否有子级；'0' 表示还有子节点
            if (node.isLeaf === '0') {
              node.hasChildren = true
            } else if (Array.isArray(node.children) && node.children.length > 0) {
              node.hasChildren = true
            } else {
              node.hasChildren = false
            }
            // 顶级仅展示占位，不直接塞 children，交给懒加载
            delete node.children
          }
          return node
        })
      } catch (e) {
        this.$message.error(e && e.message ? e.message : '菜单加载失败')
      } finally {
        this.loading = false
      }
    },

    // Element-UI 懒加载钩子（点击小三角触发）
    async loadNodeChildren(row, treeNode, resolve) {
      try {
        const parent = row
        if (!parent || !parent.menuId) return resolve([])
        const res = await menuApi.getMenusByParentId(parent.menuId)
        const children = (res && res.data) ? res.data : []
        const normalized = children.map(c => ({
          ...c,
          hasChildren: c.isLeaf === '0'
        }))
        resolve(normalized)
      } catch (e) {
        resolve([])
      }
    },
    onAddTopLevel() {
      this.addDialogVisible = true
    },
    resetAddForm() {
      this.$nextTick(() => {
        if (this.$refs.addFormRef) this.$refs.addFormRef.resetFields()
        this.addForm = { title: '', name: '', path: '', redirect: '', icon: '' }
        this.adding = false
      })
    },
    submitAdd() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        try {
          this.adding = true
          const payload = {
            title: this.addForm.title,
            name: this.addForm.name,
            path: this.addForm.path,
            redirect: this.addForm.redirect,
            icon: this.addForm.icon,
            component: 'Layout',
            isLeaf: '0',
            parentId: 0,
            hidden: 0
          }
          await menuApi.createMenu(payload)
        this.$message.success('新增成功')
          this.addDialogVisible = false
        this.loadMenus()
        } catch (e) {
          this.$message.error(e && e.message ? e.message : '新增失败')
        } finally {
          this.adding = false
        }
      })
    },
    onAddChild(row) {
      this.currentParent = row
      const base = row && row.path ? row.path.replace(/\/?$/, '/') : '/'
      this.childForm = { title: '', name: '', path: `${base}`, redirect: '', component: '', icon: '' }
      this.childDialogVisible = true
    },
    resetChildForm() {
      this.$nextTick(() => {
        if (this.$refs.childFormRef) this.$refs.childFormRef.resetFields()
        this.childForm = { title: '', name: '', path: '', redirect: '', component: '', icon: '' }
        this.addingChild = false
        this.currentParent = null
      })
    },
    submitAddChild() {
      this.$refs.childFormRef.validate(async valid => {
        if (!valid) return
        try {
          this.addingChild = true
          const payload = {
            title: this.childForm.title,
            name: this.childForm.name,
            path: this.childForm.path,
            redirect: this.childForm.redirect,
            component: this.childForm.component,
            icon: this.childForm.icon,
            isLeaf: '1',
            parentId: this.currentParent ? this.currentParent.menuId : 0,
            hidden: 0
          }
          await menuApi.createMenu(payload)
        this.$message.success('新增成功')
          this.childDialogVisible = false
        this.loadMenus()
        } catch (e) {
          this.$message.error(e && e.message ? e.message : '新增失败')
        } finally {
          this.addingChild = false
        }
      })
    },
    onEdit(row) {
      this.editForm = {
        menuId: row.menuId,
        title: row.title || '',
        name: row.name || '',
        path: row.path || '',
        redirect: row.redirect || '',
        component: row.component || '',
        icon: row.icon || ''
      }
      this.editDialogVisible = true
    },
    resetEditForm() {
      this.$nextTick(() => {
        if (this.$refs.editFormRef) this.$refs.editFormRef.resetFields()
        this.editForm = { menuId: undefined, title: '', name: '', path: '', redirect: '', component: '', icon: '' }
        this.editing = false
      })
    },
    submitEdit() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        try {
          this.editing = true
          await menuApi.updateMenu(this.editForm)
        this.$message.success('修改成功')
          this.editDialogVisible = false
        this.loadMenus()
        } catch (e) {
          this.$message.error(e && e.message ? e.message : '修改失败')
        } finally {
          this.editing = false
        }
      })
    },
    onDelete(row) {
      this.$confirm(`确认删除【${row.title}】?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => menuApi.deleteMenu(row.menuId))
        .then(() => {
          this.$message.success('删除成功')
          this.loadMenus()
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}

/* 自定义树形展开图标：用两条边的箭头 */
::v-deep .el-table__expand-icon {
  transform: none !important;
}
/* 隐藏默认向右箭头 */
::v-deep .el-table__expand-icon > .el-icon-arrow-right {
  display: none;
}
/* 基础箭头（两条边） */
::v-deep .el-table__expand-icon:before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-right: 2px solid #409EFF;
  border-bottom: 2px solid #409EFF;
  transform: rotate(45deg); /* 折叠状态：向下 */
  transition: transform 0.15s ease;
}
/* 展开状态：向上 */
::v-deep .el-table__expand-icon.el-table__expand-icon--expanded:before {
  transform: rotate(-135deg);
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

</style>


