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
        :expand-on-click-node="true"
        :key="treeKey"
        highlight-current
        @node-click="handleNodeClick"
        @node-expand="handleNodeExpand"
        @node-collapse="handleNodeCollapse">

        <span class="custom-tree-node" slot-scope="{ node, data }" :data-level="data.level" :style="{ paddingLeft: (4 + (data.level || 0) * 8) + 'px', display: 'flex', alignItems: 'center', textAlign: 'left', width: '100%', justifyContent: showActions ? 'space-between' : 'flex-start' }">
          <div style="display: flex; align-items: center; flex: 1; min-width: 0;">
            <i :class="getNodeIcon(data)" class="tree-icon" :key="`icon-${data.directoryId}-${iconUpdateKey}`" style="margin-right: 2px !important; margin-left: 0 !important; flex-shrink: 0; padding: 0 !important; width: auto !important;"></i>
            <span style="margin-left: 0; padding-left: 0; text-align: left; display: inline-block; font-size: 12px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="node.label">{{ node.label }}</span>
          </div>
          <div v-if="showActions" style="display: flex; align-items: center; margin-left: auto; flex-shrink: 0;">
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
  props: {
    // 是否显示操作按钮（新增、编辑、删除）
    showActions: {
      type: Boolean,
      default: true
    },
    // 模块类型参数，用于过滤目录
    module: {
      type: String,
      default: null
    }
  },
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
      iconUpdateKey: 0, // 用于强制更新图标
      treeKey: 0, // 用于强制刷新树组件
      settingIndentation: false, // 防止重复设置缩进的标志
      indentationTimer: null // 防抖定时器
    }
  },
  created() {
    // 先尝试从 sessionStorage 恢复展开状态
    this._loadExpandedStateFromStorage()
    // 然后加载根目录
    this.loadRootDirectories()
  },

  activated() {
    // 组件从缓存中激活时，尝试恢复展开状态
    this._loadExpandedStateFromStorage()

    // 延迟尝试恢复展开状态
    setTimeout(() => {
      if (this.defaultExpandedKeys.length > 0) {
        this._expandNodesRecursively()
      }
    }, 300)
  },

  beforeDestroy() {
    // 清理定时器，避免内存泄漏
    if (this._indentationTimer) {
      clearTimeout(this._indentationTimer)
    }
  },
  methods: {
    // 从 sessionStorage 加载展开状态
    _loadExpandedStateFromStorage() {
      try {
        const savedState = sessionStorage.getItem('requireRepository_state')
        if (savedState) {
          const state = JSON.parse(savedState)
          if (state.treeExpandedKeys && Array.isArray(state.treeExpandedKeys) && state.treeExpandedKeys.length > 0) {
            this.expandedKeys = [...state.treeExpandedKeys]
            this.defaultExpandedKeys = [...state.treeExpandedKeys]
          }
        }
      } catch (error) {
        console.error('从 sessionStorage 加载展开状态失败:', error)
      }
    },

    // 递归展开节点
    async _expandNodesRecursively() {
      const tree = this.$refs.directoryTree
      if (!tree || !this.defaultExpandedKeys || this.defaultExpandedKeys.length === 0) {
        return
      }

      // 递归展开每个节点
      for (const nodeKey of this.defaultExpandedKeys) {
        await this._expandNodeAndLoadChildren(nodeKey)
      }
    },

    // 展开节点并加载其子节点
    async _expandNodeAndLoadChildren(nodeKey) {
      const tree = this.$refs.directoryTree
      if (!tree || !tree.store || !tree.store.nodesMap) {
        return
      }

      const node = tree.store.nodesMap[nodeKey]
      if (!node) {
        return
      }

      // 如果节点未加载子节点，先加载
      if (!node.loaded && node.data) {
        try {
          // 调用正确的方法名
          const children = await this.loadChildrenDirectories(node.data)

          if (children && children.length > 0) {
            // 将子节点添加到 node.data.children
            if (!node.data.children) {
              node.data.children = []
            }
            node.data.children.push(...children)

            // 标记节点已加载
            node.loaded = true
            await this.$nextTick()
          }
        } catch (error) {
          // 静默处理错误
        }
      }

      // 设置节点为展开状态
      node.expanded = true
    },

    // 设置选中的节点（外部调用）
    setSelectedKey(key, expandedKeys = null) {
      this.selectedKey = key

      // 如果提供了展开的keys，更新展开状态（但不重复执行，因为 _expandNodesRecursively 已经处理过了）
      if (expandedKeys && Array.isArray(expandedKeys) && expandedKeys.length > 0) {
        // 只更新内部状态，不刷新树
        this.expandedKeys = [...expandedKeys]
        this.defaultExpandedKeys = [...expandedKeys]
      }

      // 只设置选中状态
      this.$nextTick(() => {
        setTimeout(() => {
          const tree = this.$refs.directoryTree
          if (tree && key && typeof tree.setCurrentKey === 'function') {
            tree.setCurrentKey(key)
          }
        }, 100)
      })
    },

    // 内部方法：恢复树的状态（备用方法，现已由 _expandNodesRecursively 替代）
    async _restoreTreeState(key) {
      const tree = this.$refs.directoryTree
      if (!tree) {
        return
      }

      // 恢复展开状态 - 逐级展开确保子节点被加载
      if (this.expandedKeys.length > 0 && tree.store && tree.store.nodesMap) {
        // 手动逐个展开节点（确保子节点被加载）
        for (const nodeKey of this.expandedKeys) {
          const node = tree.store.nodesMap[nodeKey]
          if (node) {
            // 如果节点有子节点但未加载，先加载子节点
            if (!node.loaded && node.data && node.data.directoryId) {
              try {
                const nodeData = node.data
                if (this.loadChildDirectories) {
                  await this.loadChildDirectories(nodeData, node)
                  await this.$nextTick()
                  node.expanded = true
                }
              } catch (error) {
                // 静默处理错误
              }
            } else {
              // 节点已加载或没有子节点，直接设置展开
              node.expanded = true
            }
          }
        }

        // 所有节点处理完成后，统一刷新树的展开状态
        if (typeof tree.setExpandedKeys === 'function') {
          const existingExpandedKeys = this.expandedKeys.filter(k => tree.store.nodesMap[k])
          tree.setExpandedKeys(existingExpandedKeys)
        }
      }

      // 设置选中状态
      if (key && typeof tree.setCurrentKey === 'function') {
        tree.setCurrentKey(key)
      }

      // 强制更新视图
      this.$forceUpdate()
    },

    // 获取当前展开的节点keys（外部调用）
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

      return this.expandedKeys
    },

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

            // 如果有保存的展开状态，加载根目录后立即恢复
            if (this.defaultExpandedKeys.length > 0) {
              setTimeout(() => {
                this._expandNodesRecursively()
              }, 300)
            }
          })
        }
      } catch (error) {
      }
    },

    async loadChildrenDirectories(parentData) {
      try {
        const response = await testDirectoryApi.getChildrenByParentId(
          parentData.directoryId,
          parentData.systemId,
          this.module
        )


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


          // 使用Vue.set确保响应式更新
          this.$set(parentData, 'children', children)

          // 设置hasChildren属性：根据isLeafDirectory字段判断
          // isLeafDirectory: "1" 表示叶子目录(没有子目录)，"0" 表示不是叶子目录(有子目录)
          const hasChildren = children.some(child => child.isLeafDirectory !== "1")
          this.$set(parentData, 'hasChildren', hasChildren)
          // 更新图标更新key以强制重新渲染图标
          this.iconUpdateKey++

          // 强制触发响应式更新
          this.$forceUpdate()

          // 等待DOM更新后，尝试展开父节点
          await this.$nextTick()
          this.expandParentNode(parentData.directoryId)

          // 重新设置展开图标位置（延迟执行，避免重复调用）
          this.$nextTick(() => {
            setTimeout(() => {
              if (!this._settingIndentation) {
                this._settingIndentation = true
                this.setNodeIndentation()
                this._settingIndentation = false
              }
            }, 100)
          })

          return children
        } else {
          return []
        }
      } catch (error) {
        return []
      }
    },

    // 展开父节点
    expandParentNode(nodeId) {
      const tree = this.$refs.directoryTree
      if (tree && tree.store && tree.store.nodesMap && tree.store.nodesMap[nodeId]) {
        tree.store.nodesMap[nodeId].expanded = true
        this.$forceUpdate()
      }
    },

    async handleNodeClick(data, node) {
      this.$emit('node-select', data)

      // 保存当前选中的节点
      this.selectedKey = data.directoryId

      // 如果节点没有子节点，尝试加载子目录
      if (node.childNodes.length === 0) {
        try {
          const children = await this.loadChildrenDirectories(data)
          if (children.length > 0) {
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
          }
        } catch (error) {
        }
      } else {
        // 如果已有子节点，确保节点是展开的
        if (!node.expanded) {
          this.forceExpandNode(data.directoryId)
        }
      }
    },

    // 节点展开事件
    handleNodeExpand(data, node) {
      this.$emit('node-expand', data)
    },

    // 节点收起事件
    handleNodeCollapse(data, node) {
      this.$emit('node-collapse', data)
    },

    // 强制展开节点
    forceExpandNode(nodeId) {
      const tree = this.$refs.directoryTree
      if (tree && tree.store && tree.store.nodesMap && tree.store.nodesMap[nodeId]) {
        const treeNode = tree.store.nodesMap[nodeId]

        // 添加到展开的keys中
        if (!this.expandedKeys.includes(nodeId)) {
          this.expandedKeys.push(nodeId)
        }

        // 使用Element UI的方法展开节点
        if (typeof tree.setExpandedKeys === 'function') {
          tree.setExpandedKeys([...this.expandedKeys])
        }

        // 设置树节点状态
        treeNode.expanded = true

        // 强制更新
        this.$forceUpdate()

      } else {
      }
    },

    // 强制收起节点
    forceCollapseNode(nodeId) {
      const tree = this.$refs.directoryTree
      if (tree && tree.store && tree.store.nodesMap && tree.store.nodesMap[nodeId]) {
        const treeNode = tree.store.nodesMap[nodeId]

        // 从展开的keys中移除
        const index = this.expandedKeys.indexOf(nodeId)
        if (index > -1) {
          this.expandedKeys.splice(index, 1)
        }

        // 使用Element UI的方法收起节点
        if (typeof tree.setExpandedKeys === 'function') {
          tree.setExpandedKeys([...this.expandedKeys])
        }

        // 设置树节点状态
        treeNode.expanded = false

        // 强制更新
        this.$forceUpdate()

      } else {
      }
    },

    // 调试方法：检查节点的展开状态
    debugNodeState(nodeId) {
      const tree = this.$refs.directoryTree
      if (tree && tree.store && tree.store.nodesMap) {
        const treeNode = tree.store.nodesMap[nodeId]
        const isInExpandedKeys = this.expandedKeys.includes(nodeId)
        const treeExpanded = treeNode?.expanded

        // 如果状态不一致，静默处理
        if (treeExpanded !== isInExpandedKeys) {
          // 状态不一致时的处理逻辑
        }
      }
    },

    // 设置节点缩进样式
    setNodeIndentation() {
      // 防抖处理，避免频繁调用
      if (this._indentationTimer) {
        clearTimeout(this._indentationTimer)
      }

      this._indentationTimer = setTimeout(() => {
        this._doSetNodeIndentation()
      }, 50)
    },

    // 实际执行设置节点缩进的方法
    _doSetNodeIndentation() {
      this.$nextTick(() => {
        const tree = this.$refs.directoryTree
        if (tree && tree.$el) {
          // 直接通过CSS选择器设置缩进
          const nodes = tree.$el.querySelectorAll('.custom-tree-node[data-level]')
          nodes.forEach((node, index) => {
            const level = parseInt(node.getAttribute('data-level')) || 0
            const treeNode = node.closest('.el-tree-node')
            const content = treeNode ? treeNode.querySelector('.el-tree-node__content') : null
            const expandIcon = treeNode ? treeNode.querySelector('.el-tree-node__expand-icon') : null
            if (content) {
              // 设置缩进：基础4px + 层级 * 8px，优化空间利用
              const paddingLeft = 4 + level * 8

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

                // 检查Element UI树的展开状态
                const tree = this.$refs.directoryTree
                if (hasChildren) {
                  // 重新设计布局：展开图标在文件夹图标的左侧，间距8px
                  // 展开图标位置：paddingLeft
                  // 文件夹图标位置：paddingLeft + 16px（展开图标宽度）+ 8px（间距）= paddingLeft + 24px

                  // 展开图标样式
                  expandIcon.style.setProperty('position', 'absolute', 'important')
                  expandIcon.style.setProperty('top', '50%', 'important')
                  expandIcon.style.setProperty('transform', 'translateY(-50%)', 'important')
                  expandIcon.style.setProperty('left', `${paddingLeft}px`, 'important')
                  expandIcon.style.setProperty('width', '16px', 'important')
                  expandIcon.style.setProperty('height', '16px', 'important')
                  expandIcon.style.setProperty('display', 'flex', 'important')
                  expandIcon.style.setProperty('align-items', 'center', 'important')
                  expandIcon.style.setProperty('justify-content', 'center', 'important')
                  expandIcon.style.setProperty('cursor', 'pointer', 'important')
                  expandIcon.style.setProperty('color', '#606266', 'important')
                  expandIcon.style.setProperty('font-size', '12px', 'important')
                  expandIcon.style.setProperty('transition', 'all 0.2s ease', 'important')
                  expandIcon.style.setProperty('z-index', '10', 'important')
                  expandIcon.style.setProperty('pointer-events', 'auto', 'important')
                  expandIcon.style.setProperty('visibility', 'visible', 'important')
                  expandIcon.style.setProperty('opacity', '1', 'important')

                  // 设置文件夹图标的margin-left，为展开图标预留空间
                  const folderIcon = content.querySelector('.el-icon-folder-opened')
                  if (folderIcon) {
                    // 文件夹图标左边距 = 展开图标宽度(16px) + 间距(8px) = 24px
                    folderIcon.style.setProperty('margin-left', '24px', 'important')
                  }

                  // 移除之前的事件监听器，避免重复添加
                  if (expandIcon._clickHandler) {
                    expandIcon.removeEventListener('click', expandIcon._clickHandler)
                  }

                  // 添加展开图标的点击事件处理
                  const clickHandler = (e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    // 检查节点是否已有子节点
                    const tree = this.$refs.directoryTree
                    if (tree && tree.store && tree.store.nodesMap) {
                      const treeNode = tree.store.nodesMap[nodeData.directoryId]
                      if (treeNode) {
                        // 如果节点没有子节点，先加载子目录
                        if (!treeNode.childNodes || treeNode.childNodes.length === 0) {
                          this.loadChildrenDirectories(nodeData).then(children => {
                            if (children.length > 0) {
                              // 强制更新树组件
                              this.$forceUpdate()
                              this.$nextTick(() => {
                                // 延迟一点时间确保DOM更新完成
                                setTimeout(() => {
                                  this.forceExpandNode(nodeData.directoryId)
                                  // 重新设置展开图标位置（避免重复调用）
                                  if (!this._settingIndentation) {
                                    this._settingIndentation = true
                                    this.setNodeIndentation()
                                    this._settingIndentation = false
                                  }
                                }, 50)
                              })
                            } else {
                            }
                          }).catch(error => {
                          })
                        } else {
                          // 以展开keys为准判断当前状态
                          const isCurrentlyExpanded = this.expandedKeys.includes(nodeData.directoryId)

                          if (isCurrentlyExpanded) {
                            this.forceCollapseNode(nodeData.directoryId)
                          } else {
                            this.forceExpandNode(nodeData.directoryId)
                          }

                          // 重新设置展开图标位置（避免重复调用）
                          this.$nextTick(() => {
                            if (!this._settingIndentation) {
                              this._settingIndentation = true
                              this.setNodeIndentation()
                              this._settingIndentation = false
                            }
                          })
                        }
                      }
                    }
                  }

                  // 添加事件监听器
                  expandIcon.addEventListener('click', clickHandler)

                  // 保存事件处理器引用，用于后续移除
                  expandIcon._clickHandler = clickHandler
                } else {
                  // 叶子节点：隐藏展开图标，文件夹图标左对齐
                  expandIcon.style.setProperty('display', 'none', 'important')
                  expandIcon.style.setProperty('visibility', 'hidden', 'important')
                  expandIcon.style.setProperty('opacity', '0', 'important')
                  expandIcon.style.setProperty('pointer-events', 'none', 'important')

                  // 叶子节点的文件夹图标左边距较小，用于视觉对齐
                  const folderIcon = content.querySelector('.el-icon-folder')
                  if (folderIcon) {
                    folderIcon.style.setProperty('margin-left', '16px', 'important')
                  }
                }
              }
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

        if (isLeafDirectory === 0) {
          // 不是叶子目录，有子目录，使用黑色文件夹图标
          return 'el-icon-folder-opened'
        } else {
          // 是叶子目录，没有子目录，使用普通文件夹图标
          return 'el-icon-folder'
        }
      }
    },

    async refreshData() {
      // 保存当前展开状态
      this.saveExpandedState()
      // 设置默认展开的keys
      this.defaultExpandedKeys = [...this.expandedKeys]
      // 完全重新加载数据
      await this.loadRootDirectories()
      // 重新加载所有展开节点的子目录
      await this.reloadExpandedChildren()
      // 强制重新渲染树组件
      const newData = [...this.treeData]
      this.treeData = []
      await this.$nextTick()
      this.treeData = newData
      await this.$nextTick()
      this.restoreExpandedState()
    },

    // 重新加载所有展开节点的子目录
    async reloadExpandedChildren() {
      if (this.expandedKeys.length === 0) {
        return
      }
      for (const key of this.expandedKeys) {
        const node = this.findNodeByKey(this.treeData, key)
        if (node && node.directoryId) {
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
      }
    },

    // 恢复展开状态
    restoreExpandedState() {
      const tree = this.$refs.directoryTree
      if (tree && this.expandedKeys.length > 0) {
        // 使用setExpandedKeys方法
        if (typeof tree.setExpandedKeys === 'function') {
          tree.setExpandedKeys(this.expandedKeys)
        } else {
          // 降级方案：直接操作节点状态
          this.expandedKeys.forEach(key => {
            if (tree.store && tree.store.nodesMap && tree.store.nodesMap[key]) {
              tree.store.nodesMap[key].expanded = true
            }
          })
        }

        // 恢复选中状态
        if (this.selectedKey && typeof tree.setCurrentKey === 'function') {
          tree.setCurrentKey(this.selectedKey)
        }

        // 延迟重试恢复状态
        setTimeout(() => {
          this.retryRestoreState()
        }, 200)
      }
    },

    // 重试恢复状态
    retryRestoreState() {
      const tree = this.$refs.directoryTree
      if (tree && this.expandedKeys.length > 0) {
        // 强制设置展开状态
        this.expandedKeys.forEach(key => {
          if (tree.store && tree.store.nodesMap && tree.store.nodesMap[key]) {
            tree.store.nodesMap[key].expanded = true
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
  padding: 8px;
  overflow: auto;
}

/* 自定义树节点样式 */
.custom-tree-node {
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
  min-width: 0; /* 允许flex子元素收缩 */
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
  min-width: 0; /* 允许flex子元素收缩 */
}

::v-deep .el-tree-node__content .custom-tree-node span {
  margin-left: 0;
  padding-left: 0;
  text-align: left;
  display: inline-block;
  font-size: 12px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 层级缩进样式 - 阶梯式展示 */
/* 重置Element UI默认样式 */
::v-deep .el-tree-node__content {
  padding-left: 4px !important;
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
  padding-left: 4px !important;
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="0"] {
  padding-left: 4px !important;
  margin-left: 0 !important;
}

/* 第2层 - 子目录 */
::v-deep .el-tree-node[data-level="1"] .el-tree-node__content {
  padding-left: 12px !important; /* 4px + 8px */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="1"] {
  padding-left: 12px !important;
  margin-left: 0 !important;
}

/* 第3层 - 孙目录 */
::v-deep .el-tree-node[data-level="2"] .el-tree-node__content {
  padding-left: 20px !important; /* 4px + 8px + 8px */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="2"] {
  padding-left: 20px !important;
  margin-left: 0 !important;
}

/* 第4层 */
::v-deep .el-tree-node[data-level="3"] .el-tree-node__content {
  padding-left: 28px !important; /* 4px + 8px + 8px + 8px */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="3"] {
  padding-left: 28px !important;
  margin-left: 0 !important;
}

/* 第5层 */
::v-deep .el-tree-node[data-level="4"] .el-tree-node__content {
  padding-left: 36px !important; /* 4px + 8px * 4 */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="4"] {
  padding-left: 36px !important;
  margin-left: 0 !important;
}

/* 第6层 */
::v-deep .el-tree-node[data-level="5"] .el-tree-node__content {
  padding-left: 44px !important; /* 4px + 8px * 5 */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="5"] {
  padding-left: 44px !important;
  margin-left: 0 !important;
}

/* 第7层 */
::v-deep .el-tree-node[data-level="6"] .el-tree-node__content {
  padding-left: 52px !important; /* 4px + 8px * 6 */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="6"] {
  padding-left: 52px !important;
  margin-left: 0 !important;
}

/* 第8层 */
::v-deep .el-tree-node[data-level="7"] .el-tree-node__content {
  padding-left: 60px !important; /* 4px + 8px * 7 */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="7"] {
  padding-left: 60px !important;
  margin-left: 0 !important;
}

/* 第9层 */
::v-deep .el-tree-node[data-level="8"] .el-tree-node__content {
  padding-left: 68px !important; /* 4px + 8px * 8 */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="8"] {
  padding-left: 68px !important;
  margin-left: 0 !important;
}

/* 第10层 */
::v-deep .el-tree-node[data-level="9"] .el-tree-node__content {
  padding-left: 76px !important; /* 4px + 8px * 9 */
  margin-left: 0 !important;
}

::v-deep .custom-tree-node[data-level="9"] {
  padding-left: 76px !important;
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
  pointer-events: auto !important;
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
