<template>
  <div class="microservice-query">
    <el-card>
      <div slot="header" class="card-header">
        <span class="title">管理台微服务实例查询</span>
      </div>

      <div class="main-layout">
        <!-- 左侧：操作区域 -->
        <div class="query-section">
          <div class="process-content">
            <!-- 环境选择区域 -->
            <div class="env-select">
              <el-form :model="formData" label-width="100px" style="max-width: 800px;">
                <el-form-item label="环境:" prop="env">
                  <el-select
                    v-model="formData.env"
                    placeholder="请选择查询环境"
                    clearable
                    @change="handleEnvChange"
                  >
                    <el-option
                      v-for="item in environments"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="微服务编码:" style="width: 100%;">
                  <el-input
                    v-model="formData.codeProgram"
                    placeholder="输入微服务编码，多个用空格隔开"
                    @keyup.enter.native="handleSearch"
                    clearable
                    :disabled="isSearching || !formData.env"
                    style="width: 100%;"
                  >
                    <i slot="prefix" class="el-icon-search"></i>
                  </el-input>
                </el-form-item>
              </el-form>
            </div>

            <div v-if="isSearching" class="processing-status">
              <el-alert title="查询处理中......" type="info" :closable="false" show-icon></el-alert>
            </div>

            <div v-if="processResult && !isSearching" class="process-result">
              <el-alert :title="processResult.message" :type="processResult.type" :closable="false" show-icon></el-alert>
            </div>

            <div v-if="isShow && !isSearching" class="result-summary">
              <div class="smartweb-link">
                <span>管理台：</span>
                <a :href="smartwebUrl" target="_blank">{{ smartwebUrl }}</a>
              </div>
              <div class="service-info">
                <el-tag type="success" size="mini">{{ serviceName }}</el-tag>
                <span class="instance-count">共 {{ instanceCount }} 个实例</span>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="handleSearch" :disabled="!canSubmit || isSearching" :loading="isSearching">查询</el-button>
            <el-button @click="handleReset" :disabled="isSearching">重置</el-button>
          </div>
        </div>

        <!-- 右侧：结果表格 -->
        <div class="result-section-full">
          <div class="result-section">
            <div class="result-header">
              <span v-if="isShow" class="result-title">查询结果</span>
            </div>
            <div class="result-output" ref="resultContainer">
              <el-table
                v-if="isShow && tableData.length > 0"
                :data="tableData"
                style="width: 100%"
                :row-class-name="tableRowClassName"
                border stripe size="small"
              >
                <el-table-column prop="ip" label="节点IP" min-width="180">
                  <template slot-scope="scope">
                    <span :class="{ 'placeholder-text': isTitleRow(scope.row) }">{{ scope.row.ip }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="port" label="监听端口" width="120"></el-table-column>
                <el-table-column prop="instIpPortStat" label="端口是否可用" width="140">
                  <template slot-scope="scope">
                    <el-tag v-if="!isTitleRow(scope.row)" :type="scope.row.instIpPortStat === '可用' ? 'success' : 'danger'" size="mini">
                      {{ scope.row.instIpPortStat }}
                    </el-tag>
                    <span v-else style="color: #c0c4cc;">- - -</span>
                  </template>
                </el-table-column>
              </el-table>
              <div v-else-if="isShow" class="empty-state">
                <i class="el-icon-warning-outline"></i>
                <p>未找到实例数据</p>
              </div>
              <div v-else class="empty-state">
                <i class="el-icon-search"></i>
                <p>选择环境并输入微服务编码后点击查询</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
  .microservice-query { padding: 20px; }
  .card-header { display: flex; justify-content: space-between; align-items: center; }
  .title { font-size: 18px; font-weight: 600; color: #303133; }
  .main-layout { display: flex; flex-direction: column; gap: 12px; }
  .query-section { width: 100%; display: flex; flex-direction: column; }
  .process-content { padding: 6px 0; }
  .action-buttons { display: flex; gap: 10px; align-items: center; margin-top: 6px; flex-wrap: wrap; }
  .process-result, .processing-status { margin-top: 6px; }
  .env-select { margin-bottom: 0; }
  .env-select .el-form-item { margin-bottom: 12px; }
  .env-select .el-form-item:last-child { margin-bottom: 0; }
  .result-summary { margin-top: 10px; padding: 10px 12px; background-color: #f5f7fa; border-radius: 4px; border-left: 4px solid #409eff; }
  .smartweb-link { margin-bottom: 8px; font-size: 13px; }
  .smartweb-link a { color: #409eff; text-decoration: none; }
  .smartweb-link a:hover { text-decoration: underline; }
  .service-info { display: flex; align-items: center; gap: 10px; }
  .instance-count { font-size: 12px; color: #909399; }
  .placeholder-text { color: #c0c4cc; font-style: italic; }
  .result-section-full { width: 100%; border-top: 1px solid #ebeef5; padding-top: 12px; min-height: 300px; overflow-y: auto; max-height: calc(100vh - 260px); }
  .result-section { height: 100%; display: flex; flex-direction: column; }
  .result-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; min-height: 24px; }
  .result-title { font-size: 14px; font-weight: 600; color: #303133; }
  .result-output { flex: 1; background-color: #fff; border-radius: 4px; overflow-y: auto; height: calc(100vh - 320px); min-height: 300px; }
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #c0c4cc; }
  .empty-state i { font-size: 48px; margin-bottom: 15px; }
  .empty-state p { font-size: 14px; }
  .el-table .warning-row { background-color: rgba(230, 247, 255, 0.8); font-weight: 600; }
  @media screen and (max-width: 992px) {
    .result-section-full { border-left: none; border-top: 1px solid #ebeef5; padding-left: 0; padding-top: 20px; margin-top: 20px; max-height: none; overflow-y: visible; }
    .result-output { height: 400px; }
  }
</style>

<script>
import environmentListApi from '@/api/environment/environmentList'
import microservicesInstanceQueryApi from '@/api/tools/microservicesInstanceQuery'

export default {
  name: 'MicroserviceQuery',
  data() {
    return {
      formData: { env: '', codeProgram: '' },
      environments: [],
      isSearching: false,
      processResult: null,
      isShow: false,
      tableData: [],
      smartwebUrl: '',
      serviceName: '',
      instanceCount: 0
    }
  },
  computed: {
    canSubmit() {
      return this.formData.env && this.formData.codeProgram.trim() !== ''
    }
  },
  mounted() {
    this.loadEnvironments()
  },
  methods: {
    // 判断是否为标题行
    isTitleRow(row) {
      return row && row.ip && typeof row.ip === 'string' && row.ip.startsWith('---')
    },

    loadEnvironments() {
      const envSystem = JSON.parse(sessionStorage.getItem('envSystem'))
      if (envSystem && envSystem.length > 0) {
        this.environments = envSystem
        return
      }

      environmentListApi.getSmartwebList({ systemId: 'sys-003', serverName: '管理台' })
        .then(response => {
          let resData = null
          if (response && response.code === 20000 && response.data) {
            resData = response.data
          } else if (Array.isArray(response)) {
            resData = response
          }

          if (Array.isArray(resData) && resData.length > 0) {
            this.environments = resData.map(item => ({
              label: item.envName,
              value: item.ipAddress,
              linkAddress: item.linkAddress
            }))
            sessionStorage.setItem('envSystem', JSON.stringify(this.environments))
          } else {
            this.$message.warning('环境列表为空')
          }
        })
        .catch(err => {
          this.$message.error('环境列表加载失败: ' + (err.message || '未知错误'))
        })
    },

    handleEnvChange() {
      this.isShow = false
      this.tableData = []
      this.processResult = null
    },

    tableRowClassName({ row }) {
      return this.isTitleRow(row) ? 'warning-row' : ''
    },

    handleSearch() {
      if (this.isSearching) {
        this.$message.warning('请等待当前查询完成')
        return
      }
      if (!this.formData.env) {
        this.$message.info('请选择一个环境')
        return
      }
      const codeProgram = this.formData.codeProgram.trim()
      if (!codeProgram) {
        this.$message.info('请输入微服务编码')
        return
      }

      this.isSearching = true
      this.processResult = null
      this.isShow = false
      this.tableData = []
      this.smartwebUrl = ''
      this.serviceName = ''
      this.instanceCount = 0

      microservicesInstanceQueryApi.query_microservices_instance(this.formData.env, codeProgram)
        .then(response => {
          this.isSearching = false
          console.log('API 原始响应:', response)

          // 解析统一响应格式: {code: 20000, data: [...], message: "success"}
          let resData = null

          if (response && typeof response === 'object') {
            if (response.code === 20000 && response.data) {
              // 标准成功格式
              resData = response.data
              console.log('解析方式: 标准格式 response.data')
            } else if (Array.isArray(response.data)) {
              // data 是数组但 code 可能不是 20000
              resData = response.data
              console.log('解析方式: response.data 数组')
            } else if (Array.isArray(response)) {
              // 直接返回数组（兼容旧格式）
              resData = response
              console.log('解析方式: 直接数组')
            }
          }

          console.log('解析后的数据:', resData)

          if (resData && Array.isArray(resData) && resData.length > 0) {
            this.isShow = true
            this.tableData = resData

            // 分离标题行和数据行
            const titleRow = resData.find(item => this.isTitleRow(item))
            const dataRows = resData.filter(item => !this.isTitleRow(item))

            this.instanceCount = dataRows.length

            // 获取 URL
            this.smartwebUrl = titleRow?.smartwebUrl || dataRows.find(item => item.smartwebUrl)?.smartwebUrl || ''
            if (!this.smartwebUrl) {
              const selectedEnv = this.environments.find(e => e.value === this.formData.env)
              this.smartwebUrl = selectedEnv?.linkAddress || ''
            }

            // 获取服务名
            this.serviceName = titleRow?.serviceName || dataRows.find(item => item.serviceName)?.serviceName || ''

            this.processResult = {
              message: `查询成功，共找到 ${this.instanceCount} 个实例`,
              type: 'success'
            }
            this.$message.success('查询成功')
          } else if (resData && Array.isArray(resData) && resData.length === 0) {
            this.isShow = true
            this.processResult = { message: '未找到实例数据', type: 'warning' }
            this.$message.warning('未找到实例数据')
          } else {
            // 后端返回了错误码或异常格式
            const errorMsg = response?.message || '返回数据格式异常'
            this.processResult = { message: errorMsg, type: 'error' }
            this.$message.error(errorMsg)
          }
        })
        .catch(err => {
          this.isSearching = false
          this.isShow = false
          console.error('查询失败:', err)

          let errorMsg = '未知错误'
          if (err.response) {
            errorMsg = `服务器错误 ${err.response.status}: ${err.response.data?.message || err.response.statusText}`
          } else if (err.request) {
            errorMsg = '网络错误: 无法连接到服务器'
          } else if (err.message) {
            errorMsg = err.message
          }

          this.processResult = { message: '查询失败: ' + errorMsg, type: 'error' }
          this.$message.error(this.processResult.message)
        })
    },

    handleReset() {
      this.formData.env = ''
      this.formData.codeProgram = ''
      this.isShow = false
      this.tableData = []
      this.smartwebUrl = ''
      this.serviceName = ''
      this.instanceCount = 0
      this.processResult = null
      this.$message.info('已重置')
    }
  }
}
</script>
