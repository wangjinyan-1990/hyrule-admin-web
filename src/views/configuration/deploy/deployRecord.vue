<template>
  <div>
    <!-- 搜索栏 -->
    <el-card id="search">
      <!-- 第一行：查询条件和查询、重置按钮 -->
      <el-row>
        <el-col :span="24">
          <el-input v-model="searchModel.systemName" placeholder="系统名称" size="small" style="width: 200px; margin-right: 10px;"></el-input>
          <el-date-picker
            v-model="searchModel.startDate"
            type="date"
            placeholder="开始日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            size="small"
            style="width: 140px; margin-right: 10px;">
          </el-date-picker>
          <el-date-picker
            v-model="searchModel.endDate"
            type="date"
            placeholder="截止日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            size="small"
            style="width: 140px; margin-right: 10px;">
          </el-date-picker>
          <el-select v-model="searchModel.testStage" placeholder="测试阶段" clearable size="small" style="width: 80px; margin-right: 10px;">
            <el-option label="SIT" value="SIT"></el-option>
            <el-option label="PAT" value="PAT"></el-option>
          </el-select>
          <el-input v-model="searchModel.sendTestInfo" placeholder="送测单信息" size="small" style="width: 150px; margin-right: 10px;"></el-input>
          <el-button @click="getDeployRecordList" type="primary" size="small" round icon="el-icon-search">查询</el-button>
          <el-button @click="resetSearch" type="info" size="small" round icon="el-icon-refresh">重置</el-button>
        </el-col>
      </el-row>
      <!-- 第二行：SIT发版和PAT发版按钮 -->
      <el-row style="margin-top: 10px;">
        <el-col :span="24" align="left">
          <el-button @click="handleSitDeploy" type="primary" size="small" icon="el-icon-edit">SIT发版</el-button>
          <el-button @click="handlePatDeploy" type="success" size="small" icon="el-icon-edit" style="margin-left: 10px;">PAT发版</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 结果栏 -->
    <el-card>
      <el-table :data="deployRecordList" stripe style="width: 100%" highlight-current-row class="deploy-record-table">
        <el-table-column type="index" width="55" label="序号"></el-table-column>
        <el-table-column prop="deployId" label="部署Id" width="80" v-if="false"></el-table-column>
        <el-table-column prop="systemName" label="系统" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="componentInfo" label="组件信息" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="testStage" label="测试阶段" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.testStage === 'SIT' ? 'primary' : 'success'" size="small">
              {{ scope.row.testStage }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="versionCode" label="版本号" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="recordNum" label="版本登记数量" width="100" align="center"></el-table-column>
        <el-table-column prop="codeList" label="代码清单" min-width="150">
          <template slot-scope="scope">
            <el-tooltip
              v-if="scope.row.codeList"
              :content="scope.row.codeList"
              placement="top"
              popper-class="code-list-tooltip"
              :disabled="!scope.row.codeList">
              <span
                @dblclick="handleCodeListDblClick(scope.row)"
                :style="{
                  cursor: 'pointer',
                  color: '#409EFF',
                  backgroundColor: scope.row.codeList ? '#f3e5f5' : 'transparent',
                  display: 'block',
                  padding: '0 5px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }">
                {{ scope.row.codeList || '-' }}
              </span>
            </el-tooltip>
            <span
              v-else
              :style="{
                display: 'block',
                padding: '0 5px'
              }">
              -
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="isRunSql" label="是否执行sql" width="80" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isRunSql ? 'success' : 'info'" size="small">
              {{ scope.row.isRunSql ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isUpdateConfig" label="是否更新配置" width="90" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isUpdateConfig ? 'success' : 'info'" size="small">
              {{ scope.row.isUpdateConfig ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sendTestInfo" label="送测单信息" width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="deployTime" label="部署时间点" width="160">
          <template slot-scope="scope">
            <span v-if="scope.row.deployTime">{{ formatDateTime(scope.row.deployTime) }}</span>
            <span v-else style="color: #999;">-</span>
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
      :total="total">
    </el-pagination>

    <!-- 代码清单弹窗 -->
    <el-dialog
      title="代码清单"
      :visible.sync="codeListDialogVisible"
      width="60%"
      :close-on-click-modal="false">
      <el-input
        v-model="codeListContent"
        type="textarea"
        :rows="15"
        readonly
        ref="codeListTextarea">
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button @click="codeListDialogVisible = false">关 闭</el-button>
        <el-button type="primary" @click="handleCopyCodeList">复 制</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style>
  .app-main{
    /* 边距 */
    padding: 10px;
  }

  #search .el-input{
    width: 200px;
    margin-right: 10px;
  }

  .el-card{
    /* 底部边距 */
    margin-bottom: 10px ;
  }

  /* 表格选中行高亮颜色 */
  .el-table__body tr.current-row > td {
    background-color: #b3d9ff !important;
  }

  /* 鼠标悬停时保持选中行的颜色不变 */
  .el-table__body tr.current-row:hover > td {
    background-color: #b3d9ff !important;
  }

  /* 未选中行的悬停效果 */
  .el-table__body tr:not(.current-row):hover > td {
    background-color: #f5f7fa !important;
  }

  /* 减小表格行高 - 使用更强的选择器 */
  .deploy-record-table th,
  .deploy-record-table td {
    height: 24px !important;
    line-height: 24px !important;
    padding: 0 !important;
    font-size: 12px !important;
    min-height: 24px !important;
    max-height: 24px !important;
  }

  .deploy-record-table .el-table__row {
    height: 24px !important;
    min-height: 24px !important;
    max-height: 24px !important;
  }

  .deploy-record-table .cell {
    padding: 0 5px !important;
    line-height: 24px !important;
    height: 24px !important;
  }

  /* 强制覆盖表格头部和主体的行高 */
  .deploy-record-table .el-table__header-wrapper .el-table th,
  .deploy-record-table .el-table__body-wrapper .el-table td {
    height: 24px !important;
    line-height: 24px !important;
    padding: 0 !important;
    min-height: 24px !important;
    max-height: 24px !important;
    font-size: 12px !important;
  }

  /* 强制设置表格行高 */
  .deploy-record-table tbody tr,
  .deploy-record-table thead tr {
    height: 24px !important;
    min-height: 24px !important;
    max-height: 24px !important;
  }

  /* 针对具体的列 */
  .deploy-record-table .el-table__header th,
  .deploy-record-table .el-table__body td {
    height: 24px !important;
    line-height: 24px !important;
    padding: 0 !important;
    font-size: 12px !important;
  }

  /* 标签样式 */
  .deploy-record-table .el-tag {
    font-size: 12px !important;
    height: 20px !important;
    line-height: 20px !important;
    padding: 0 5px !important;
  }

</style>

<style>
  /* 代码清单 tooltip 换行样式 */
  .code-list-tooltip {
    max-width: 500px !important;
    white-space: pre-wrap !important;
    word-break: break-all !important;
  }

  .code-list-tooltip .el-tooltip__popper {
    max-width: 500px !important;
  }
</style>

<script>
import deployRecordApi from '@/api/configuration/deploy/deployRecord'

export default {
  name: 'DeployRecord',
  data(){
    return{
      total: 0,
      searchModel: {
        pageNo: 1,
        pageSize: 10,
        systemName: '',
        startDate: '',
        endDate: '',
        testStage: '',
        sendTestInfo: ''
      },
      deployRecordList: [],
      codeListDialogVisible: false,
      codeListContent: ''
    }
  },

  created(){
    // 设置默认日期为当天
    const today = new Date()
    const todayStr = this.formatDate(today)
    this.searchModel.startDate = todayStr
    this.searchModel.endDate = todayStr

    this.getDeployRecordList()
  },

  methods:{
    // 格式化日期为 yyyy-MM-dd
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    // 格式化日期时间为 yyyy-MM-dd HH:mm:ss
    formatDateTime(dateTimeStr) {
      if (!dateTimeStr) return ''
      const date = new Date(dateTimeStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },

    handleSizeChange(pageSize){
      this.searchModel.pageSize = pageSize
      this.getDeployRecordList()
    },

    handleCurrentChange(pageNo){
      this.searchModel.pageNo = pageNo
      this.getDeployRecordList()
    },

    getDeployRecordList(){
      // 构建查询参数，按部署时间点倒序
      const params = {
        ...this.searchModel,
        orderBy: 'deployTime',
        orderDirection: 'DESC'
      }

      deployRecordApi.getDeployRecordList(params).then(response => {
        if (response.code === 20000) {
          this.deployRecordList = response.data.rows || []
          this.total = response.data.total || 0
        } else {
          this.$message.error(response.message || '获取发版登记列表失败')
        }
      }).catch(error => {
        this.$message.error('获取发版登记列表失败')
      })
    },

    resetSearch(){
      // 重置为当天日期
      const today = new Date()
      const todayStr = this.formatDate(today)

      this.searchModel.systemName = ''
      this.searchModel.startDate = todayStr
      this.searchModel.endDate = todayStr
      this.searchModel.testStage = ''
      this.searchModel.sendTestInfo = ''
      this.searchModel.pageNo = 1
      this.getDeployRecordList()
    },

    // 跳转到SIT发版页面
    handleSitDeploy(){
      this.$router.push('/configuration/deploy/sitDeploy')
    },

    // 跳转到PAT发版页面
    handlePatDeploy(){
      this.$router.push('/configuration/deploy/patDeploy')
    },

    // 双击代码清单
    handleCodeListDblClick(row) {
      this.codeListContent = row.codeList || ''
      this.codeListDialogVisible = true
    },

    // 复制代码清单
    handleCopyCodeList() {
      if (!this.codeListContent) {
        this.$message.warning('代码清单内容为空')
        return
      }

      // 使用 Clipboard API 复制
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.codeListContent).then(() => {
          this.$message.success('复制成功')
        }).catch(() => {
          // 如果 Clipboard API 失败，使用备用方法
          this.fallbackCopyText(this.codeListContent)
        })
      } else {
        // 备用复制方法
        this.fallbackCopyText(this.codeListContent)
      }
    },

    // 备用复制方法
    fallbackCopyText(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          this.$message.success('复制成功')
        } else {
          this.$message.error('复制失败，请手动复制')
        }
      } catch (err) {
        this.$message.error('复制失败，请手动复制')
      }
      document.body.removeChild(textArea)
    }
  }
}
</script>
