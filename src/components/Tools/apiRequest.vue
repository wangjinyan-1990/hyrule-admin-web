<template>
  <div class="api-request-container">
    <!-- 请求配置区域 -->
    <div class="request-section">
      <!-- 请求行 -->
      <div class="request-line">
        <el-select v-model="requestMethod" class="method-select" size="small">
          <el-option label="GET" value="GET"></el-option>
          <el-option label="POST" value="POST"></el-option>
          <el-option label="PUT" value="PUT"></el-option>
          <el-option label="DELETE" value="DELETE"></el-option>
          <el-option label="PATCH" value="PATCH"></el-option>
          <el-option label="HEAD" value="HEAD"></el-option>
          <el-option label="OPTIONS" value="OPTIONS"></el-option>
        </el-select>
        <el-input
          v-model="requestUrl"
          class="url-input"
          placeholder="请输入请求URL"
          size="small"
        ></el-input>
        <el-dropdown trigger="click" class="send-dropdown">
          <el-button type="primary" size="small" :loading="sending" @click="sendRequest">
            Send
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="sendRequest">发送请求</el-dropdown-item>
            <el-dropdown-item @click.native="clearRequest">清空请求</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>

      <!-- 标签页 -->
      <div class="tabs-wrapper">
        <el-tabs v-model="activeTab" class="request-tabs">
          <el-tab-pane name="headers">
            <span slot="label">
              Headers
              <el-badge
                v-if="enabledHeadersCount > 0"
                :value="enabledHeadersCount"
                class="header-badge"
              ></el-badge>
            </span>
          <div class="headers-content">
            <el-table :data="headers" border size="small" class="headers-table">
              <el-table-column width="50" align="center">
                <template slot-scope="scope">
                  <el-checkbox
                    v-model="scope.row.enabled"
                    @change="updateHeadersCount"
                  ></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column prop="key" label="Key" min-width="150">
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.key"
                    placeholder="New key"
                    size="small"
                    @input="updateHeadersCount"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="Value" min-width="200">
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.value"
                    placeholder="Value"
                    size="small"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="description" label="Description" min-width="150">
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.description"
                    placeholder="Description"
                    size="small"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column width="80" align="center">
                <template slot-scope="scope">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    circle
                    @click="removeHeader(scope.$index)"
                  ></el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="add-header-btn">
              <el-button size="small" icon="el-icon-plus" @click="addHeader">添加Header</el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="params">
          <span slot="label">
            Params
            <el-badge
              v-if="enabledParamsCount > 0"
              :value="enabledParamsCount"
              class="header-badge"
            ></el-badge>
          </span>
          <div class="params-content">
            <el-table :data="params" border size="small" class="params-table">
              <el-table-column width="50" align="center">
                <template slot-scope="scope">
                  <el-checkbox
                    v-model="scope.row.enabled"
                    @change="updateParamsCount"
                  ></el-checkbox>
                </template>
              </el-table-column>
              <el-table-column prop="key" label="Key" min-width="150">
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.key"
                    placeholder="New key"
                    size="small"
                    @input="updateParamsCount"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column prop="value" label="Value" min-width="200">
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.value"
                    placeholder="Value"
                    size="small"
                  ></el-input>
                </template>
              </el-table-column>
              <el-table-column width="80" align="center">
                <template slot-scope="scope">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    circle
                    @click="removeParam(scope.$index)"
                  ></el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="add-param-btn">
              <el-button size="small" icon="el-icon-plus" @click="addParam">添加参数</el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="body">
          <span slot="label">
            Body
            <span v-if="hasBodyContent" class="body-dot"></span>
          </span>
          <div class="body-content">
            <div class="body-type-selector">
              <el-radio-group v-model="bodyType" size="small">
                <el-radio-button label="form-data">form-data</el-radio-button>
                <el-radio-button label="x-www-form-urlencoded">x-www-form-urlencoded</el-radio-button>
                <el-radio-button label="raw">raw</el-radio-button>
                <el-radio-button label="binary">binary</el-radio-button>
              </el-radio-group>
              <el-select
                v-if="bodyType === 'raw'"
                v-model="rawContentType"
                class="raw-content-type"
                size="small"
              >
                <el-option label="JSON (application/json)" value="application/json"></el-option>
                <el-option label="Text (text/plain)" value="text/plain"></el-option>
                <el-option label="XML (application/xml)" value="application/xml"></el-option>
                <el-option label="HTML (text/html)" value="text/html"></el-option>
              </el-select>
            </div>

            <!-- form-data 和 x-www-form-urlencoded -->
            <div v-if="bodyType === 'form-data' || bodyType === 'x-www-form-urlencoded'" class="form-body">
              <el-table :data="formData" border size="small" class="form-data-table">
                <el-table-column width="50" align="center">
                  <template slot-scope="scope">
                    <el-checkbox v-model="scope.row.enabled"></el-checkbox>
                  </template>
                </el-table-column>
                <el-table-column prop="key" label="Key" min-width="150">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.key" placeholder="New key" size="small"></el-input>
                  </template>
                </el-table-column>
                <el-table-column prop="value" label="Value" min-width="200">
                  <template slot-scope="scope">
                    <el-input
                      v-if="bodyType === 'form-data' && scope.row.type === 'file'"
                      type="file"
                      size="small"
                      @change="handleFileChange(scope.$index, $event)"
                    ></el-input>
                    <el-input
                      v-else
                      v-model="scope.row.value"
                      placeholder="Value"
                      size="small"
                    ></el-input>
                  </template>
                </el-table-column>
                <el-table-column
                  v-if="bodyType === 'form-data'"
                  prop="type"
                  label="Type"
                  width="120"
                >
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.type" size="small">
                      <el-option label="Text" value="text"></el-option>
                      <el-option label="File" value="file"></el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column width="80" align="center">
                  <template slot-scope="scope">
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      size="mini"
                      circle
                      @click="removeFormData(scope.$index)"
                    ></el-button>
                  </template>
                </el-table-column>
              </el-table>
              <div class="add-form-data-btn">
                <el-button size="small" icon="el-icon-plus" @click="addFormData">添加字段</el-button>
              </div>
            </div>

            <!-- raw body -->
            <div v-if="bodyType === 'raw'" class="raw-body">
              <div class="code-editor-wrapper">
                <div class="line-numbers">
                  <div
                    v-for="(line, index) in rawBodyLines"
                    :key="index"
                    class="line-number"
                  >{{ index + 1 }}</div>
                </div>
                <textarea
                  v-model="rawBody"
                  class="code-editor-textarea"
                  placeholder="请输入请求体内容..."
                  @input="updateRawBodyLines"
                ></textarea>
              </div>
            </div>

            <!-- binary body -->
            <div v-if="bodyType === 'binary'" class="binary-body">
              <el-upload
                class="binary-upload"
                :auto-upload="false"
                :on-change="handleBinaryFileChange"
                :file-list="binaryFileList"
              >
                <el-button size="small" type="primary">选择文件</el-button>
                <div slot="tip" class="el-upload__tip">只能上传单个文件</div>
              </el-upload>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      </div>
    </div>

    <!-- 响应区域 -->
    <div class="response-section">
      <div class="response-header">
        <span class="response-label">Response</span>
      </div>
      <div class="response-content">
        <div v-if="responseData === null && !responseStatus" class="empty-response">
          <i class="el-icon-document"></i>
          <p>点击 Send 按钮发送请求，响应将显示在这里</p>
        </div>
        <div v-else class="response-data">
          <div class="response-status">
            <el-tag :type="responseStatusType" size="small">
              {{ responseStatus }}
            </el-tag>
            <span class="response-time" v-if="responseTime">
              耗时: {{ responseTime }}ms
            </span>
            <div class="response-actions">
              <el-button size="mini" @click="clearResponse">清空</el-button>
              <el-button size="mini" @click="copyResponse">复制</el-button>
            </div>
          </div>
          <el-tabs v-model="responseActiveTab" class="response-tabs">
            <el-tab-pane label="Body" name="body">
              <div class="response-body-wrapper">
                <div class="line-numbers">
                  <div
                    v-for="(line, index) in responseBodyLines"
                    :key="index"
                    class="line-number"
                  >{{ index + 1 }}</div>
                </div>
                <pre class="response-body">{{ formattedResponseBody }}</pre>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Headers" name="headers">
              <el-table :data="responseHeaders" border size="small" class="response-headers-table">
                <el-table-column prop="key" label="Key" min-width="200"></el-table-column>
                <el-table-column prop="value" label="Value" min-width="300" show-overflow-tooltip></el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios'

    export default {
  name: 'ApiRequest',
  data() {
    return {
      requestMethod: 'POST',
      requestUrl: 'http://localhost:8888/user/login',
      activeTab: 'headers',
      sending: false,
      headers: [
        {
          enabled: true,
          key: 'Content-Type',
          value: 'application/json',
          description: ''
        }
      ],
      enabledHeadersCount: 1,
      params: [],
      enabledParamsCount: 0,
      bodyType: 'raw',
      rawContentType: 'application/json',
      rawBody: '{\n  "username":"zhangsan",\n  "password": "123456"\n}',
      rawBodyLines: [1, 2, 3, 4],
      formData: [],
      binaryFileList: [],
      responseData: null,
      responseStatus: '',
      responseStatusType: 'info',
      responseTime: null,
      responseActiveTab: 'body',
      responseHeaders: []
    }
  },
  computed: {
    hasBodyContent() {
      if (this.bodyType === 'raw') {
        return this.rawBody.trim().length > 0
      } else if (this.bodyType === 'form-data' || this.bodyType === 'x-www-form-urlencoded') {
        return this.formData.some(item => item.enabled && item.key)
      } else if (this.bodyType === 'binary') {
        return this.binaryFileList.length > 0
      }
      return false
    },
    formattedResponseBody() {
      if (!this.responseData && this.responseData !== 0 && this.responseData !== false) return ''
      try {
        let data = this.responseData
        if (typeof data === 'string') {
          // 尝试解析 JSON
          try {
            const parsed = JSON.parse(data)
            return JSON.stringify(parsed, null, 2)
          } catch (e) {
            // 如果不是 JSON，直接返回字符串
            return data
          }
        } else if (typeof data === 'object') {
          return JSON.stringify(data, null, 2)
        } else {
          return String(data)
        }
      } catch (e) {
        return String(this.responseData || '')
      }
    },
    responseBodyLines() {
      const body = this.formattedResponseBody
      if (!body) return []
      const lines = String(body).split('\n')
      return lines
    }
  },
  methods: {
    updateHeadersCount() {
      this.enabledHeadersCount = this.headers.filter(h => h.enabled && h.key).length
    },
    addHeader() {
      this.headers.push({
        enabled: true,
        key: '',
        value: '',
        description: ''
      })
    },
    removeHeader(index) {
      this.headers.splice(index, 1)
      this.updateHeadersCount()
    },
    updateParamsCount() {
      this.enabledParamsCount = this.params.filter(p => p.enabled && p.key).length
    },
    addParam() {
      this.params.push({
        enabled: true,
        key: '',
        value: ''
      })
    },
    removeParam(index) {
      this.params.splice(index, 1)
      this.updateParamsCount()
    },
    addFormData() {
      this.formData.push({
        enabled: true,
        key: '',
        value: '',
        type: 'text'
      })
    },
    removeFormData(index) {
      this.formData.splice(index, 1)
    },
    handleFileChange(index, event) {
      const file = event.target.files[0]
      if (file) {
        this.formData[index].value = file.name
        this.formData[index].file = file
      }
    },
    handleBinaryFileChange(file, fileList) {
      this.binaryFileList = fileList
    },
    updateRawBodyLines() {
      const lines = this.rawBody.split('\n').length
      this.rawBodyLines = Array.from({ length: lines }, (_, i) => i + 1)
    },
    clearRequest() {
      this.requestUrl = ''
      this.headers = [
        {
          enabled: true,
          key: 'Content-Type',
          value: 'application/json',
          description: ''
        }
      ]
      this.updateHeadersCount()
      this.params = []
      this.rawBody = ''
      this.updateRawBodyLines()
      this.formData = []
      this.binaryFileList = []
      this.clearResponse()
    },
    clearResponse() {
      this.responseData = null
      this.responseStatus = ''
      this.responseStatusType = 'info'
      this.responseTime = null
      this.responseHeaders = []
      this.responseActiveTab = 'body'
    },
    copyResponse() {
      let contentToCopy = ''
      
      if (this.responseActiveTab === 'body') {
        // 复制 Body 内容
        if (!this.formattedResponseBody && this.formattedResponseBody !== 0 && this.formattedResponseBody !== false) {
          this.$message.warning('没有可复制的内容')
          return
        }
        contentToCopy = this.formattedResponseBody
      } else if (this.responseActiveTab === 'headers') {
        // 复制 Headers 内容
        if (!this.responseHeaders || this.responseHeaders.length === 0) {
          this.$message.warning('没有可复制的内容')
          return
        }
        // 格式化为键值对
        contentToCopy = this.responseHeaders.map(h => `${h.key}: ${h.value}`).join('\n')
      }
      
      if (!contentToCopy) {
        this.$message.warning('没有可复制的内容')
        return
      }
      
      // 使用现代 Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(contentToCopy).then(() => {
          this.$message.success('已复制到剪贴板')
        }).catch(() => {
          // 降级到传统方法
          this.fallbackCopyText(contentToCopy)
        })
      } else {
        // 降级到传统方法
        this.fallbackCopyText(contentToCopy)
      }
    },
    fallbackCopyText(text) {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        this.$message.success('已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败，请手动复制')
      }
      document.body.removeChild(textarea)
    },
    async sendRequest() {
      if (!this.requestUrl) {
        this.$message.warning('请输入请求URL')
        return
      }

      this.sending = true
      const startTime = Date.now()

      try {
        // 构建请求配置
        const config = {
          method: this.requestMethod.toLowerCase(),
          url: this.requestUrl,
          headers: {},
          timeout: 30000
        }

        // 添加启用的 headers
        this.headers.forEach(header => {
          if (header.enabled && header.key) {
            config.headers[header.key] = header.value
          }
        })

        // 构建查询参数
        const enabledParams = this.params.filter(p => p.enabled && p.key)
        if (enabledParams.length > 0) {
          const url = new URL(this.requestUrl)
          enabledParams.forEach(param => {
            url.searchParams.append(param.key, param.value)
          })
          config.url = url.toString()
        }

        // 构建请求体
        if (['POST', 'PUT', 'PATCH'].includes(this.requestMethod)) {
          if (this.bodyType === 'raw') {
            if (this.rawBody.trim()) {
              config.data = this.rawBody
              if (!config.headers['Content-Type']) {
                config.headers['Content-Type'] = this.rawContentType
              }
            }
          } else if (this.bodyType === 'form-data') {
            const formData = new FormData()
            this.formData.forEach(item => {
              if (item.enabled && item.key) {
                if (item.type === 'file' && item.file) {
                  formData.append(item.key, item.file)
                } else {
                  formData.append(item.key, item.value || '')
                }
              }
            })
            config.data = formData
            // FormData 会自动设置 Content-Type，删除手动设置的
            delete config.headers['Content-Type']
          } else if (this.bodyType === 'x-www-form-urlencoded') {
            const formData = new URLSearchParams()
            this.formData.forEach(item => {
              if (item.enabled && item.key) {
                formData.append(item.key, item.value || '')
              }
            })
            config.data = formData.toString()
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
          } else if (this.bodyType === 'binary' && this.binaryFileList.length > 0) {
            config.data = this.binaryFileList[0].raw
          }
        }

        // 发送请求
        const response = await axios(config)

        // 处理响应
        this.responseTime = Date.now() - startTime
        this.responseStatus = `${response.status} ${response.statusText || ''}`
        this.responseStatusType = response.status >= 200 && response.status < 300 ? 'success' : 'danger'
        
        // 转换响应头
        this.responseHeaders = Object.keys(response.headers).map(key => ({
          key,
          value: response.headers[key]
        }))

        // 处理响应数据
        this.responseData = response.data

        this.$message.success('请求发送成功')
      } catch (error) {
        this.responseTime = Date.now() - startTime
        
        if (error.response) {
          // 服务器响应了错误状态码
          this.responseStatus = `${error.response.status} ${error.response.statusText || ''}`
          this.responseStatusType = 'danger'
          
          this.responseHeaders = Object.keys(error.response.headers).map(key => ({
            key,
            value: error.response.headers[key]
          }))
          
          this.responseData = error.response.data
        } else if (error.request) {
          // 请求已发送但没有收到响应
          this.responseStatus = 'Network Error'
          this.responseStatusType = 'danger'
          this.responseData = '请求失败：无法连接到服务器'
        } else {
          // 请求配置出错
          this.responseStatus = 'Request Error'
          this.responseStatusType = 'danger'
          this.responseData = error.message
        }
        
        this.$message.error('请求失败：' + (error.message || '未知错误'))
      } finally {
        this.sending = false
      }
    }
  },
  mounted() {
    this.updateRawBodyLines()
  }
    }
</script>

<style scoped lang="scss">
.api-request-container {
  padding: 20px;
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.request-section {
  background: white;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  overflow-y: auto;
}

.request-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

  .method-select {
    width: 120px;
  }

  .url-input {
    flex: 1;
  }

  .params-btn {
    min-width: 80px;
  }

  .send-dropdown {
    .el-button {
      min-width: 100px;
    }
  }
}

.tabs-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .request-tabs {
    flex: 1;

    ::v-deep .el-tabs__header {
      margin-bottom: 16px;
    }

    ::v-deep .el-tabs__item {
      position: relative;
    }

    .header-badge {
      margin-left: 8px;
    }

    .body-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      background: #409eff;
      border-radius: 50%;
      margin-left: 8px;
      vertical-align: middle;
    }
  }

}

.headers-content {
  .headers-table {
    margin-bottom: 12px;
  }

  .add-header-btn {
    text-align: left;
  }
}

.params-content {
  .params-table {
    margin-bottom: 12px;
  }

  .add-param-btn {
    text-align: left;
  }
}

.body-content {
  .body-type-selector {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .raw-content-type {
      width: 200px;
    }
  }

  .form-body {
    .form-data-table {
      margin-bottom: 12px;
    }

    .add-form-data-btn {
      text-align: left;
    }
  }

  .raw-body {
    .code-editor-wrapper {
      display: flex;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      height: 150px;
      min-height: 150px;
      max-height: 150px;
      overflow: hidden;

      .line-numbers {
        background: #f5f7fa;
        padding: 10px 8px;
        border-right: 1px solid #dcdfe6;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #909399;
        line-height: 1.5;
        user-select: none;
        min-width: 40px;
        text-align: right;
        flex-shrink: 0;
        overflow: hidden;

        .line-number {
          height: 20px;
          line-height: 20px;
        }
      }

      .code-editor-textarea {
        flex: 1;
        border: none;
        outline: none;
        box-shadow: none;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.5;
        padding: 10px;
        resize: none;
        overflow: hidden;
        width: 100%;
        height: 100%;
        margin: 0;
        background: transparent;
        color: #303133;

        &:focus {
          border: none;
          outline: none;
          box-shadow: none;
        }

        // 隐藏滚动条
        &::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    }
  }

  .binary-body {
    .binary-upload {
      ::v-deep .el-upload {
        display: block;
      }
    }
  }
}

.response-section {
  flex: 1;
  background: white;
  border-radius: 4px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  margin-top: 16px;

  .response-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;
    z-index: 1;

    .response-label {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .response-content {
    flex: 1;
    overflow: visible;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .empty-response {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #909399;

      i {
        font-size: 48px;
        margin-bottom: 16px;
      }

      p {
        font-size: 14px;
      }
    }

    .response-data {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: visible;

      .response-status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 16px;
        flex-shrink: 0;
        z-index: 1;
        position: relative;

        .response-time {
          font-size: 12px;
          color: #909399;
        }

        .response-actions {
          display: flex;
          gap: 8px;
          margin-left: auto;
        }
      }

      .response-tabs {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: visible;

        ::v-deep .el-tabs__content {
          flex: 1;
          overflow: visible;
          display: flex;
          flex-direction: column;
        }

        ::v-deep .el-tab-pane {
          flex: 1;
          overflow: visible;
          display: flex;
          flex-direction: column;
        }

        .response-body-wrapper {
          flex: 1;
          display: flex;
          overflow-y: auto;
          overflow-x: hidden;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          min-height: 0;
          background: white;

          .line-numbers {
            background: #f5f7fa;
            padding: 10px 8px;
            border-right: 1px solid #dcdfe6;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #909399;
            line-height: 1.5;
            user-select: none;
            min-width: 40px;
            text-align: right;
            flex-shrink: 0;

            .line-number {
              height: 20px;
              line-height: 20px;
            }
          }

          .response-body {
            flex: 1;
            margin: 0;
            padding: 10px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.5;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow: visible;
            background: white;
            color: #303133;
          }
        }

        .response-headers-table {
          flex: 1;
          overflow: auto;
        }
      }
    }
  }

}

.add-param-btn {
  margin-top: 12px;
  text-align: left;
}

.dialog-footer {
  text-align: right;
}
</style>

