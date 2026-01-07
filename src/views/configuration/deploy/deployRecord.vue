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
          <el-input v-model="searchModel.sendTestCode" placeholder="送测单编号" size="small" style="width: 150px; margin-right: 10px;"></el-input>
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
      <el-table 
        :data="deployRecordList" 
        stripe 
        style="width: 100%" 
        highlight-current-row>
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
        <el-table-column prop="versionCode" label="版本号" width="120" show-overflow-tooltip></el-table-column>
        <el-table-column prop="recordNum" label="版本登记数量" width="120" align="center"></el-table-column>
        <el-table-column prop="codeList" label="代码清单" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="isRunSql" label="是否执行sql" width="110" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isRunSql ? 'success' : 'info'" size="small">
              {{ scope.row.isRunSql ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isUpdateConfig" label="是否更新配置" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isUpdateConfig ? 'success' : 'info'" size="small">
              {{ scope.row.isUpdateConfig ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sendTestCode" label="送测单编号" width="150" show-overflow-tooltip></el-table-column>
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
        sendTestCode: ''
      },
      deployRecordList: []
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
      this.searchModel.sendTestCode = ''
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
    }
  }
}
</script>
