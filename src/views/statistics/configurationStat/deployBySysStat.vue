<template>
  <div class="deploy-by-sys-stat">
    <!-- 查询条件 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-date-picker
            v-model="searchModel.startDate"
            type="date"
            placeholder="开始日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            size="small"
            style="width: 100%;">
          </el-date-picker>
          <div style="margin-top: 8px;">
            <el-tag size="small" @click="quickDate(7)" style="margin-right: 8px; cursor: pointer;">近7天</el-tag>
            <el-tag size="small" @click="quickDate(30)" style="margin-right: 8px; cursor: pointer;">近30天</el-tag>
            <el-tag size="small" @click="quickDateThisMonth" style="cursor: pointer;">本月</el-tag>
          </div>
        </el-col>
        <el-col :span="6">
          <el-date-picker
            v-model="searchModel.endDate"
            type="date"
            placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            size="small"
            style="width: 100%;">
          </el-date-picker>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="searchModel.systemId"
            placeholder="系统"
            clearable
            filterable
            size="small"
            style="width: 100%;">
            <el-option
              v-for="system in systemList"
              :key="system.systemId"
              :label="system.systemName"
              :value="system.systemId">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button @click="handleQuery" type="primary" size="small" icon="el-icon-search">查询</el-button>
          <el-button @click="handleReset" type="info" size="small" icon="el-icon-refresh">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 统计表格 -->
    <el-card class="stat-card" style="margin-top: 20px;">
      <div slot="header">
        <span>各系统发版数统计</span>
      </div>
      <el-table
        :data="displayData"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        :summary-method="getSummaries"
        show-summary>
        <el-table-column prop="systemName" label="系统" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="sitCount" label="SIT发版数" width="150" align="center"></el-table-column>
        <el-table-column prop="patCount" label="PAT发版数" width="150" align="center"></el-table-column>
      </el-table>
    </el-card>

    <!-- 统计图表 -->
    <el-card class="stat-card" style="margin-top: 20px;">
      <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
        <span>发版数统计图表</span>
        <el-button
          v-if="displayData.length > 0"
          type="text"
          size="small"
          icon="el-icon-download"
          @click="downloadChart">
          导出PNG
        </el-button>
      </div>
      <div class="chart-container" v-if="displayData.length > 0">
        <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
      </div>
      <div v-else class="empty-chart">
        <div class="empty-content">
          <i class="el-icon-document" style="font-size: 48px; color: #C0C4CC;"></i>
          <p class="empty-text">暂无数据</p>
          <p class="empty-tip">请选择日期区间或更换条件后查询</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import deployBySysStatApi from '@/api/statistics/deployBySysStat'
import testSystemApi from '@/api/test/baseManage/testSystem'
import * as echarts from 'echarts'

// 常量定义
const SUMMARY_KEY = '合计'
const RESIZE_DEBOUNCE_DELAY = 200

// 错误消息映射
const ERROR_MESSAGE_MAP = {
  'timeout': '请求超时，请稍后重试',
  'Network Error': '网络连接失败，请检查网络设置',
  'ERR_CONNECTION_REFUSED': '无法连接到服务器，请检查后端服务是否运行',
  'ERR_NETWORK': '网络错误，请检查网络连接'
}

  export default {
  name: 'DeployBySysStat',
  data() {
    return {
      searchModel: {
        startDate: '',
        endDate: '',
        systemId: ''
      },
      systemList: [],
      rawStatData: [],
      loading: false,
      chartInstance: null,
      resizeTimer: null
    }
  },
  computed: {
    // 显示数据（排除合计行，用于表格和图表）
    displayData() {
      return this.rawStatData.filter(item => item.systemName !== SUMMARY_KEY)
    },
    // 合计行数据
    summaryRow() {
      return this.rawStatData.find(item => item.systemName === SUMMARY_KEY) || {
        systemName: SUMMARY_KEY,
        sitCount: 0,
        patCount: 0
      }
    }
  },
  created() {
    this.initDates()
    this.loadSystemList()
    this.handleQuery()
  },
  mounted() {
    // 不在这里初始化，等数据加载完成后再初始化
  },
  beforeDestroy() {
    this.cleanup()
  },
  deactivated() {
    // keep-alive 场景下的清理
    this.cleanup()
  },
  activated() {
    // keep-alive 场景下的重新初始化
    if (this.$refs.chartContainer && !this.chartInstance && this.displayData.length > 0) {
      this.$nextTick(() => {
        this.initChart()
      })
    }
  },
  watch: {
    displayData: {
      handler(newVal) {
        this.$nextTick(() => {
          // 如果数据存在但图表未初始化，先初始化图表
          if (newVal.length > 0 && !this.chartInstance && this.$refs.chartContainer) {
            this.initChart()
          } else if (this.chartInstance) {
            // 如果图表已初始化，更新图表
            this.updateChart()
          }
        })
      },
      deep: true
    }
  },
  methods: {
    // 初始化日期：开始日期默认为一周前，结束日期默认为当天
    initDates() {
      const today = new Date()
      const endDate = this.formatDate(today)
      
      // 计算一周前的日期（例如今天是周四，开始日期就是上周五）
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 7)
      const startDateStr = this.formatDate(startDate)
      
      this.searchModel.startDate = startDateStr
      this.searchModel.endDate = endDate
    },
    
    // 格式化日期为 yyyy-MM-dd
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 加载系统列表
    async loadSystemList() {
      try {
        const response = await testSystemApi.getTestSystemList({
          pageNo: 1,
          pageSize: 1000
        })
        if (response.code === 20000) {
          this.systemList = response.data?.rows || []
        }
      } catch (error) {
        console.error('加载系统列表失败:', error)
      }
    },
    
    // 查询
    handleQuery() {
      if (!this.searchModel.startDate || !this.searchModel.endDate) {
        this.$message.warning('请选择开始日期和结束日期')
        return
      }
      
      if (new Date(this.searchModel.startDate) > new Date(this.searchModel.endDate)) {
        this.$message.warning('开始日期不能晚于结束日期')
        return
      }
      
      this.getStatData()
    },
    
    // 重置
    handleReset() {
      this.initDates()
      this.searchModel.systemId = ''
      this.rawStatData = []
    },
    
    // 日期快捷选择
    quickDate(days) {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - days + 1)
      this.searchModel.startDate = this.formatDate(start)
      this.searchModel.endDate = this.formatDate(end)
    },
    
    // 本月快捷选择
    quickDateThisMonth() {
      const today = new Date()
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      this.searchModel.startDate = this.formatDate(start)
      this.searchModel.endDate = this.formatDate(today)
    },
    
    // 获取统计数据
    async getStatData() {
      this.loading = true
      try {
        const params = {
          startDate: this.searchModel.startDate,
          endDate: this.searchModel.endDate
        }
        if (this.searchModel.systemId) {
          params.systemId = this.searchModel.systemId
        }
        
        const response = await deployBySysStatApi.getDeployBySysStat(params)
        
        if (response.code === 20000 || response.code === 200) {
          // 处理响应数据，确保有合计行
          let data = response.data || response.rows || []
          
          // 前端兜底计算合计行，防止后端漏掉合计行
          // 若数据量很大，建议让后端算好合计，减少前端遍历
          const hasSummary = data.some(item => item.systemName === SUMMARY_KEY)
          if (!hasSummary && data.length > 0) {
            const summary = {
              systemName: SUMMARY_KEY,
              sitCount: data.reduce((sum, item) => sum + (item.sitCount || 0), 0),
              patCount: data.reduce((sum, item) => sum + (item.patCount || 0), 0)
            }
            data.push(summary)
          }
          
          this.rawStatData = data
        } else {
          this.$message.error(response.message || '获取统计数据失败')
          this.rawStatData = []
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
        const errorMessage = this.getErrorMessage(error)
        this.$message.error(errorMessage)
        this.rawStatData = []
      } finally {
        this.loading = false
      }
    },
    
    // 获取友好的错误消息
    getErrorMessage(error) {
      const errorMsg = error.message || error.toString() || '网络错误'
      
      // 查找匹配的错误关键字
      for (const [key, message] of Object.entries(ERROR_MESSAGE_MAP)) {
        if (errorMsg.includes(key)) {
          return `获取统计数据失败：${message}`
        }
      }
      
      return `获取统计数据失败：${errorMsg}`
    },
    
    // 表格合计行（前端兜底计算，防止后端漏掉合计行）
    getSummaries(param) {
      const { columns } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = SUMMARY_KEY
          return
        }
        const values = this.displayData.map(item => Number(item[column.property]))
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr)
            if (!isNaN(value)) {
              return prev + curr
            } else {
              return prev
            }
          }, 0)
        } else {
          sums[index] = 0
        }
      })
      return sums
    },
    
    // 初始化图表
    initChart() {
      if (!this.$refs.chartContainer) {
        console.warn('图表容器不存在，无法初始化图表')
        return
      }
      
      if (this.chartInstance) {
        // 如果图表已存在，先销毁
        this.chartInstance.dispose()
        this.chartInstance = null
      }
      
      try {
        this.chartInstance = echarts.init(this.$refs.chartContainer)
        this.updateChart()
        
        // 响应式调整（带 debounce）
        window.addEventListener('resize', this.handleResize)
      } catch (error) {
        console.error('初始化图表失败:', error)
        this.$message.error('图表初始化失败')
      }
    },
    
    // 更新图表
    updateChart() {
      if (!this.chartInstance || this.displayData.length === 0) return
      
      const systemNames = this.displayData.map(item => item.systemName)
      const sitCounts = this.displayData.map(item => item.sitCount || 0)
      const patCounts = this.displayData.map(item => item.patCount || 0)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['SIT发版数', 'PAT发版数'],
          top: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: systemNames,
          axisLabel: {
            rotate: systemNames.length > 5 ? 45 : 0,
            interval: 0
          }
        },
        yAxis: {
          type: 'value',
          name: '发版数'
        },
        series: [
          {
            name: 'SIT发版数',
            type: 'bar',
            data: sitCounts,
            itemStyle: {
              color: '#409EFF'
            },
            label: {
              show: true,
              position: 'top'
            }
          },
          {
            name: 'PAT发版数',
            type: 'bar',
            data: patCounts,
            itemStyle: {
              color: '#67C23A'
            },
            label: {
              show: true,
              position: 'top'
            }
          }
        ]
      }
      
      this.chartInstance.setOption(option, true)
    },
    
    // 窗口大小改变时调整图表（带 debounce，避免频繁 resize）
    handleResize() {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer)
      }
      this.resizeTimer = setTimeout(() => {
        if (this.chartInstance) {
          this.chartInstance.resize()
        }
      }, RESIZE_DEBOUNCE_DELAY)
    },
    
    // 导出图表为PNG
    downloadChart() {
      if (!this.chartInstance) {
        this.$message.warning('图表未初始化，无法导出')
        return
      }
      
      try {
        const url = this.chartInstance.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff'
        })
        const a = document.createElement('a')
        a.href = url
        a.download = `发版统计_${this.searchModel.startDate}_${this.searchModel.endDate}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        this.$message.success('图表导出成功')
      } catch (error) {
        console.error('导出图表失败:', error)
        this.$message.error('导出图表失败，请重试')
      }
    },
    
    // 清理资源
    cleanup() {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer)
        this.resizeTimer = null
      }
      window.removeEventListener('resize', this.handleResize)
      if (this.chartInstance) {
        this.chartInstance.dispose()
        this.chartInstance = null
      }
    }
  }
  }
</script>

<style scoped>
.deploy-by-sys-stat {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.chart-container {
  padding: 20px 0;
}

.empty-chart {
  padding: 60px 0;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-text {
  margin-top: 16px;
  color: #909399;
  font-size: 14px;
}

.empty-tip {
  margin-top: 8px;
  color: #C0C4CC;
  font-size: 12px;
}
</style>
