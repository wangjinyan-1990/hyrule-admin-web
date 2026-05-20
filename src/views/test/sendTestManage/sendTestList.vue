<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card id="search">
      <el-row>
        <el-col :span="24">
          <!-- 第一行：常用查询条件（收起时只显示这一行） -->
          <el-row style="margin-bottom: 10px;">
            <el-col :span="4">
              <el-select
                v-model="searchModel.sendTestType"
                placeholder="送测类型"
                clearable
                size="small"
              >
                <el-option label="新送测" :value="SEND_TEST_TYPE_1" />
                <el-option label="新送测(配合)" :value="SEND_TEST_TYPE_1_1" />
                <el-option label="PAT送测" :value="SEND_TEST_TYPE_2" />
                <el-option label="PAT送测(配合)" :value="SEND_TEST_TYPE_2_1" />
                <el-option label="缺陷送测" :value="SEND_TEST_TYPE_3" />
                <el-option label="缺陷送测(配合)" :value="SEND_TEST_TYPE_3_1" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-input
                v-model="searchModel.sendTestId"
                placeholder="送测单编号"
                size="small"
                clearable
              />
            </el-col>
            <el-col :span="4">
              <el-input
                v-model="searchModel.sendTestTitle"
                placeholder="送测标题"
                size="small"
                clearable
              />
            </el-col>
            <el-col :span="4">
              <el-input
                v-model="searchModel.workPackageId"
                placeholder="工作包编号"
                size="small"
                clearable
              />
            </el-col>
            <el-col :span="4">
              <el-input
                v-model="searchModel.workPackageName"
                placeholder="工作包名称"
                size="small"
                clearable
              />
            </el-col>
            <el-col :span="4" style="text-align: right;">
              <el-button
                @click="toggleMoreSearch"
                type="text"
                size="small"
                :icon="showMoreSearch ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
              >
                {{ showMoreSearch ? '收起' : '展开' }}
              </el-button>
              <el-button
                @click="getSendTestList"
                type="primary"
                size="small"
                round
                icon="el-icon-search"
              >
                查询
              </el-button>
              <el-button
                @click="resetSearch"
                type="info"
                size="small"
                round
                icon="el-icon-refresh"
              >
                重置
              </el-button>
            </el-col>
          </el-row>

          <!-- 展开时显示的更多查询条件 -->
          <el-row v-show="showMoreSearch">
            <el-col :span="4">
              <el-select
                v-model="searchModel.sendTestState"
                placeholder="送测状态"
                clearable
                size="small"
              >
                <el-option label="待送测" value="WAIT_SEND" />
                <el-option label="待联测" value="WAIT_LIAN" />
                <el-option label="测试中" value="TESTING" />
                <el-option label="已测试" value="FINISHED" />
                <el-option label="已退回" value="REJECTED" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-input
                v-model="searchModel.requireCode"
                placeholder="需求编号"
                size="small"
                clearable
              />
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchModel.deployEnv"
                placeholder="环境"
                clearable
                size="small"
              >
                <el-option label="UAT1" value="UAT1" />
                <el-option label="UAT2" value="UAT2" />
                <el-option label="UAT3" value="UAT3" />
                <el-option label="UAT5" value="UAT5" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-input
                v-model="searchModel.systemName"
                placeholder="所属系统"
                size="small"
                clearable
              />
            </el-col>
            <el-col :span="4">
              <el-input
                v-model="searchModel.testManagerName"
                placeholder="测试负责人"
                size="small"
                clearable
              />
            </el-col>
            <el-col :span="4">
              <el-input
                v-model="searchModel.devManagerName"
                placeholder="项目经理"
                size="small"
                clearable
              />
            </el-col>
          </el-row>

          <el-row v-show="showMoreSearch" style="margin-top: 10px;">
            <el-col :span="4">
              <el-select
                v-model="searchModel.sendTestScope"
                placeholder="送测范围"
                clearable
                size="small"
              >
                <el-option label="功能测试" value="1" />
                <el-option label="非功能测试" value="2" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-input
                v-model="searchModel.funTestImpactScope"
                placeholder="功能测试影响范围"
                size="small"
                clearable
              />
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchModel.isCeShiKeTest"
                placeholder="是否需测试科测试"
                clearable
                size="small"
              >
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select
                v-model="searchModel.isRelatedSendTest"
                placeholder="是否关联送测"
                clearable
                size="small"
              >
                <el-option label="是" :value="1" />
                <el-option label="否" :value="0" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-input
                v-model="searchModel.searchCondition"
                placeholder="查询条件"
                size="small"
                clearable
              />
            </el-col>
            <el-col :span="4">
              <el-date-picker
                v-model="sendTestDateRange"
                type="daterange"
                size="small"
                value-format="yyyy-MM-dd"
                range-separator="-"
                start-placeholder="送测日期（起）"
                end-placeholder="送测日期（止）"
                style="width: 100%;"
                @change="handleDateRangeChange"
              />
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-card>

    <!-- 列表 -->
    <el-card>
      <el-table
        :data="sendTestList"
        stripe
        border
        style="width: 100%"
        height="500"
        v-loading="loading"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="sendTestId" label="送测编号" width="140" show-overflow-tooltip />
        <el-table-column prop="deployEnv" label="环境" width="80" />
        <el-table-column prop="sendTestType" label="送测类型" width="120">
          <template slot-scope="scope">
            {{ getSendTestTypeText(scope.row.sendTestType) }}
          </template>
        </el-table-column>
        <el-table-column prop="sendTestTitle" label="送测标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sendTestState" label="送测状态" width="100">
          <template slot-scope="scope">
            <el-tag size="small">{{ getSendTestStateText(scope.row.sendTestState) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isRelatedSendTest" label="是否关联送测" width="110">
          <template slot-scope="scope">
            <span>{{ scope.row.isRelatedSendTest ? '是' : '否' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="devManagerName" label="项目经理" width="120" show-overflow-tooltip />
        <el-table-column prop="sendTestUserName" label="送测人" width="120" show-overflow-tooltip />
        <el-table-column prop="curNodeName" label="当前节点" width="120" show-overflow-tooltip />
        <el-table-column
          prop="curNodeResponsibleName"
          label="节点责任人"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column
          prop="systemTestManagerName"
          label="测试线负责人"
          width="120"
          show-overflow-tooltip
        />
        <el-table-column prop="testManagerName" label="测试负责人" width="120" show-overflow-tooltip />
        <el-table-column
          prop="configurationPeopleNames"
          label="配置人员"
          width="160"
          show-overflow-tooltip
        />
        <el-table-column prop="sendTestTime" label="送测日期" width="160">
          <template slot-scope="scope">
            <span>{{ formatDateTime(scope.row.sendTestTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="searchModel.pageNo"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="searchModel.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    />
  </div>
</template>

<script>
import sendTestApi from '@/api/test/sendTestManage/sendTest'

export default {
  name: 'SendTestList',
  data() {
    return {
      // 送测类型常量
      SEND_TEST_TYPE_1: '1',
      SEND_TEST_TYPE_1_1: '1-1',
      SEND_TEST_TYPE_2: '2',
      SEND_TEST_TYPE_2_1: '2-1',
      SEND_TEST_TYPE_3: '3',
      SEND_TEST_TYPE_3_1: '3-1',

      loading: false,
      total: 0,
      showMoreSearch: false,
      sendTestDateRange: [],
      searchModel: {
        pageNo: 1,
        pageSize: 10,
        // 查询条件字段
        sendTestType: '',
        sendTestId: '',
        sendTestTitle: '',
        sendTestState: '',
        systemId: '',
        systemName: '',
        requireCode: '',
        deployEnv: '',
        systemTestManagerId: '',
        systemTestManagerName: '',
        systemDevManagerId: '',
        devManagerName: '',
        sendTestScope: '',
        funTestImpactScope: '',
        isCeShiKeTest: '',
        isRelatedSendTest: '',
        relatePATSendTestId: '',
        remark: '',
        searchCondition: '',
        workPackageId: '',
        workPackageName: '',
        workPackageState: '',
        sendTestDateStart: '',
        sendTestDateEnd: ''
      },
      sendTestList: []
    }
  },
  created() {
    this.getSendTestList()
  },
  methods: {
    // 展开/收起更多查询条件
    toggleMoreSearch() {
      this.showMoreSearch = !this.showMoreSearch
    },
    // 日期范围变化
    handleDateRangeChange(val) {
      if (val && val.length === 2) {
        this.searchModel.sendTestDateStart = val[0]
        this.searchModel.sendTestDateEnd = val[1]
      } else {
        this.searchModel.sendTestDateStart = ''
        this.searchModel.sendTestDateEnd = ''
      }
    },
    // 获取送测单列表
    getSendTestList() {
      this.loading = true
      const params = { ...this.searchModel }
      sendTestApi
        .getSendTestList(params)
        .then(response => {
          if (response && response.code === 20000 && response.data) {
            this.sendTestList = response.data.rows || []
            this.total = response.data.total || 0
          } else if (response && response.data && Array.isArray(response.data.rows)) {
            this.sendTestList = response.data.rows
            this.total = response.data.total || 0
          } else if (response && Array.isArray(response.rows)) {
            this.sendTestList = response.rows
            this.total = response.total || 0
          } else {
            this.sendTestList = []
            this.total = 0
          }
        })
        .catch(() => {
          this.sendTestList = []
          this.total = 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 分页大小改变
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize
      this.getSendTestList()
    },
    // 当前页改变
    handleCurrentChange(pageNo) {
      this.searchModel.pageNo = pageNo
      this.getSendTestList()
    },
    // 重置查询
    resetSearch() {
      this.searchModel = {
        pageNo: 1,
        pageSize: 10,
        sendTestType: '',
        sendTestId: '',
        sendTestTitle: '',
        sendTestState: '',
        systemId: '',
        systemName: '',
        requireCode: '',
        deployEnv: '',
        systemTestManagerId: '',
        systemTestManagerName: '',
        systemDevManagerId: '',
        devManagerName: '',
        sendTestScope: '',
        funTestImpactScope: '',
        isCeShiKeTest: '',
        isRelatedSendTest: '',
        relatePATSendTestId: '',
        remark: '',
        searchCondition: '',
        workPackageId: '',
        workPackageName: '',
        workPackageState: '',
        sendTestDateStart: '',
        sendTestDateEnd: ''
      }
      this.sendTestDateRange = []
      this.getSendTestList()
    },
    // 送测类型文本
    getSendTestTypeText(type) {
      const map = {
        [this.SEND_TEST_TYPE_1]: '新送测',
        [this.SEND_TEST_TYPE_1_1]: '新送测(配合)',
        [this.SEND_TEST_TYPE_2]: 'PAT送测',
        [this.SEND_TEST_TYPE_2_1]: 'PAT送测(配合)',
        [this.SEND_TEST_TYPE_3]: '缺陷送测',
        [this.SEND_TEST_TYPE_3_1]: '缺陷送测(配合)'
      }
      return map[type] || type || ''
    },
    // 送测状态文本
    getSendTestStateText(state) {
      const map = {
        WAIT_SEND: '待送测',
        WAIT_LIAN: '待联测',
        TESTING: '测试中',
        FINISHED: '已测试',
        REJECTED: '已退回'
      }
      return map[state] || state || ''
    },
    // 时间格式化
    formatDateTime(dateTime) {
      if (!dateTime) return ''
      const date = new Date(dateTime)
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const hh = String(date.getHours()).padStart(2, '0')
      const mm = String(date.getMinutes()).padStart(2, '0')
      const ss = String(date.getSeconds()).padStart(2, '0')
      return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
    }
  }
}
</script>

<style scoped>
.page-container {
  padding: 10px;
}

#search .el-input,
#search .el-select {
  width: 100%;
}

.el-card {
  margin-bottom: 10px;
}
</style>


