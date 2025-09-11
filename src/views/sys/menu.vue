<template>
  <div class="app-container">
    <el-card shadow="never" style="margin-bottom: 10px;">
      <el-button type="primary" icon="el-icon-plus" @click="onAddTopLevel">
        新增
      </el-button>
    </el-card>

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
        <el-table-column prop="title" label="菜单名称" min-width="260" />
        <el-table-column prop="path" label="路径" min-width="200" />
        <el-table-column prop="name" label="路由名" min-width="160" />
        <el-table-column prop="component" label="组件" min-width="220" />
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
import { getAllMenus, createMenu, updateMenu, deleteMenu, getMenusByParentId } from '@/api/menu'
import { buildMenuTree } from '@/utils/menu'

export default {
  name: 'MenuManage',
  data() {
    return {
      loading: false,
      menus: [],
      menuTree: []
    }
  },
  created() {
    this.loadMenus()
  },
  methods: {
    isButton(row) {
      // 兼容后端1/0或字符串
      return row.isLeaf === '2' || row.sysMenuTp === '2'
    },
    async loadMenus() {
      this.loading = true
      try {
        const res = await getAllMenus()
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
        const res = await getMenusByParentId(parent.menuId)
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
      this.$prompt('请输入一级菜单名称', '新增菜单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const payload = { title: value, name: value, path: `/${Date.now()}`, parentId: 0, hidden: 0 }
        return createMenu(payload)
      }).then(() => {
        this.$message.success('新增成功')
        this.loadMenus()
      }).catch(() => {})
    },
    onAddChild(row) {
      this.$prompt('请输入子菜单名称', '添加下级', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        const payload = { title: value, name: value, path: `${row.path}/${Date.now()}`, parentId: row.menuId, hidden: 0 }
        return createMenu(payload)
      }).then(() => {
        this.$message.success('新增成功')
        this.loadMenus()
      }).catch(() => {})
    },
    onEdit(row) {
      this.$prompt('请输入新名称', '修改菜单', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: row.title
      }).then(({ value }) => {
        const payload = { ...row, title: value }
        return updateMenu(payload)
      }).then(() => {
        this.$message.success('修改成功')
        this.loadMenus()
      }).catch(() => {})
    },
    onDelete(row) {
      this.$confirm(`确认删除【${row.title}】?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => deleteMenu(row.menuId))
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

</style>


