<template>
  <el-dialog title="选择机构" :visible.sync="visible" width="500px" @close="handleClose">
    <div>
      <el-row style="margin-bottom: 10px;">
        <el-col :span="24">
          <div style="display: flex; align-items: center;">
            <el-input v-model="searchModel.orgName" placeholder="机构名称" style="width: 200px; margin-right: 10px;"></el-input>
            <el-button @click="getOrgList" type="primary" round icon="el-icon-search" style="margin-right: 8px;">查询</el-button>
            <el-button @click="resetSearch" type="info" round icon="el-icon-refresh">重置</el-button>
          </div>
        </el-col>
      </el-row>

      <div class="org-tree-container">
        <el-tree
          ref="orgTree"
          :data="orgTree"
          :props="treeProps"
          node-key="orgId"
          :expand-on-click-node="false"
          :highlight-current="true"
          @node-click="handleNodeClick"
          v-loading="loading"
          class="org-tree">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span class="tree-label">{{ node.label }}</span>
            <span class="tree-status">
              <el-tag :type="data.orgStatus === 'A' ? 'success' : 'danger'" size="mini">
                {{ data.orgStatus === 'A' ? '有效' : '无效' }}
              </el-tag>
            </span>
          </span>
        </el-tree>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm" :disabled="!selectedOrg">确 定</el-button>
    </span>
  </el-dialog>
</template>

<style scoped>
.org-tree-container {
  height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
}

.org-tree {
  height: 100%;
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
.org-tree-container::-webkit-scrollbar {
  width: 6px;
}

.org-tree-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.org-tree-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.org-tree-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

<script>
import orgApi from '@/api/sys/org'

export default {
  name: 'OrgSelector',
  props: {
    // 控制弹窗显示
    value: {
      type: Boolean,
      default: false
    },
    // 排除的机构ID列表（可选）
    excludeOrgIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      searchModel: {
        orgName: ''
      },
      orgTree: [],
      selectedOrg: null,
      treeProps: {
        children: 'children',
        label: 'orgName'
      }
    }
  },
  computed: {
    visible: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  },
  watch: {
    value(newVal) {
      if (newVal) {
        this.resetData();
        this.getOrgList();
      }
    }
  },
  methods: {
    resetData() {
      this.searchModel = {
        orgName: ''
      };
      this.orgTree = [];
      this.selectedOrg = null;
    },
    async getOrgList() {
      this.loading = true;
      try {
        const response = await orgApi.getOrgTree();
        let orgTree = response.data || [];
        
        // 过滤掉排除的机构
        if (this.excludeOrgIds && this.excludeOrgIds.length > 0) {
          orgTree = this.filterExcludedOrgs(orgTree);
        }
        
        // 如果有搜索条件，进行过滤
        if (this.searchModel.orgName) {
          orgTree = this.filterBySearch(orgTree, this.searchModel.orgName);
        }
        
        this.orgTree = orgTree;
        
        // 如果有搜索条件，自动展开所有匹配的节点
        if (this.searchModel.orgName) {
          this.$nextTick(() => {
            // 延迟一点时间确保树组件完全渲染
            setTimeout(() => {
              this.expandMatchedNodes();
            }, 100);
          });
        }
      } catch (error) {
        this.$message.error('获取机构列表失败');
        this.orgTree = [];
      } finally {
        this.loading = false;
      }
    },
    
    // 过滤排除的机构
    filterExcludedOrgs(orgs) {
      return orgs.filter(org => {
        if (this.excludeOrgIds.includes(org.orgId)) {
          return false;
        }
        if (org.children && org.children.length > 0) {
          org.children = this.filterExcludedOrgs(org.children);
        }
        return true;
      });
    },
    
    // 根据搜索条件过滤机构
    filterBySearch(orgs, searchText) {
      const result = [];
      orgs.forEach(org => {
        const matchesSearch = org.orgName.toLowerCase().includes(searchText.toLowerCase());
        let filteredChildren = [];
        
        if (org.children && org.children.length > 0) {
          filteredChildren = this.filterBySearch(org.children, searchText);
        }
        
        // 如果当前机构匹配或子机构有匹配的，则包含此机构
        if (matchesSearch || filteredChildren.length > 0) {
          result.push({
            ...org,
            children: filteredChildren
          });
        }
      });
      return result;
    },
    
    resetSearch() {
      this.searchModel.orgName = '';
      this.getOrgList();
    },
    
    handleNodeClick(data, node) {
      this.selectedOrg = data;
    },
    
    handleConfirm() {
      if (!this.selectedOrg) {
        this.$message.warning('请先选择机构');
        return;
      }
      // 只返回orgId
      this.$emit('confirm', this.selectedOrg.orgId);
      this.handleClose();
    },
    
    handleClose() {
      this.visible = false;
      this.$emit('close');
    },
    
    // 展开匹配搜索条件的节点
    expandMatchedNodes() {
      if (!this.$refs.orgTree) return;
      
      const searchText = this.searchModel.orgName.toLowerCase();
      const expandedKeys = new Set();
      
      // 收集所有需要展开的节点ID
      this.collectExpandedKeys(this.orgTree, searchText, expandedKeys);
      
      // 展开所有收集到的节点
      const keysArray = Array.from(expandedKeys);
      console.log('展开的节点ID:', keysArray);
      this.$refs.orgTree.setExpandedKeys(keysArray);
    },
    
    // 收集需要展开的节点ID
    collectExpandedKeys(orgs, searchText, expandedKeys, parentKeys = []) {
      orgs.forEach(org => {
        const matchesSearch = org.orgName.toLowerCase().includes(searchText);
        const hasMatchingChildren = this.hasMatchingChildren(org, searchText);
        
        if (matchesSearch || hasMatchingChildren) {
          // 当前节点需要展开
          expandedKeys.add(org.orgId);
          
          // 展开所有父节点
          parentKeys.forEach(parentKey => {
            expandedKeys.add(parentKey);
          });
          
          // 如果有子节点，继续递归收集
          if (org.children && org.children.length > 0) {
            this.collectExpandedKeys(org.children, searchText, expandedKeys, [...parentKeys, org.orgId]);
          }
        } else if (org.children && org.children.length > 0) {
          // 即使当前节点不匹配，也要检查子节点
          this.collectExpandedKeys(org.children, searchText, expandedKeys, [...parentKeys, org.orgId]);
        }
      });
    },
    
    // 检查是否有匹配的子节点
    hasMatchingChildren(org, searchText) {
      if (!org.children || org.children.length === 0) {
        return false;
      }
      
      for (const child of org.children) {
        if (child.orgName.toLowerCase().includes(searchText)) {
          return true;
        }
        if (this.hasMatchingChildren(child, searchText)) {
          return true;
        }
      }
      
      return false;
    }
  }
}
</script>
