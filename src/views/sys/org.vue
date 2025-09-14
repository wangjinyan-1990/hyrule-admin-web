<template>
  <div class="org-container">
    <!-- 左侧机构树 -->
    <div class="org-tree-panel">
      <el-card class="tree-card">
        <div slot="header" class="tree-header">
          <span>机构列表</span>
          <el-button type="primary" size="mini" icon="el-icon-plus" @click="handleAdd">新增</el-button>
        </div>
        <el-tree
          ref="orgTree"
          :data="orgTree"
          :props="treeProps"
          node-key="orgId"
          :expand-on-click-node="false"
          :highlight-current="true"
          @node-click="handleNodeClick"
          v-loading="loading"
          class="org-tree"
        >
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span class="tree-label">{{ node.label }}</span>
            <span class="tree-status">
              <el-tag :type="data.orgStatus === 'A' ? 'success' : 'danger'" size="mini">
                {{ data.orgStatus === 'A' ? '有效' : '无效' }}
              </el-tag>
            </span>
          </span>
        </el-tree>
      </el-card>
    </div>

    <!-- 右侧详情面板 -->
    <div class="org-detail-panel">
      <el-card class="detail-card">
        <div v-if="!selectedOrg" class="no-selection">
          <i class="el-icon-info"></i>
          <p>请选择左侧机构查看详情</p>
        </div>
        <div v-else>
          <!-- 机构详情 -->
          <div class="org-detail">
            <div class="detail-header">
              <h3>{{ selectedOrg.orgName }}</h3>
              <div class="detail-actions">
                <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit">编辑</el-button>
                <el-button type="success" size="small" icon="el-icon-plus" @click="handleAddChild">添加子机构</el-button>
                <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete">删除</el-button>
              </div>
            </div>
            
            <el-divider></el-divider>
            
            <div class="detail-content">
              <div class="detail-item">
                <label>机构ID：</label>
                <span>{{ selectedOrg.orgId }}</span>
              </div>
              
              <div class="detail-item">
                <label>机构名称：</label>
                <span>{{ selectedOrg.orgName }}</span>
              </div>
              
              <div class="detail-item">
                <label>上级机构：</label>
                <span>{{ selectedOrg.parentOrgName || '无' }}</span>
              </div>
              
              <div class="detail-item">
                <label>机构级次：</label>
                <el-tag size="small">{{ selectedOrg.orgLevel }}级</el-tag>
              </div>
              
              <div class="detail-item">
                <label>排序号：</label>
                <span>{{ selectedOrg.sortNo }}</span>
              </div>
              
              <div class="detail-item">
                <label>机构状态：</label>
                <el-tag :type="selectedOrg.orgStatus === 'A' ? 'success' : 'danger'" size="small">
                  {{ selectedOrg.orgStatus === 'A' ? '有效' : '无效' }}
                </el-tag>
              </div>
              
              <div class="detail-item">
                <label>备注：</label>
                <span>{{ selectedOrg.remark || '无' }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑机构对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="500px" @close="resetForm">
      <el-form ref="orgFormRef" :model="orgForm" :rules="rules" label-width="100px">
        <el-form-item label="上级机构" v-if="isEdit || isAddChild">
          <el-input :value="parentOrgName" disabled />
        </el-form-item>
        <el-form-item label="机构名称" prop="orgName">
          <el-input v-model="orgForm.orgName" placeholder="请输入机构名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="机构级次" prop="orgLevel">
          <el-input-number v-model="orgForm.orgLevel" :min="1" :max="10" placeholder="请输入机构级次" disabled />
        </el-form-item>
        <el-form-item label="排序号" prop="sortNo">
          <el-input-number v-model="orgForm.sortNo" :min="1" :max="9999" placeholder="请输入排序号" />
        </el-form-item>
        <el-form-item label="机构状态" prop="orgStatus">
          <el-radio-group v-model="orgForm.orgStatus">
            <el-radio label="A">有效</el-radio>
            <el-radio label="B">无效</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="orgForm.remark" type="textarea" :rows="3" placeholder="请输入备注" maxlength="200" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitting">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import orgApi from '@/api/sys/org'

    export default {
  name: 'OrgManage',
  data() {
    return {
      loading: false,
      submitting: false,
      orgTree: [],
      selectedOrg: null,
      dialogVisible: false,
      isEdit: false,
      isAddChild: false,
      parentOrgName: '',
      treeProps: {
        children: 'children',
        label: 'orgName'
      },
      orgForm: {
        orgId: '',
        orgName: '',
        parentOrgId: '',
        orgLevel: 1,
        sortNo: 1,
        orgStatus: 'A',
        remark: ''
      },
      rules: {
        orgName: [
          { required: true, message: '请输入机构名称', trigger: 'blur' },
          { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
        ],
        orgLevel: [
          { required: true, message: '请输入机构级次', trigger: 'blur' }
        ],
        sortNo: [
          { required: true, message: '请输入排序号', trigger: 'blur' }
        ],
        orgStatus: [
          { required: true, message: '请选择机构状态', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      if (this.isAddChild) return '新增子机构'
      return this.isEdit ? '编辑机构' : '新增一级机构'
    }
  },
  created() {
    this.getOrgList()
  },
  methods: {
    // 获取机构列表
    async getOrgList() {
      this.loading = true
      try {
        const response = await orgApi.getOrgTree()
        this.orgTree = response.data || []
      } catch (error) {
        this.$message.error('获取机构列表失败')
        this.orgTree = []
      } finally {
        this.loading = false
      }
    },

    // 树节点点击事件
    handleNodeClick(data, node) {
      this.selectedOrg = data
    },

    // 新增机构
    handleAdd() {
      this.isEdit = false
      this.isAddChild = false
      this.parentOrgName = ''
      this.dialogVisible = true
      this.resetForm()
    },

    // 添加子机构
    handleAddChild() {
      if (!this.selectedOrg) {
        this.$message.warning('请先选择要添加子机构的机构')
        return
      }
      
      this.isEdit = false
      this.isAddChild = true
      this.parentOrgName = this.selectedOrg.orgName
      this.dialogVisible = true
      this.resetForm()
      
      // 在resetForm之后重新设置子机构的相关数据
      this.$nextTick(() => {
        this.orgForm.parentOrgId = this.selectedOrg.orgId
        this.orgForm.orgLevel = this.selectedOrg.orgLevel + 1
      })
    },

    // 编辑机构
    handleEdit() {
      if (!this.selectedOrg) {
        this.$message.warning('请先选择要编辑的机构')
        return
      }
      
      this.isEdit = true
      this.isAddChild = false
      this.parentOrgName = '' // 先清空，让loadOrgData方法设置正确的值
      this.dialogVisible = true
      this.loadOrgData()
    },

    // 删除机构
    handleDelete() {
      if (!this.selectedOrg) {
        this.$message.warning('请先选择要删除的机构')
        return
      }

      // 检查是否有子机构
      if (this.hasChildren(this.selectedOrg)) {
        this.$message.warning('该机构下存在子机构，无法删除')
        return
      }

      this.$confirm(`确认删除机构【${this.selectedOrg.orgName}】？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await orgApi.deleteOrg(this.selectedOrg.orgId)
          this.$message.success('删除成功')
          this.selectedOrg = null
          this.getOrgList()
        } catch (error) {
          this.$message.error('删除失败')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 检查是否有子机构
    hasChildren(row) {
      return row.children && row.children.length > 0
    },

    // 加载机构数据
    loadOrgData() {
      if (this.selectedOrg) {
        this.orgForm = {
          orgId: this.selectedOrg.orgId,
          orgName: this.selectedOrg.orgName,
          parentOrgId: this.selectedOrg.parentOrgId || '',
          orgLevel: this.selectedOrg.orgLevel,
          sortNo: this.selectedOrg.sortNo,
          orgStatus: this.selectedOrg.orgStatus,
          remark: this.selectedOrg.remark || ''
        }
        
        // 如果是编辑且有上级机构，设置上级机构名称
        if (this.isEdit && this.selectedOrg.parentOrgId) {
          this.parentOrgName = this.findParentOrgName(this.selectedOrg.parentOrgId)
        }
      }
    },

    // 根据parentOrgId查找上级机构名称
    findParentOrgName(parentOrgId) {
      const findInTree = (nodes) => {
        for (const node of nodes) {
          if (node.orgId === parentOrgId) {
            return node.orgName
          }
          if (node.children && node.children.length > 0) {
            const result = findInTree(node.children)
            if (result) return result
          }
        }
        return null
      }
      
      return findInTree(this.orgTree) || '未知机构'
    },

    // 重置表单
    resetForm() {
      this.$nextTick(() => {
        if (this.$refs.orgFormRef) {
          this.$refs.orgFormRef.resetFields()
        }
        if (!this.isEdit && !this.isAddChild) {
          // 新增一级机构时重置为默认值
          this.orgForm = {
            orgId: '',
            orgName: '',
            parentOrgId: '',
            orgLevel: 1,
            sortNo: 1,
            orgStatus: 'A',
            remark: ''
          }
        } else if (this.isAddChild) {
          // 新增子机构时，保持已设置的值，只清空需要清空的字段
          this.orgForm = {
            ...this.orgForm,
            orgId: '',
            orgName: '',
            remark: ''
          }
        }
      })
    },

    // 提交表单
    submitForm() {
      this.$refs.orgFormRef.validate(async (valid) => {
        if (!valid) return

        this.submitting = true
        try {
          const payload = { ...this.orgForm }
          
          if (this.isEdit) {
            await orgApi.updateOrg(payload)
            this.$message.success('编辑成功')
          } else {
            await orgApi.createOrg(payload)
            this.$message.success('新增成功')
          }
          
          this.dialogVisible = false
          this.getOrgList()
        } catch (error) {
          this.$message.error(this.isEdit ? '编辑失败' : '新增失败')
        } finally {
          this.submitting = false
        }
      })
    }
  }
    }
</script>

<style scoped>
.org-container {
  display: flex;
  height: calc(100vh - 120px);
  gap: 16px;
  padding: 16px;
}

.org-tree-panel {
  flex: 1;
  min-width: 0;
}

.org-detail-panel {
  flex: 1;
  min-width: 0;
}

.tree-card,
.detail-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-card .el-card__body {
  flex: 1;
  padding: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail-card .el-card__body {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.org-tree {
  height: calc(100vh - 250px);
  min-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
}

.custom-tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-right: 8px;
}

.tree-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-status {
  margin-left: 8px;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

.no-selection i {
  font-size: 48px;
  margin-bottom: 16px;
}

.org-detail {
  height: 100%;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.detail-actions {
  display: flex;
  gap: 8px;
}

.detail-content {
  padding: 16px 0;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.detail-item label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
  margin-right: 8px;
}

.detail-item span {
  color: #303133;
  flex: 1;
}

/* 树形组件样式优化 */
.org-tree .el-tree-node__content {
  height: 36px;
  line-height: 36px;
}

.org-tree .el-tree-node__content:hover {
  background-color: #f5f7fa;
}

.org-tree .el-tree-node.is-current > .el-tree-node__content {
  background-color: #e6f7ff;
  color: #1890ff;
}

/* 滚动条样式优化 */
.org-tree::-webkit-scrollbar,
.tree-card .el-card__body::-webkit-scrollbar {
  width: 6px;
}

.org-tree::-webkit-scrollbar-track,
.tree-card .el-card__body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.org-tree::-webkit-scrollbar-thumb,
.tree-card .el-card__body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.org-tree::-webkit-scrollbar-thumb:hover,
.tree-card .el-card__body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .org-container {
    flex-direction: column;
    height: auto;
  }
  
  .org-tree-panel {
    width: 100%;
    height: 300px;
  }
  
  .org-detail-panel {
    height: auto;
  }
}
</style>