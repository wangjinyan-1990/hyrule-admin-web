<template>
  <div class="system-member-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span class="page-title">
          <i class="el-icon-user-solid"></i>
          系统成员维护
        </span>
      </div>
      
      <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="开发人员" name="developer">
          <template slot="label">
            <span>
              <i class="el-icon-cpu"></i>
              开发人员
            </span>
          </template>
          <DeveloperTab ref="developerTab" />
        </el-tab-pane>
        
        <el-tab-pane label="测试人员" name="tester">
          <template slot="label">
            <span>
              <i class="el-icon-view"></i>
              测试人员
            </span>
          </template>
          <TesterTab ref="testerTab" />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import DeveloperTab from './components/DeveloperTab.vue'
import TesterTab from './components/TesterTab.vue'

export default {
  name: 'TestSystemMember',
  components: {
    DeveloperTab,
    TesterTab
  },
  data() {
    return {
      activeTab: 'developer'
    }
  },
  mounted() {
    // 强制重新计算布局，解决第一次加载时宽度不够的问题
    this.$nextTick(() => {
      window.dispatchEvent(new Event('resize'));
    });
  },
  methods: {
    handleTabClick(tab) {
      // 可以在这里添加页签切换时的逻辑
      // 比如刷新数据、重置状态等
    }
  }
}
</script>

<style scoped>
.system-member-container {
  padding: 10px;
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
}

.page-title {
  font-size: 18px;
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

/* 页签样式优化 */
::v-deep .el-tabs--card > .el-tabs__header {
  border-bottom: 1px solid #e4e7ed;
  margin: 0 0 15px 0;
}

::v-deep .el-tabs--card > .el-tabs__header .el-tabs__nav {
  border: 1px solid #e4e7ed;
  border-bottom: none;
  border-radius: 4px 4px 0 0;
}

::v-deep .el-tabs--card > .el-tabs__header .el-tabs__item {
  border-bottom: 1px solid #e4e7ed;
  border-left: 1px solid #e4e7ed;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

::v-deep .el-tabs--card > .el-tabs__header .el-tabs__item:first-child {
  border-left: none;
}

::v-deep .el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
  border-bottom-color: #fff;
  background-color: #fff;
  color: #409eff;
}

::v-deep .el-tabs--card > .el-tabs__header .el-tabs__item:hover {
  color: #409eff;
}

/* 页签内容区域 */
::v-deep .el-tabs__content {
  padding: 0;
}

/* 页签图标样式 */
.el-tabs__item span i {
  margin-right: 5px;
  font-size: 14px;
}

/* 确保卡片占满宽度 */
::v-deep .el-card {
  width: 100%;
  min-width: 100%;
  box-sizing: border-box;
}

/* 确保页签内容区域占满宽度 */
::v-deep .el-tabs__content {
  width: 100%;
  min-width: 100%;
}
</style>
