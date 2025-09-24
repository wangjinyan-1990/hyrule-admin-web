<template>
  <div class="test-directory-container">
    <el-row :gutter="20">
      <!-- 左侧目录树 -->
      <el-col :span="16">
        <el-card>
          <div slot="header" class="clearfix">
            <span class="page-title">
              <i class="el-icon-folder"></i>
              测试目录
            </span>
          </div>

          <!-- 目录树选择器 -->
          <DirectoryTreeSelect
            ref="directoryTreeSelect"
            @node-select="handleNodeSelect"
            @add-directory="handleAddDirectory"
            @edit-directory="handleEditDirectory"
            @delete-directory="handleDeleteDirectory"
          />
        </el-card>
      </el-col>

      <!-- 右侧内容区域 -->
      <el-col :span="8">
        <el-card>
          <div slot="header" class="clearfix">
            <span class="page-title">
              <i class="el-icon-document"></i>
              目录详情
            </span>
          </div>

          <!-- 当前选中节点信息 -->
          <div v-if="currentNode" class="node-info">
            <div class="info-item">
              <span class="info-label">目录名称：</span>
              <span class="info-value">{{ currentNode.directoryName }}</span>
            </div>
            <div class="info-item" v-if="currentNode.parentDirectoryName">
              <span class="info-label">父目录：</span>
              <span class="info-value">{{ currentNode.parentDirectoryName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">层级：</span>
              <span class="info-value">{{ currentNode.level || 0 }}</span>
            </div>
            <div class="info-item" v-if="currentNode.fullPath">
              <span class="info-label">完整路径：</span>
              <span class="info-value">{{ currentNode.fullPath }}</span>
            </div>
            <div class="info-item" v-if="currentNode.firstPath">
              <span class="info-label">第一级路径：</span>
              <span class="info-value">{{ currentNode.firstPath }}</span>
            </div>
            <div class="info-item" v-if="currentNode.secondPath">
              <span class="info-label">第二级路径：</span>
              <span class="info-value">{{ currentNode.secondPath }}</span>
            </div>
            <div class="info-item" v-if="currentNode.thirdPath">
              <span class="info-label">第三级路径：</span>
              <span class="info-value">{{ currentNode.thirdPath }}</span>
            </div>
            <div class="info-item" v-if="currentNode.isUseTestcase !== null">
              <span class="info-label">用例库是否使用：</span>
              <el-tag :type="currentNode.isUseTestcase === '1' ? 'success' : 'info'">
                {{ currentNode.isUseTestcase === '1' ? '是' : '否' }}
              </el-tag>
            </div>
            <div class="info-item" v-if="currentNode.isUseTestset !== null">
              <span class="info-label">测试集是否使用：</span>
              <el-tag :type="currentNode.isUseTestset === '1' ? 'success' : 'info'">
                {{ currentNode.isUseTestset === '1' ? '是' : '否' }}
              </el-tag>
            </div>
            <div class="info-item" v-if="currentNode.createTime">
              <span class="info-label">创建时间：</span>
              <span class="info-value">{{ currentNode.createTime }}</span>
            </div>
          </div>

          <!-- 未选择节点时的提示 -->
          <div v-else class="no-selection">
            <div class="empty-state">
              <i class="el-icon-info" style="font-size: 48px; color: #c0c4cc; margin-bottom: 16px;"></i>
              <p style="color: #909399; font-size: 14px;">请选择左侧目录节点查看详情</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 新增/编辑目录对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      @close="resetForm">
      <el-form
        ref="directoryForm"
        :model="directoryForm"
        :rules="directoryRules"
        label-width="100px">
        <el-form-item label="目录名称" prop="directoryName">
          <el-input v-model="directoryForm.directoryName" placeholder="请输入目录名称"></el-input>
        </el-form-item>
        <el-form-item label="父目录" v-if="!isEdit">
          <el-input v-model="directoryForm.parentDirectoryName" placeholder="父目录名称" disabled></el-input>
        </el-form-item>
        <el-form-item label="用例库是否使用">
          <div style="display: flex; align-items: center; gap: 20px;">
            <el-switch v-model="directoryForm.isUseTestcase"></el-switch>
            <span style="font-size: 12px; color: #606266;">测试集是否使用：</span>
            <el-switch v-model="directoryForm.isUseTestset"></el-switch>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import testDirectoryApi from '@/api/test/baseManage/testDirectory'
import DirectoryTreeSelect from './components/DirectoryTreeSelect.vue'

export default {
  name: 'TestDirectory',
  components: {
    DirectoryTreeSelect
  },
  data() {
    return {
      selectedNodeId: '', // 选中的节点ID
      currentNode: null,
      loading: false,
      // 对话框相关
      dialogVisible: false,
      dialogTitle: '新增目录',
      isEdit: false,
      directoryForm: {
        directoryId: null,
        directoryName: '',
        systemId: '',
        directoryParentId: '',
        parentDirectoryName: '',
        directoryType: '',
        level: 0,
        isUseTestcase: true,
        isUseTestset: true
      },
      directoryRules: {
        directoryName: [
          { required: true, message: '请输入目录名称', trigger: 'blur' }
        ],
        systemId: [
          { required: true, message: '请输入系统ID', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 不再需要加载目录数据，由DirectoryTreeSelect组件自己处理
  },
  methods: {
    // 处理节点选择
    handleNodeSelect(data) {
      
      // 设置当前节点，并查找父目录信息
      this.currentNode = {
        ...data,
        parentDirectoryName: this.findParentDirectoryName(data)
      }
    },

    // 查找父目录名称
    findParentDirectoryName(nodeData) {
      if (!nodeData || !nodeData.directoryParentId) {
        return ''
      }
      
      // 从DirectoryTreeSelect组件的树数据中查找父目录
      const treeSelect = this.$refs.directoryTreeSelect
      if (treeSelect && treeSelect.treeData) {
        const parentNode = this.findNodeById(treeSelect.treeData, nodeData.directoryParentId)
        return parentNode ? parentNode.directoryName : ''
      }
      
      return ''
    },

    // 根据ID查找节点
    findNodeById(nodes, targetId) {
      for (const node of nodes) {
        if (node.directoryId === targetId) {
          return node
        }
        if (node.children && node.children.length > 0) {
          const found = this.findNodeById(node.children, targetId)
          if (found) return found
        }
      }
      return null
    },

    // 加载目录数据
    async loadDirectoryData() {
      try {
        this.loading = true

        // 获取当前用户ID，从store中获取
        const userId = this.$store.getters.userId

        const response = await testDirectoryApi.getSystemsByUserId(userId)

        if (response.code === 20000) {
          const rawData = response.data?.rows || []

          // 构建树形数据
          this.directoryTreeData = this.buildTreeData(rawData)
        } else {
          this.$message.error(response.message || '获取测试目录失败')
        }
      } catch (error) {
        this.$message.error('获取测试目录失败，请检查网络连接')
      } finally {
        this.loading = false
      }
    },

    // 构建树形数据
    buildTreeData(rawData) {
      // 根据数据结构，第一层显示directoryName
      // 这里可以根据实
      // 际需求构建更复杂的树形结构
      return rawData.map(item => {
        return {
          ...item,
          // 确保directoryId存在
          directoryId: item.directoryId,
          children: [], // 初始化子节点数组
          isLeaf: false // 默认不是叶子节点，可以展开
        }
      })
    },

    // 处理节点点击
    async handleNodeClick(data, node) {
      this.currentNode = data
      // 如果节点还没有子节点，则查询子目录
      if (!data.children || data.children.length === 0) {
        await this.loadChildrenDirectories(data, node)
      }
    },

    // 加载子目录
    async loadChildrenDirectories(parentData, parentNode) {
      try {

        // 使用父目录的directoryId作为directoryParentId，systemId保持不变
        const response = await testDirectoryApi.getChildrenByParentId(
          parentData.directoryId,
          parentData.systemId
        )

        if (response.code === 20000 && response.data && response.data.rows) {
          const children = response.data.rows.map(item => {
            return {
              ...item,
              directoryId: item.directoryId,
              children: [], // 初始化子节点数组
              isLeaf: false // 默认不是叶子节点，可以展开
            }
          })

          // 更新父节点的子节点数据
          this.$set(parentData, 'children', children)

          // 展开当前节点
          this.$nextTick(() => {
            try {
              const tree = this.$refs.directoryTree
              if (tree) {
                // 尝试多种方法展开节点
                const nodeId = parentData.directoryId
                const parentNodeId = parentNode.id


                // 方法1：使用parentNode.id（Element UI内部使用的ID）
                if (tree.store && tree.store.nodesMap && tree.store.nodesMap[parentNodeId]) {
                  tree.store.nodesMap[parentNodeId].expanded = true
                  return
                }

                // 方法2：使用directoryId
                if (tree.store && tree.store.nodesMap && tree.store.nodesMap[nodeId]) {
                  tree.store.nodesMap[nodeId].expanded = true
                  return
                }

                // 方法3：使用Element UI的setExpandedKeys方法
                if (typeof tree.setExpandedKeys === 'function') {
                  tree.setExpandedKeys([parentNodeId])
                  return
                }

              }
            } catch (error) {
            }
          })
        } else {
        }
      } catch (error) {
        this.$message.error('加载子目录失败，请重试')
      }
    },

    // 获取节点图标
    getNodeIcon(data) {
      if (data.directoryType === 'root') {
        return 'el-icon-folder-opened'
      } else if (data.directoryType === 'folder') {
        return 'el-icon-folder'
      } else {
        return 'el-icon-document'
      }
    },

    // 获取目录类型文本
    getDirectoryTypeText(type) {
      const typeMap = {
        'root': '根目录',
        'folder': '文件夹',
        'file': '文件'
      }
      return typeMap[type] || '未知'
    },

    // 获取目录类型标签样式
    getDirectoryTypeTag(type) {
      const tagMap = {
        'root': 'primary',
        'folder': 'success',
        'file': 'info'
      }
      return tagMap[type] || 'info'
    },

    // 新增目录
    handleAddDirectory(parentData) {
      this.isEdit = false
      this.dialogTitle = '新增目录'
      this.dialogVisible = true
      this.resetForm()

      // 设置父目录信息
      if (parentData) {
        this.directoryForm.systemId = parentData.systemId
        this.directoryForm.directoryParentId = parentData.directoryId
        this.directoryForm.parentDirectoryName = parentData.directoryName
        this.directoryForm.level = (parentData.level || 0) + 1
      }
    },

    // 编辑目录
    handleEditDirectory(data) {
      this.isEdit = true
      this.dialogTitle = '编辑目录'
      this.dialogVisible = true
      this.directoryForm = {
        directoryId: data.directoryId,
        directoryName: data.directoryName,
        systemId: data.systemId,
        directoryParentId: data.directoryParentId,
        parentDirectoryName: data.parentDirectoryName || '', // 添加父目录名称
        directoryType: data.directoryType,
        level: data.level || 0,
        // 处理开关状态：支持数字1/0、字符串"1"/"0"、布尔值true/false
        isUseTestcase: String(data.isUseTestcase) === "1" || data.isUseTestcase === true,
        isUseTestset: String(data.isUseTestset) === "1" || data.isUseTestset === true
      }
    },

    // 删除目录
    handleDeleteDirectory(data) {
      this.$confirm(`确定要删除目录"${data.directoryName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await testDirectoryApi.deleteDirectory(data.directoryId)
          this.$message.success('删除成功')
          this.loadDirectoryData() // 重新加载数据
        } catch (error) {
          this.$message.error('删除失败，请重试')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 提交表单
    async submitForm() {
      try {
        await this.$refs.directoryForm.validate()

        // 准备提交数据，将布尔值转换为数字
        const submitData = {
          ...this.directoryForm,
          isUseTestcase: this.directoryForm.isUseTestcase ? 1 : 0,
          isUseTestset: this.directoryForm.isUseTestset ? 1 : 0
        }

        if (this.isEdit) {
          // 编辑
          await testDirectoryApi.updateDirectory(submitData)
          this.$message.success('编辑成功')
        } else {
          // 新增
          await testDirectoryApi.createDirectory(submitData)
          this.$message.success('新增成功')
        }

        this.dialogVisible = false

        // 刷新树选择器组件
        if (this.$refs.directoryTreeSelect) {
          await this.$refs.directoryTreeSelect.refreshData()
          // 等待DOM更新
          await this.$nextTick()
          // 多次重试恢复状态
          setTimeout(() => {
            this.$refs.directoryTreeSelect.restoreExpandedState()
          }, 100)

          setTimeout(() => {
            this.$refs.directoryTreeSelect.restoreExpandedState()
          }, 300)

          setTimeout(() => {
            this.$refs.directoryTreeSelect.restoreExpandedState()
          }, 500)
        }
      } catch (error) {
        this.$message.error('操作失败，请重试')
      }
    },

    // 重置表单
    resetForm() {
      this.directoryForm = {
        directoryId: null,
        directoryName: '',
        systemId: '',
        directoryParentId: '',
        parentDirectoryName: '',
        directoryType: '',
        level: 0,
        isUseTestcase: true,
        isUseTestset: true
      }
      if (this.$refs.directoryForm) {
        this.$refs.directoryForm.clearValidate()
      }
    },

    // 获取当前展开的节点keys
    getExpandedKeys() {
      const tree = this.$refs.directoryTree
      if (tree && tree.store && tree.store.nodesMap) {
        const expandedKeys = []
        Object.keys(tree.store.nodesMap).forEach(key => {
          const node = tree.store.nodesMap[key]
          if (node && node.expanded) {
            expandedKeys.push(key)
          }
        })
        return expandedKeys
      }
      return []
    },

    // 设置展开的节点keys
    setExpandedKeys(expandedKeys) {
      const tree = this.$refs.directoryTree
      // console.log('setExpandedKeys - tree:', tree, 'expandedKeys:', expandedKeys)
      if (tree && tree.store && tree.store.nodesMap && expandedKeys.length > 0) {
        // console.log('当前nodesMap中的所有keys:', Object.keys(tree.store.nodesMap))
        expandedKeys.forEach(key => {
          const node = tree.store.nodesMap[key]
          if (node) {
            node.expanded = true
            // console.log('设置节点展开:', key, node)
          } else {
            // console.log('未找到节点:', key, '当前nodesMap keys:', Object.keys(tree.store.nodesMap))
          }
        })
      } else {
        // console.log('无法设置展开状态 - tree:', !!tree, 'store:', !!tree?.store, 'nodesMap:', !!tree?.store?.nodesMap, 'keys:', expandedKeys.length)
      }
    },

    // 恢复展开状态（使用Element UI原生方法）
    restoreExpandedState(expandedKeys) {
      const tree = this.$refs.directoryTree
      // console.log('restoreExpandedState - tree:', tree, 'expandedKeys:', expandedKeys)

      if (tree && expandedKeys.length > 0) {
        try {
          // 使用Element UI树组件的setExpandedKeys方法
          if (typeof tree.setExpandedKeys === 'function') {
            tree.setExpandedKeys(expandedKeys)
            // console.log('使用setExpandedKeys方法恢复展开状态成功')
          } else {
            // 降级方案：直接操作store
            // console.log('setExpandedKeys方法不存在，使用降级方案')
            this.setExpandedKeys(expandedKeys)
          }
        } catch (error) {
          // console.error('恢复展开状态失败:', error)
          // 降级方案：直接操作store
          this.setExpandedKeys(expandedKeys)
        }
      } else {
        // console.log('无法恢复展开状态 - tree:', !!tree, 'keys:', expandedKeys.length)
      }
    },

    // 强制展开节点（全新的实现方式）
    forceExpandNodes(expandedKeys) {
      const tree = this.$refs.directoryTree
      // console.log('forceExpandNodes - tree:', tree, 'expandedKeys:', expandedKeys)

      if (!tree || expandedKeys.length === 0) {
        // console.log('无法强制展开节点 - tree:', !!tree, 'keys:', expandedKeys.length)
        return
      }

      try {
        // 方法1：直接操作DOM元素
        expandedKeys.forEach(key => {
          // console.log('尝试DOM操作展开节点:', key)

          // 尝试多种DOM选择器
          let nodeElement = document.querySelector(`[data-key="${key}"]`)
          if (!nodeElement) {
            // 尝试通过node-id查找
            nodeElement = document.querySelector(`[node-id="${key}"]`)
          }
          if (!nodeElement) {
            // 尝试通过class查找包含该key的元素
            const allNodes = document.querySelectorAll('.el-tree-node')
            for (let node of allNodes) {
              if (node.getAttribute('data-key') === key ||
                  node.getAttribute('node-id') === key ||
                  node.textContent.includes(key)) {
                nodeElement = node
                break
              }
            }
          }

          if (nodeElement) {
            // console.log('找到节点元素:', nodeElement)
            const expandIcon = nodeElement.querySelector('.el-tree-node__expand-icon')
            if (expandIcon) {
              // console.log('找到展开图标:', expandIcon)
              if (!expandIcon.classList.contains('is-expanded')) {
                // console.log('通过DOM操作展开节点:', key)
                expandIcon.click()
              } else {
                // console.log('节点已经展开:', key)
              }
            } else {
              // console.log('未找到展开图标:', key)
            }
          } else {
            // console.log('未找到节点元素:', key)
          }
        })

        // 方法2：如果DOM方法失败，使用store方法
        setTimeout(() => {
          this.setExpandedKeys(expandedKeys)
        }, 50)

        // 方法3：强制重新渲染组件
        setTimeout(() => {
          // console.log('强制重新渲染组件')
          this.$forceUpdate()
          this.$nextTick(() => {
            // 再次尝试设置展开状态
            this.setExpandedKeys(expandedKeys)
          })
        }, 100)

        // 方法4：最后尝试使用defaultExpandedKeys
        setTimeout(() => {
          this.defaultExpandedKeys = expandedKeys
          // console.log('设置defaultExpandedKeys作为最后手段:', expandedKeys)

          // 再次强制更新
          this.$forceUpdate()
        }, 200)

        // 方法5：终极方案 - 重新创建树数据
        setTimeout(() => {
          // console.log('终极方案：重新创建树数据')
          const currentData = [...this.directoryTreeData]
          this.directoryTreeData = []
          this.$nextTick(() => {
            this.directoryTreeData = currentData
            this.$nextTick(() => {
              this.setExpandedKeys(expandedKeys)
            })
          })
        }, 300)

      } catch (error) {
        // console.error('强制展开节点失败:', error)
        // 最后的降级方案
        this.setExpandedKeys(expandedKeys)
      }
    }
  }
}
</script>

<style scoped>
.test-directory-container {
  padding: 20px;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.page-title i {
  margin-right: 8px;
  color: #409eff;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

/* 自定义树节点样式 */
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

/* 树节点图标样式 */
.tree-icon {
  margin-right: 5px !important;
  font-size: 14px;
}

/* 强制覆盖Element UI的默认样式 */
::v-deep .el-tree .custom-tree-node .tree-icon {
  margin-right: 5px !important;
  margin-left: 0 !important;
}

::v-deep .el-tree .custom-tree-node i {
  margin-right: 5px !important;
  margin-left: 0 !important;
}

/* 更具体的选择器，确保覆盖所有可能的样式 */
::v-deep .el-tree-node__content .custom-tree-node .tree-icon {
  margin-right: 5px !important;
  margin-left: 0 !important;
}

::v-deep .el-tree-node__content .custom-tree-node i {
  margin-right: 5px !important;
  margin-left: 0 !important;
}

/* 直接针对树节点内容 */
::v-deep .el-tree-node__content {
  padding-left: 8px !important;
  text-align: left !important;
  justify-content: flex-start !important;
}

::v-deep .el-tree-node__content .custom-tree-node {
  display: flex !important;
  align-items: center !important;
  text-align: left !important;
  justify-content: flex-start !important;
}

::v-deep .el-tree-node__content .custom-tree-node span {
  text-align: left !important;
  display: inline-block !important;
  font-size: 12px !important;
}

::v-deep .el-tree-node__content .custom-tree-node i {
  margin-right: 5px !important;
  margin-left: 0 !important;
  flex-shrink: 0 !important;
  padding: 0 !important;
  width: auto !important;
}

/* 针对Element UI图标的特殊处理 */
::v-deep .el-tree-node__content .custom-tree-node .el-icon-folder,
::v-deep .el-tree-node__content .custom-tree-node .el-icon-folder-opened {
  margin-right: 5px !important;
  margin-left: 0 !important;
  padding: 0 !important;
  width: auto !important;
  font-size: 14px !important;
}

/* 节点信息样式 */
.node-info {
  margin-top: 20px;
}

/* 表单标签样式 */
::v-deep .el-form-item__label {
  font-size: 12px !important;
  text-align: left !important;
  font-weight: normal !important;
}

/* 必填星号样式 */
::v-deep .el-form-item.is-required .el-form-item__label::before {
  content: '' !important;
}

::v-deep .el-form-item.is-required .el-form-item__label::after {
  content: ' *' !important;
  color: #f56c6c !important;
}

/* 未选择状态样式 */
.no-selection {
  text-align: center;
  padding: 40px 0;
}

/* 节点信息样式 */
.node-info {
  padding: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #606266;
  min-width: 120px;
  margin-right: 12px;
}

.info-value {
  color: #303133;
  flex: 1;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
}

/* 树形组件样式优化 */
::v-deep .el-tree {
  background-color: #fafafa;
}

::v-deep .el-tree-node__content {
  height: 40px;
  line-height: 40px;
}

::v-deep .el-tree-node__content:hover {
  background-color: #f5f7fa;
}

::v-deep .el-tree-node.is-current > .el-tree-node__content {
  background-color: #e6f7ff;
  color: #1890ff;
}

/* 卡片样式 */
::v-deep .el-card {
  height: 600px;
}

::v-deep .el-card__body {
  height: calc(100% - 60px);
  overflow-y: auto;
}
</style>
