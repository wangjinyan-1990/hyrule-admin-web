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
            isLeafDirectory: item.isLeafDirectory, // 后端提供的叶子目录标识
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
            isLeafDirectory: item.isLeafDirectory, // 后端提供的叶子目录标识
            children: []
          }))
          
          console.log('处理后的子目录数据:', children)
          
            // 使用Vue.set确保响应式更新
            this.$set(parentData, 'children', children)
            
            // 设置hasChildren属性：根据isLeafDirectory字段判断
            // isLeafDirectory: "1" 表示叶子目录(没有子目录)，"0" 表示不是叶子目录(有子目录)
            const hasChildren = children.some(child => child.isLeafDirectory !== "1")
            this.$set(parentData, 'hasChildren', hasChildren)
            
            console.log(`节点 ${parentData.directoryName} 的子目录检查:`, {
              hasChildren: parentData.hasChildren,
              children: parentData.children,
              childrenLength: parentData.children.length,
              isLeafDirectory: children.map(child => ({ name: child.directoryName, isLeaf: child.isLeafDirectory }))
            })
            
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
              // 设置缩进：基础12px + 层级 * 12px，增强层级视觉效果
              const paddingLeft = 12 + level * 12
              
              // 强制设置样式，使用!important
              content.style.setProperty('padding-left', `${paddingLeft}px`, 'important')
              content.style.setProperty('margin-left', '0px', 'important')
              content.style.setProperty('text-indent', '0px', 'important')
              
              // 同时设置父容器的样式
              if (treeNode) {
                treeNode.style.setProperty('padding-left', '0px', 'important')
                treeNode.style.setProperty('margin-left', '0px', 'important')
              }
              
              // 设置展开图标位置：只为有子节点的节点显示展开图标
              if (expandIcon) {
                // 直接从treeData中查找对应的节点数据
                const nodeText = node.textContent?.trim() || ''
                const level = parseInt(node.getAttribute('data-level')) || 0
                
                // 递归查找节点数据
                const findNodeData = (treeData, targetText, targetLevel, currentLevel = 0) => {
                  for (const item of treeData) {
                    if (item.directoryName === targetText && currentLevel === targetLevel) {
                      return item
                    }
                    if (item.children && item.children.length > 0) {
                      const found = findNodeData(item.children, targetText, targetLevel, currentLevel + 1)
                      if (found) return found
                    }
                  }
                  return null
                }
                
                const nodeData = findNodeData(this.treeData, nodeText, level)
                // 使用后端提供的isLeafDirectory字段判断是否有子节点
                // isLeafDirectory: "1" 表示叶子目录(没有子目录)，"0" 表示不是叶子目录(有子目录)
                const hasChildren = nodeData ? nodeData.isLeafDirectory !== "1" : false
                
                console.log(`🔍 节点 "${nodeText}" (层级${level}) 子节点检查: hasChildren=${hasChildren}`, {
                  nodeData: nodeData,
                  isLeafDirectory: nodeData ? nodeData.isLeafDirectory : 'undefined',
                  hasChildren: nodeData ? nodeData.hasChildren : 'undefined',
                  children: nodeData ? nodeData.children : 'undefined',
                  childrenLength: nodeData && nodeData.children ? nodeData.children.length : 0
                })
                
                if (hasChildren) {
                  // 修复间距问题：展开图标和文件夹图标之间应该有8px的间距
                  // 展开图标位置：paddingLeft（与内容区域对齐）
                  // 文件夹图标位置：paddingLeft + 24px（为展开图标预留24px空间）
                  // 实际间距：24px - 16px（展开图标宽度）= 8px
                  const expandIconLeft = paddingLeft       // 展开图标的位置
                  const folderIconLeft = paddingLeft + 24  // 文件夹图标的左侧位置
                  
                  // 应用基础样式
                  expandIcon.style.setProperty('position', 'absolute', 'important')
                  expandIcon.style.setProperty('top', '50%', 'important')
                  expandIcon.style.setProperty('transform', 'translateY(-50%)', 'important')
                  expandIcon.style.setProperty('z-index', '10', 'important')
                  expandIcon.style.setProperty('width', '16px', 'important')
                  expandIcon.style.setProperty('height', '16px', 'important')
                  expandIcon.style.setProperty('display', 'flex', 'important')
                  expandIcon.style.setProperty('align-items', 'center', 'important')
                  expandIcon.style.setProperty('justify-content', 'center', 'important')
                  expandIcon.style.setProperty('cursor', 'pointer', 'important')
                  expandIcon.style.setProperty('color', '#606266', 'important')
                  expandIcon.style.setProperty('font-size', '12px', 'important')
                  expandIcon.style.setProperty('transition', 'all 0.2s ease', 'important')
                  
                  // 设置精确位置：始终在文件夹图标左侧8px
                  expandIcon.style.setProperty('left', `${expandIconLeft}px`, 'important')
                  
                  // 设置文件夹图标的margin-left，为展开图标预留空间
                  const folderIcon = content.querySelector('.el-icon-folder-opened')
                  if (folderIcon) {
                    folderIcon.style.setProperty('margin-left', '24px', 'important')
                    console.log(`✅ 设置文件夹图标左边距: 24px`)
                  }
                  
                  console.log(`✅ 展开图标位置: ${expandIconLeft}px (文件夹图标位置: ${folderIconLeft}px, 展开图标右侧位置: ${expandIconLeft + 16}px, 实际间距: ${folderIconLeft - (expandIconLeft + 16)}px, 目标间距: 8px)`)
                } else {
                  // 没有子节点，隐藏展开图标
                  expandIcon.style.setProperty('display', 'none', 'important')
                  expandIcon.style.setProperty('visibility', 'hidden', 'important')
                  expandIcon.style.setProperty('opacity', '0', 'important')
                  console.log(`❌ 节点无子节点，隐藏展开图标`)
                  
                  // 叶子目录的文件夹图标需要16px的margin-left，与展开图标保持视觉对齐
                  const folderIcon = content.querySelector('.el-icon-folder')
                  if (folderIcon) {
                    folderIcon.style.setProperty('margin-left', '16px', 'important')
                    console.log(`✅ 叶子目录文件夹图标左边距: 16px`)
                  }
                }
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
        // 根据 isLeafDirectory 字段判断文件夹图标类型
        // isLeafDirectory: "0" 表示不是叶子目录(有子目录)，使用黑色文件夹图标
        // isLeafDirectory: "1" 表示是叶子目录(没有子目录)，使用普通文件夹图标
        const isLeafDirectory = data.isLeafDirectory
        console.log(`节点 ${data.directoryName} 的叶子目录检查:`, {
          isLeafDirectory: isLeafDirectory,
          iconType: isLeafDirectory === "0" ? 'black-folder' : 'normal-folder'
        })
        
        if (isLeafDirectory === "0") {
          // 不是叶子目录，有子目录，使用黑色文件夹图标
          return 'el-icon-folder-opened'
        } else {
          // 是叶子目录，没有子目录，使用普通文件夹图标
          return 'el-icon-folder'
        }
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
    },

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
  padding-left: 12px !important;
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
  padding-left: 12px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="0"] {
  padding-left: 12px !important;
  margin-left: 0 !important;
}

/* 第2层 - 子目录 */
::v-deep .el-tree-node[data-level="1"] .el-tree-node__content {
  padding-left: 24px !important; /* 12px + 12px */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="1"] {
  padding-left: 24px !important;
  margin-left: 0 !important;
}

/* 第3层 - 孙目录 */
::v-deep .el-tree-node[data-level="2"] .el-tree-node__content {
  padding-left: 36px !important; /* 12px + 12px + 12px */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="2"] {
  padding-left: 36px !important;
  margin-left: 0 !important;
}

/* 第4层 */
::v-deep .el-tree-node[data-level="3"] .el-tree-node__content {
  padding-left: 48px !important; /* 12px + 12px + 12px + 12px */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="3"] {
  padding-left: 48px !important;
  margin-left: 0 !important;
}

/* 第5层 */
::v-deep .el-tree-node[data-level="4"] .el-tree-node__content {
  padding-left: 60px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="4"] {
  padding-left: 60px !important;
  margin-left: 0 !important;
}

/* 第6层 */
::v-deep .el-tree-node[data-level="5"] .el-tree-node__content {
  padding-left: 72px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="5"] {
  padding-left: 72px !important;
  margin-left: 0 !important;
}

/* 第7层 */
::v-deep .el-tree-node[data-level="6"] .el-tree-node__content {
  padding-left: 84px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="6"] {
  padding-left: 84px !important;
  margin-left: 0 !important;
}

/* 第8层 */
::v-deep .el-tree-node[data-level="7"] .el-tree-node__content {
  padding-left: 96px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="7"] {
  padding-left: 96px !important;
  margin-left: 0 !important;
}

/* 第9层 */
::v-deep .el-tree-node[data-level="8"] .el-tree-node__content {
  padding-left: 108px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="8"] {
  padding-left: 108px !important;
  margin-left: 0 !important;
}

/* 第10层 */
::v-deep .el-tree-node[data-level="9"] .el-tree-node__content {
  padding-left: 120px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="9"] {
  padding-left: 120px !important;
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
  cursor: pointer !important;
  transition: transform 0.2s ease !important;
}


/* 调整内容区域，为展开图标留出空间 */
::v-deep .el-tree-node__content {
  position: relative !important;
  /* 通过JavaScript动态设置padding-left，不需要固定值 */
}

/* 精确控制展开图标位置 - 确保始终在文件夹图标左侧4px */
::v-deep .el-tree-node__expand-icon {
  /* 基础位置设置 */
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  z-index: 10 !important;
  width: 16px !important;
  height: 16px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  
  /* 确保图标颜色和大小 */
  color: #606266 !important;
  font-size: 12px !important;
}

/* 展开图标始终位于文件夹图标左侧4px - 通过JavaScript动态设置位置 */

/* 展开图标悬停和激活状态 */
::v-deep .el-tree-node__expand-icon:hover {
  color: #409eff !important;
  transform: translateY(-50%) scale(1.1) !important;
}

::v-deep .el-tree-node__expand-icon.expanded {
  transform: translateY(-50%) rotate(90deg) !important;
}

::v-deep .el-tree-node__expand-icon.is-leaf {
  display: none !important;
}

/* 黑色文件夹图标样式 - 用于非叶子目录 */
::v-deep .el-icon-folder-opened {
  color: #000000 !important;
  font-weight: 900 !important;
  /* 使用实心效果 */
  -webkit-text-stroke: 0.5px #000000 !important;
  text-shadow: none !important;
  /* 尝试使用不同的图标 */
  font-family: "element-icons" !important;
}

/* 使用SVG背景图片作为实心黑色文件夹图标 */
::v-deep .el-icon-folder-opened::before {
  content: "" !important;
  display: inline-block !important;
  width: 16px !important;
  height: 16px !important;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000000'%3E%3Cpath d='M12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5Z'%3E%3C/path%3E%3C/svg%3E") !important;
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}

/* 普通文件夹图标样式 - 用于叶子目录 */
::v-deep .el-icon-folder {
  color: #606266 !important;
  /* margin-left由JavaScript动态设置为16px，与展开图标保持视觉对齐 */
}
</style>
