<template>
  <div class="directory-tree-select">
    <div class="tree-content">
      <el-tree
        ref="directoryTree"
        :data="treeData"
        :props="treeProps"
        node-key="directoryId"
        :default-expand-all="false"
        :default-expanded-keys="defaultExpandedKeys"
        :expand-on-click-node="false"
        highlight-current
        @node-click="handleNodeClick">

        <span class="custom-tree-node" slot-scope="{ node, data }" :data-level="data.level" :style="{ paddingLeft: (8 + (data.level || 0) * 8) + 'px' }" style="display: flex; align-items: center; text-align: left; width: 100%; justify-content: space-between;">
          <div style="display: flex; align-items: center; flex: 1;">
            <i :class="getNodeIcon(data)" class="tree-icon" :key="`icon-${data.directoryId}-${iconUpdateKey}`" style="margin-right: 2px !important; margin-left: 0 !important; flex-shrink: 0; padding: 0 !important; width: auto !important;"></i>
            <span style="margin-left: 0; padding-left: 0; text-align: left; display: inline-block; font-size: 12px;">{{ node.label }}</span>
          </div>
          <div style="display: flex; align-items: center; margin-left: auto;">
            <el-button
              type="text"
              size="mini"
              @click.stop="handleAddDirectory(data)"
              style="padding: 0 5px;">
              <i class="el-icon-plus"></i>
            </el-button>
            <el-button
              v-if="data.directoryType !== 'root'"
              type="text"
              size="mini"
              @click.stop="handleEditDirectory(data)"
              style="padding: 0 5px;">
              <i class="el-icon-edit"></i>
            </el-button>
            <el-button
              v-if="data.directoryType !== 'root'"
              type="text"
              size="mini"
              @click.stop="handleDeleteDirectory(data)"
              style="padding: 0 5px; color: #f56c6c;">
              <i class="el-icon-delete"></i>
            </el-button>
          </div>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import testDirectoryApi from '@/api/test/baseManage/testDirectory'

export default {
  name: 'DirectoryTreeSelect',
  data() {
    return {
      treeData: [],
      treeProps: {
        children: 'children',
        label: 'directoryName'
      },
      expandedKeys: [], // 保存展开的节点keys
      selectedKey: '', // 保存选中的节点key
      defaultExpandedKeys: [], // 默认展开的节点keys
      iconUpdateKey: 0 // 用于强制更新图标
    }
  },
  created() {
    this.loadRootDirectories()
  },
  methods: {
    async loadRootDirectories() {
      try {
        const userId = this.$store.getters.userId || 'admin'
        const response = await testDirectoryApi.getSystemsByUserId(userId)
        
        if (response.code === 20000 && response.data?.rows) {
          this.treeData = response.data.rows.map(item => ({
            directoryId: item.directoryId,
            directoryName: item.directoryName,
            directoryType: item.directoryType,
            systemId: item.systemId,
            directoryParentId: item.directoryParentId,
            level: item.level || 0,
            isUseTestcase: item.isUseTestcase,
            isUseTestset: item.isUseTestset,
            children: []
          }))
          
          // 设置节点缩进样式
          this.$nextTick(() => {
            this.setNodeIndentation()
          })
        }
      } catch (error) {
        console.error('加载根目录失败:', error)
      }
    },

    async loadChildrenDirectories(parentData) {
      try {
        console.log('开始加载子目录，父节点:', parentData)
        const response = await testDirectoryApi.getChildrenByParentId(
          parentData.directoryId,
          parentData.systemId
        )
        
        console.log('子目录API响应:', response)
        
        if (response.code === 20000 && response.data?.rows) {
          const children = response.data.rows.map(item => ({
            directoryId: item.directoryId,
            directoryName: item.directoryName,
            directoryType: item.directoryType,
            systemId: item.systemId,
            directoryParentId: item.directoryParentId,
            level: item.level || (parentData.level + 1),
            isUseTestcase: item.isUseTestcase,
            isUseTestset: item.isUseTestset,
            children: []
          }))
          
          console.log('处理后的子目录数据:', children)
          
            // 使用Vue.set确保响应式更新
            this.$set(parentData, 'children', children)
            
            // 更新图标更新key以强制重新渲染图标
            this.iconUpdateKey++
            
            // 强制触发响应式更新
            this.$forceUpdate()
          
          // 强制更新树组件
          this.$forceUpdate()
          
          // 等待DOM更新后，尝试展开父节点
          await this.$nextTick()
          this.expandParentNode(parentData.directoryId)
          
          // 设置节点缩进样式
          this.setNodeIndentation()
          
          // 强制更新图标显示
          this.$forceUpdate()
          
          return children
        } else {
          console.log('没有找到子目录数据')
          return []
        }
      } catch (error) {
        console.error('加载子目录失败:', error)
        return []
      }
    },

    // 展开父节点
    expandParentNode(nodeId) {
      const tree = this.$refs.directoryTree
      if (tree && tree.store && tree.store.nodesMap && tree.store.nodesMap[nodeId]) {
        console.log('尝试展开父节点:', nodeId)
        tree.store.nodesMap[nodeId].expanded = true
        this.$forceUpdate()
      }
    },

    async handleNodeClick(data, node) {
      console.log('点击节点:', data, node)
      console.log('节点子节点数量:', node.childNodes.length)
      this.$emit('node-select', data)
      
      // 保存当前选中的节点
      this.selectedKey = data.directoryId
      
      // 如果节点没有子节点，尝试加载子目录
      if (node.childNodes.length === 0) {
        console.log('节点没有子节点，尝试加载子目录...')
        try {
          const children = await this.loadChildrenDirectories(data)
          if (children.length > 0) {
            console.log('成功加载子目录:', children)
               // 强制更新树组件
               this.$forceUpdate()
               
               // 等待DOM更新后，强制展开节点
               await this.$nextTick()
               setTimeout(() => {
                 this.forceExpandNode(data.directoryId)
                 // 再次强制更新以确保图标正确显示
                 this.$forceUpdate()
               }, 100)
          } else {
            console.log('该节点没有子目录')
          }
        } catch (error) {
          console.error('加载子目录失败:', error)
        }
      } else {
        console.log('节点已有子节点，无需加载')
        // 如果已有子节点，确保节点是展开的
        if (!node.expanded) {
          this.forceExpandNode(data.directoryId)
        }
      }
    },

    // 强制展开节点
    forceExpandNode(nodeId) {
      const tree = this.$refs.directoryTree
      if (tree && tree.store && tree.store.nodesMap && tree.store.nodesMap[nodeId]) {
        console.log('强制展开节点:', nodeId)
        tree.store.nodesMap[nodeId].expanded = true
        this.$forceUpdate()
      }
    },

    // 设置节点缩进样式
    setNodeIndentation() {
      this.$nextTick(() => {
        const tree = this.$refs.directoryTree
        if (tree && tree.$el) {
          // 直接通过CSS选择器设置缩进
          const nodes = tree.$el.querySelectorAll('.custom-tree-node[data-level]')
          console.log('找到节点数量:', nodes.length)
          
          nodes.forEach((node, index) => {
            const level = parseInt(node.getAttribute('data-level')) || 0
            const treeNode = node.closest('.el-tree-node')
            const content = treeNode ? treeNode.querySelector('.el-tree-node__content') : null
            const expandIcon = treeNode ? treeNode.querySelector('.el-tree-node__expand-icon') : null
            
            console.log(`节点${index}:`, {
              level: level,
              treeNode: !!treeNode,
              content: !!content,
              expandIcon: !!expandIcon,
              nodeText: node.textContent?.trim()
            })
            
            if (content) {
              // 设置缩进：基础8px + 层级 * 8px
              const paddingLeft = 8 + level * 8
              
              // 强制设置样式，使用!important
              content.style.setProperty('padding-left', `${paddingLeft}px`, 'important')
              content.style.setProperty('margin-left', '0px', 'important')
              content.style.setProperty('text-indent', '0px', 'important')
              
              // 同时设置父容器的样式
              if (treeNode) {
                treeNode.style.setProperty('padding-left', '0px', 'important')
                treeNode.style.setProperty('margin-left', '0px', 'important')
              }
              
              // 设置展开图标位置：在文件夹图标左侧4px
              if (expandIcon) {
                // 展开图标应该在文件夹图标左侧4px
                // 文件夹图标位置 = paddingLeft，展开图标位置 = paddingLeft - 16px(图标宽度) - 4px(间距)
                const expandIconLeft = Math.max(0, paddingLeft - 20)
                expandIcon.style.setProperty('left', `${expandIconLeft}px`, 'important')
                expandIcon.style.setProperty('position', 'absolute', 'important')
                expandIcon.style.setProperty('top', '50%', 'important')
                expandIcon.style.setProperty('transform', 'translateY(-50%)', 'important')
                expandIcon.style.setProperty('z-index', '10', 'important')
                expandIcon.style.setProperty('width', '16px', 'important')
                expandIcon.style.setProperty('height', '16px', 'important')
                expandIcon.style.setProperty('display', 'flex', 'important')
                expandIcon.style.setProperty('align-items', 'center', 'important')
                expandIcon.style.setProperty('justify-content', 'center', 'important')
                console.log(`✅ 设置展开图标位置: ${expandIconLeft}px (层级${level}, paddingLeft: ${paddingLeft})`)
              }
              
              console.log(`✅ 设置节点层级${level}缩进${paddingLeft}px`, content.style.paddingLeft)
            } else {
              console.log(`❌ 未找到content元素`)
            }
          })
        }
      })
    },

    // 获取节点层级
    getNodeLevel(node) {
      let level = 0
      let current = node
      
      // 向上查找父级节点，计算层级
      while (current && current.parentElement) {
        current = current.parentElement
        // 检查是否是树节点容器
        if (current.classList && current.classList.contains('el-tree-node')) {
          level++
        }
        // 如果到达了树的根容器，停止查找
        if (current.classList && current.classList.contains('el-tree')) {
          break
        }
      }
      
      console.log('计算节点层级:', level, node)
      return level
    },

    handleAddDirectory(data) {
      this.$emit('add-directory', data)
    },

    handleEditDirectory(data) {
      this.$emit('edit-directory', data)
    },

    handleDeleteDirectory(data) {
      this.$emit('delete-directory', data)
    },

    getNodeIcon(data) {
      if (data.directoryType === 'root') {
        return 'el-icon-folder-opened'
      } else {
        // 有子目录的使用实心文件夹图标，没有子目录的使用空心文件夹图标
        // 检查children数组是否存在且长度大于0
        const hasChildren = data.children && Array.isArray(data.children) && data.children.length > 0
        console.log(`节点 ${data.directoryName} 的子目录检查:`, {
          hasChildren: hasChildren,
          children: data.children,
          childrenLength: data.children ? data.children.length : 0
        })
        return hasChildren ? 'el-icon-folder-opened' : 'el-icon-folder'
      }
    },

    async refreshData() {
      console.log('=== 开始刷新数据 ===')
      
      // 保存当前展开状态
      this.saveExpandedState()
      console.log('保存的展开状态:', this.expandedKeys)
      console.log('保存的选中状态:', this.selectedKey)
      
      // 设置默认展开的keys
      this.defaultExpandedKeys = [...this.expandedKeys]
      console.log('设置defaultExpandedKeys:', this.defaultExpandedKeys)
      
      // 完全重新加载数据
      await this.loadRootDirectories()
      console.log('根目录数据重新加载完成')
      
      // 重新加载所有展开节点的子目录
      await this.reloadExpandedChildren()
      console.log('子目录数据重新加载完成')
      
      // 强制重新渲染树组件
      const newData = [...this.treeData]
      this.treeData = []
      await this.$nextTick()
      this.treeData = newData
      await this.$nextTick()
      
      // 恢复展开状态
      console.log('DOM更新完成，开始恢复状态')
      this.restoreExpandedState()
      
      console.log('=== 数据刷新完成 ===')
    },

    // 重新加载所有展开节点的子目录
    async reloadExpandedChildren() {
      if (this.expandedKeys.length === 0) {
        return
      }
      
      console.log('开始重新加载展开节点的子目录:', this.expandedKeys)
      
      for (const key of this.expandedKeys) {
        const node = this.findNodeByKey(this.treeData, key)
        if (node && node.directoryId) {
          console.log('重新加载节点子目录:', key, node.directoryName)
          await this.loadChildrenDirectories(node)
        }
      }
    },

    // 根据key查找节点
    findNodeByKey(nodes, key) {
      for (const node of nodes) {
        if (node.directoryId === key) {
          return node
        }
        if (node.children && node.children.length > 0) {
          const found = this.findNodeByKey(node.children, key)
          if (found) {
            return found
          }
        }
      }
      return null
    },

    // 保存展开状态
    saveExpandedState() {
      const tree = this.$refs.directoryTree
      if (tree && tree.store && tree.store.nodesMap) {
        // 手动收集展开的节点keys
        this.expandedKeys = []
        Object.keys(tree.store.nodesMap).forEach(key => {
          const node = tree.store.nodesMap[key]
          if (node && node.expanded) {
            this.expandedKeys.push(key)
          }
        })
        console.log('保存展开状态:', this.expandedKeys)
      }
    },

    // 恢复展开状态
    restoreExpandedState() {
      const tree = this.$refs.directoryTree
      console.log('恢复展开状态 - tree:', !!tree, 'expandedKeys:', this.expandedKeys)
      
      if (tree && this.expandedKeys.length > 0) {
        console.log('开始恢复展开状态:', this.expandedKeys)
        
        // 使用setExpandedKeys方法
        if (typeof tree.setExpandedKeys === 'function') {
          console.log('使用setExpandedKeys方法')
          tree.setExpandedKeys(this.expandedKeys)
        } else {
          console.log('使用降级方案：直接操作节点状态')
          // 降级方案：直接操作节点状态
          this.expandedKeys.forEach(key => {
            if (tree.store && tree.store.nodesMap && tree.store.nodesMap[key]) {
              console.log('设置节点展开:', key)
              tree.store.nodesMap[key].expanded = true
            } else {
              console.log('节点不存在或store不可用:', key)
            }
          })
        }
        
        // 恢复选中状态
        if (this.selectedKey && typeof tree.setCurrentKey === 'function') {
          console.log('恢复选中状态:', this.selectedKey)
          tree.setCurrentKey(this.selectedKey)
        }
        
        // 延迟重试恢复状态
        setTimeout(() => {
          this.retryRestoreState()
        }, 200)
      } else {
        console.log('无法恢复状态 - tree:', !!tree, 'expandedKeys长度:', this.expandedKeys.length)
      }
    },

    // 重试恢复状态
    retryRestoreState() {
      const tree = this.$refs.directoryTree
      if (tree && this.expandedKeys.length > 0) {
        console.log('重试恢复展开状态:', this.expandedKeys)
        
        // 强制设置展开状态
        this.expandedKeys.forEach(key => {
          if (tree.store && tree.store.nodesMap && tree.store.nodesMap[key]) {
            tree.store.nodesMap[key].expanded = true
            console.log('重试设置节点展开:', key)
          }
        })
        
        // 强制更新
        this.$forceUpdate()
      }
    },

    // 展开指定节点
    expandNode(nodeId) {
      const tree = this.$refs.directoryTree
      if (tree && typeof tree.setExpandedKeys === 'function') {
        tree.setExpandedKeys([nodeId])
      }
    },

    // 获取所有展开的节点
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

    // 设置展开的节点
    setExpandedKeys(keys) {
      const tree = this.$refs.directoryTree
      if (tree && typeof tree.setExpandedKeys === 'function') {
        tree.setExpandedKeys(keys)
      }
    }
  }
}
</script>

<style scoped>
.directory-tree-select {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tree-content {
  flex: 1;
  padding: 15px;
  overflow: auto;
}

/* 自定义树节点样式 */
.custom-tree-node {
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
  justify-content: space-between;
}

.tree-icon {
  margin-right: 2px !important;
  margin-left: 0 !important;
  flex-shrink: 0;
  padding: 0 !important;
  width: auto !important;
}

/* Element UI树组件样式覆盖 */
::v-deep .el-tree-node__content {
  text-align: left !important;
  justify-content: flex-start !important;
}

::v-deep .el-tree-node__content .custom-tree-node {
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
  justify-content: space-between;
}

::v-deep .el-tree-node__content .custom-tree-node span {
  margin-left: 0;
  padding-left: 0;
  text-align: left;
  display: inline-block;
  font-size: 12px;
}

/* 层级缩进样式 - 阶梯式展示 */
/* 重置Element UI默认样式 */
::v-deep .el-tree-node__content {
  padding-left: 8px !important;
  margin-left: 0 !important;
  text-indent: 0 !important;
}

/* 强制重置所有树节点样式 */
::v-deep .el-tree-node {
  padding-left: 0 !important;
  margin-left: 0 !important;
}

/* 第1层 - 根目录 */
::v-deep .el-tree-node[data-level="0"] .el-tree-node__content {
  padding-left: 8px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="0"] {
  padding-left: 8px !important;
  margin-left: 0 !important;
}

/* 第2层 - 子目录 */
::v-deep .el-tree-node[data-level="1"] .el-tree-node__content {
  padding-left: 16px !important; /* 8px + 8px */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="1"] {
  padding-left: 16px !important;
  margin-left: 0 !important;
}

/* 第3层 - 孙目录 */
::v-deep .el-tree-node[data-level="2"] .el-tree-node__content {
  padding-left: 24px !important; /* 8px + 8px + 8px */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="2"] {
  padding-left: 24px !important;
  margin-left: 0 !important;
}

/* 第4层 */
::v-deep .el-tree-node[data-level="3"] .el-tree-node__content {
  padding-left: 32px !important; /* 8px + 8px + 8px + 8px */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="3"] {
  padding-left: 32px !important;
  margin-left: 0 !important;
}

/* 第5层 */
::v-deep .el-tree-node[data-level="4"] .el-tree-node__content {
  padding-left: 40px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="4"] {
  padding-left: 40px !important;
  margin-left: 0 !important;
}

/* 第6层 */
::v-deep .el-tree-node[data-level="5"] .el-tree-node__content {
  padding-left: 48px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="5"] {
  padding-left: 48px !important;
  margin-left: 0 !important;
}

/* 第7层 */
::v-deep .el-tree-node[data-level="6"] .el-tree-node__content {
  padding-left: 56px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="6"] {
  padding-left: 56px !important;
  margin-left: 0 !important;
}

/* 第8层 */
::v-deep .el-tree-node[data-level="7"] .el-tree-node__content {
  padding-left: 64px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="7"] {
  padding-left: 64px !important;
  margin-left: 0 !important;
}

/* 第9层 */
::v-deep .el-tree-node[data-level="8"] .el-tree-node__content {
  padding-left: 72px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="8"] {
  padding-left: 72px !important;
  margin-left: 0 !important;
}

/* 第10层 */
::v-deep .el-tree-node[data-level="9"] .el-tree-node__content {
  padding-left: 80px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="9"] {
  padding-left: 80px !important;
  margin-left: 0 !important;
}

/* 确保展开/收起图标位置正确 */
::v-deep .el-tree-node__expand-icon {
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  z-index: 10 !important;
  width: 16px !important;
  height: 16px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 调整内容区域，为展开图标留出空间 */
::v-deep .el-tree-node__content {
  position: relative !important;
  padding-left: 24px !important; /* 为展开图标留出空间 */
}

/* 根据层级调整内容缩进 - 更具体的选择器 */
::v-deep .el-tree .el-tree-node[data-level="0"] .el-tree-node__content {
  padding-left: 24px !important;
}

::v-deep .el-tree .el-tree-node[data-level="1"] .el-tree-node__content {
  padding-left: 48px !important; /* 24px + 24px */
}

::v-deep .el-tree .el-tree-node[data-level="2"] .el-tree-node__content {
  padding-left: 72px !important; /* 24px + 24px + 24px */
}

::v-deep .el-tree .el-tree-node[data-level="3"] .el-tree-node__content {
  padding-left: 96px !important;
}

::v-deep .el-tree .el-tree-node[data-level="4"] .el-tree-node__content {
  padding-left: 120px !important;
}

::v-deep .el-tree .el-tree-node[data-level="5"] .el-tree-node__content {
  padding-left: 144px !important;
}

::v-deep .el-tree .el-tree-node[data-level="6"] .el-tree-node__content {
  padding-left: 168px !important;
}

::v-deep .el-tree .el-tree-node[data-level="7"] .el-tree-node__content {
  padding-left: 192px !important;
}

::v-deep .el-tree .el-tree-node[data-level="8"] .el-tree-node__content {
  padding-left: 216px !important;
}

::v-deep .el-tree .el-tree-node[data-level="9"] .el-tree-node__content {
  padding-left: 240px !important;
}
</style>
