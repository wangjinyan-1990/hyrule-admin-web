<template>
  <div class="text-diff-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" icon="el-icon-document" @click="createNew">
          新建
        </el-button>
        <el-button icon="el-icon-download" @click="downloadDiff">
          下载差异
        </el-button>
        <el-button icon="el-icon-d-arrow-right" @click="useAllLeft" title="使用所有左侧内容">
          全用左侧
        </el-button>
        <el-button icon="el-icon-d-arrow-left" @click="useAllRight" title="使用所有右侧内容">
          全用右侧
        </el-button>
        <div class="navigation-buttons">
          <el-button icon="el-icon-arrow-up" @click="previousDiff" :disabled="!hasPrevious"></el-button>
          <el-button icon="el-icon-arrow-down" @click="nextDiff" :disabled="!hasNext"></el-button>
        </div>
        <el-dropdown @command="handleSettings" trigger="click">
          <el-button>
            设置<i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="ignoreWhitespace">
              <el-checkbox v-model="settings.ignoreWhitespace">忽略空白字符</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item command="ignoreCase">
              <el-checkbox v-model="settings.ignoreCase">忽略大小写</el-checkbox>
            </el-dropdown-item>
            <el-dropdown-item command="wordWrap">
              <el-checkbox v-model="settings.wordWrap">自动换行</el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button icon="el-icon-full-screen" @click="toggleFullscreen">
          全屏
        </el-button>
        <el-button icon="el-icon-view" @click="showMergeResult">
          合并结果
        </el-button>
      </div>
      
      <div class="toolbar-right">
        <el-input
          v-model="searchText"
          placeholder="搜索"
          size="small"
          style="width: 200px; margin-right: 10px;"
          @keyup.enter="performSearch"
        >
          <el-button slot="append" icon="el-icon-search" @click="performSearch"></el-button>
        </el-input>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <div class="panel left-panel">
        <div class="panel-header">
          <span class="panel-title">原始文本</span>
          <div class="panel-actions">
            <el-button size="mini" icon="el-icon-upload2" @click="loadFile('left')">加载文件</el-button>
            <el-button size="mini" icon="el-icon-edit" @click="toggleEditMode('left')">
              {{ editModes.left ? '预览' : '编辑' }}
            </el-button>
          </div>
        </div>
        <div class="panel-content">
          <div v-if="editModes.left" class="edit-area">
            <el-input
              v-model="leftText"
              type="textarea"
              :rows="20"
              placeholder="在此输入原始文本..."
              @input="onTextChange"
            ></el-input>
          </div>
          <div v-else class="view-area">
            <div class="line-numbers">
              <div
                v-for="(line, index) in leftLines"
                :key="index"
                class="line-number"
                :class="{ 'diff-line': line.isDiff }"
              >
                {{ index + 1 }}
              </div>
            </div>
            <div class="text-content">
              <div
                v-for="(line, index) in leftLines"
                :key="index"
                class="text-line"
                :class="{ 'diff-line': line.isDiff, 'search-highlight': line.isSearchMatch }"
              >
                <div class="line-actions" v-if="line.isDiff">
                  <el-button
                    size="mini"
                    type="success"
                    @click="useLeftContent(index)"
                    title="使用左侧内容"
                    class="use-left-btn"
                  >
                    <i class="el-icon-right" style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); font-weight: bold;"></i>
                  </el-button>
                </div>
                <span v-html="line.content"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间分隔线 -->
      <div class="separator"></div>

      <!-- 右侧面板 -->
      <div class="panel right-panel">
        <div class="panel-header">
          <span class="panel-title">对比文本</span>
          <div class="panel-actions">
            <el-button size="mini" icon="el-icon-upload2" @click="loadFile('right')">加载文件</el-button>
            <el-button size="mini" icon="el-icon-edit" @click="toggleEditMode('right')">
              {{ editModes.right ? '预览' : '编辑' }}
            </el-button>
          </div>
        </div>
        <div class="panel-content">
          <div v-if="editModes.right" class="edit-area">
            <el-input
              v-model="rightText"
              type="textarea"
              :rows="20"
              placeholder="在此输入对比文本..."
              @input="onTextChange"
            ></el-input>
          </div>
          <div v-else class="view-area">
            <div class="line-numbers">
              <div
                v-for="(line, index) in rightLines"
                :key="index"
                class="line-number"
                :class="{ 'diff-line': line.isDiff }"
              >
                {{ index + 1 }}
              </div>
            </div>
            <div class="text-content">
              <div
                v-for="(line, index) in rightLines"
                :key="index"
                class="text-line"
                :class="{ 'diff-line': line.isDiff, 'search-highlight': line.isSearchMatch }"
              >
                <div class="line-actions" v-if="line.isDiff">
                  <el-button
                    size="mini"
                    type="warning"
                    @click="useRightContent(index)"
                    title="使用右侧内容"
                    class="use-right-btn"
                  >
                    <i class="el-icon-back" style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); font-weight: bold;"></i>
                  </el-button>
                </div>
                <span v-html="line.content"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件上传对话框 -->
    <el-dialog title="选择文件" :visible.sync="fileDialogVisible" width="400px">
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".txt,.md,.json,.xml,.html,.css,.js,.vue,.py,.java,.cpp,.c,.h,.hpp,.cs,.php,.rb,.go,.rs,.jsx,.tsx,.ts,.sql"
        :file-list="[]"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">支持文本文件格式</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="fileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmFileUpload">确定</el-button>
      </span>
    </el-dialog>

    <!-- 合并结果对话框 -->
    <el-dialog title="合并结果预览" :visible.sync="mergeResultVisible" width="80%" top="5vh">
      <div class="merge-result-container">
        <div class="merge-result-header">
          <h4>合并后的文本内容</h4>
          <div class="merge-actions">
            <el-button size="small" @click="copyMergeResult">复制</el-button>
            <el-button size="small" type="primary" @click="downloadMergeResult">下载</el-button>
          </div>
        </div>
        <div class="merge-result-content">
          <el-input
            v-model="mergeResultText"
            type="textarea"
            :rows="20"
            readonly
            style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace;"
          ></el-input>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TextDiffComparator',
  data() {
    return {
      leftText: 'the quick red FOX\njumped over the hairy dog\n\n工具哇\ntoolwa.com',
      rightText: 'The quick brown fox\njumped over the lazy dog\n\n工具哇\nToolWa.com',
      leftLines: [],
      rightLines: [],
      editModes: {
        left: false,
        right: false
      },
      settings: {
        ignoreWhitespace: false,
        ignoreCase: false,
        wordWrap: true
      },
      searchText: '',
      currentDiffIndex: 0,
      diffResults: [],
      fileDialogVisible: false,
      currentUploadSide: 'left',
      uploadFile: null,
      mergeResultVisible: false,
      mergeResultText: ''
    }
  },
  computed: {
    hasPrevious() {
      return this.currentDiffIndex > 0
    },
    hasNext() {
      return this.currentDiffIndex < this.diffResults.length - 1
    }
  },
  watch: {
    leftText() {
      this.performDiff()
    },
    rightText() {
      this.performDiff()
    },
    settings: {
      handler() {
        this.performDiff()
      },
      deep: true
    }
  },
  mounted() {
    this.performDiff()
  },
  methods: {
    createNew() {
      this.$confirm('确定要清空所有文本吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.leftText = ''
        this.rightText = ''
        this.searchText = ''
        this.currentDiffIndex = 0
        this.$message({
          message: '已清空',
          type: 'success',
          duration: 1500
        })
      })
    },
    
    downloadDiff() {
      if (this.diffResults.length === 0) {
        this.$message({
          message: '没有差异内容可下载',
          type: 'warning',
          duration: 1500
        })
        return
      }
      
      let diffContent = '=== 文本差异对比报告 ===\n\n'
      diffContent += `生成时间: ${new Date().toLocaleString()}\n\n`
      diffContent += '=== 差异详情 ===\n\n'
      
      this.diffResults.forEach((diff, index) => {
        diffContent += `差异 ${index + 1}:\n`
        if (diff.removed) {
          diffContent += `- ${diff.value}\n`
        } else if (diff.added) {
          diffContent += `+ ${diff.value}\n`
        }
        diffContent += '\n'
      })
      
      const blob = new Blob([diffContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `text-diff-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      this.$message({
        message: '差异文件已下载',
        type: 'success',
        duration: 1500
      })
    },
    
    previousDiff() {
      if (this.hasPrevious) {
        this.currentDiffIndex--
        this.highlightCurrentDiff()
      }
    },
    
    nextDiff() {
      if (this.hasNext) {
        this.currentDiffIndex++
        this.highlightCurrentDiff()
      }
    },
    
    performSearch() {
      if (!this.searchText.trim()) {
        this.clearSearchHighlight()
        return
      }
      
      this.clearSearchHighlight()
      const searchRegex = new RegExp(this.escapeRegExp(this.searchText), 'gi')
      
      this.leftLines.forEach(line => {
        if (searchRegex.test(line.originalContent)) {
          line.isSearchMatch = true
          line.content = this.highlightSearchText(line.originalContent, this.searchText)
        }
      })
      
      this.rightLines.forEach(line => {
        if (searchRegex.test(line.originalContent)) {
          line.isSearchMatch = true
          line.content = this.highlightSearchText(line.originalContent, this.searchText)
        }
      })
    },
    
    highlightSearchText(text, searchText) {
      const regex = new RegExp(`(${this.escapeRegExp(searchText)})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    },
    
    clearSearchHighlight() {
      this.leftLines.forEach(line => {
        line.isSearchMatch = false
        line.content = line.originalContent
      })
      this.rightLines.forEach(line => {
        line.isSearchMatch = false
        line.content = line.originalContent
      })
    },
    
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    },
    
    performDiff() {
      const leftLines = this.leftText.split('\n')
      const rightLines = this.rightText.split('\n')
      
      // 使用简单的差异对比算法
      const diff = this.simpleDiffLines(leftLines, rightLines)
      this.diffResults = diff.filter(item => item.type === 'removed' || item.type === 'added')
      
      // 处理左侧文本
      this.leftLines = leftLines.map((line, index) => {
        const diffInfo = this.getDiffInfoForLine(line, 'removed', diff)
        return {
          originalContent: line,
          content: this.formatDiffContent(line, diffInfo),
          isDiff: !!diffInfo,
          isSearchMatch: false
        }
      })
      
      // 处理右侧文本
      this.rightLines = rightLines.map((line, index) => {
        const diffInfo = this.getDiffInfoForLine(line, 'added', diff)
        return {
          originalContent: line,
          content: this.formatDiffContent(line, diffInfo),
          isDiff: !!diffInfo,
          isSearchMatch: false
        }
      })
      
      this.currentDiffIndex = 0
    },
    
    // 简单的差异对比算法
    simpleDiffLines(leftLines, rightLines) {
      const diff = []
      const maxLength = Math.max(leftLines.length, rightLines.length)
      
      for (let i = 0; i < maxLength; i++) {
        const leftLine = leftLines[i]
        const rightLine = rightLines[i]
        
        if (leftLine === undefined && rightLine !== undefined) {
          // 右侧新增
          diff.push({
            type: 'added',
            value: rightLine,
            lineIndex: i
          })
        } else if (leftLine !== undefined && rightLine === undefined) {
          // 左侧删除
          diff.push({
            type: 'removed',
            value: leftLine,
            lineIndex: i
          })
        } else if (leftLine !== rightLine) {
          // 内容不同
          if (leftLine) {
            diff.push({
              type: 'removed',
              value: leftLine,
              lineIndex: i
            })
          }
          if (rightLine) {
            diff.push({
              type: 'added',
              value: rightLine,
              lineIndex: i
            })
          }
        } else {
          // 内容相同
          diff.push({
            type: 'equal',
            value: leftLine,
            lineIndex: i
          })
        }
      }
      
      return diff
    },
    
    getDiffInfoForLine(line, type, diff) {
      for (const diffItem of diff) {
        if (diffItem.type === type && diffItem.value === line) {
          return diffItem
        }
      }
      return null
    },
    
    formatDiffContent(line, diffInfo) {
      if (!diffInfo) return line
      
      if (diffInfo.type === 'removed') {
        return `<span class="removed">${this.escapeHtml(line)}</span>`
      } else if (diffInfo.type === 'added') {
        return `<span class="added">${this.escapeHtml(line)}</span>`
      }
      
      return line
    },
    
    escapeHtml(text) {
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    },
    
    toggleEditMode(side) {
      this.editModes[side] = !this.editModes[side]
      if (!this.editModes[side]) {
        this.performDiff()
      }
    },
    
    onTextChange() {
      // 延迟执行差异对比，避免频繁计算
      clearTimeout(this.diffTimeout)
      this.diffTimeout = setTimeout(() => {
        this.performDiff()
      }, 300)
    },
    
    loadFile(side) {
      this.currentUploadSide = side
      this.fileDialogVisible = true
    },
    
    handleFileChange(file) {
      this.uploadFile = file
    },
    
    confirmFileUpload() {
      if (!this.uploadFile) {
        this.$message({
          message: '请选择文件',
          type: 'warning',
          duration: 1500
        })
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        if (this.currentUploadSide === 'left') {
          this.leftText = content
        } else {
          this.rightText = content
        }
        this.$message({
          message: '文件加载成功',
          type: 'success',
          duration: 1500
        })
        this.fileDialogVisible = false
        this.uploadFile = null
      }
      reader.readAsText(this.uploadFile.raw)
    },
    
    handleSettings(command) {
      // 设置项通过 v-model 自动处理
    },
    
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        this.$el.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    },
    
    highlightCurrentDiff() {
      // 高亮当前差异
      this.clearSearchHighlight()
      if (this.diffResults.length > 0 && this.currentDiffIndex < this.diffResults.length) {
        const currentDiff = this.diffResults[this.currentDiffIndex]
        // 实现差异高亮逻辑
      }
    },
    
    // 使用左侧内容（将左侧内容应用到右侧）
    useLeftContent(leftIndex) {
      const leftLine = this.leftLines[leftIndex]
      if (leftLine && leftIndex < this.rightLines.length) {
        // 更新右侧对应行的内容
        this.rightLines[leftIndex] = {
          ...leftLine,
          originalContent: leftLine.originalContent,
          content: leftLine.originalContent,
          isDiff: false,
          isSearchMatch: false
        }
        
        // 更新右侧文本
        this.updateRightTextFromLines()
        
        this.$message({
          message: '已使用左侧内容',
          type: 'success',
          duration: 1500
        })
      }
    },
    
    // 使用右侧内容（将右侧内容应用到左侧）
    useRightContent(rightIndex) {
      const rightLine = this.rightLines[rightIndex]
      if (rightLine && rightIndex < this.leftLines.length) {
        // 更新左侧对应行的内容
        this.leftLines[rightIndex] = {
          ...rightLine,
          originalContent: rightLine.originalContent,
          content: rightLine.originalContent,
          isDiff: false,
          isSearchMatch: false
        }
        
        // 更新左侧文本
        this.updateLeftTextFromLines()
        
        this.$message({
          message: '已使用右侧内容',
          type: 'success',
          duration: 1500
        })
      }
    },
    
    // 从左侧行数据更新左侧文本
    updateLeftTextFromLines() {
      this.leftText = this.leftLines.map(line => line.originalContent).join('\n')
      this.performDiff()
    },
    
    // 从右侧行数据更新右侧文本
    updateRightTextFromLines() {
      this.rightText = this.rightLines.map(line => line.originalContent).join('\n')
      this.performDiff()
    },
    
    // 使用所有左侧内容
    useAllLeft() {
      this.$confirm('确定要将所有差异行都使用左侧内容吗？', '批量操作确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.rightText = this.leftText
        this.performDiff()
        this.$message({
          message: '已将所有内容设置为左侧内容',
          type: 'success',
          duration: 1500
        })
      })
    },
    
    // 使用所有右侧内容
    useAllRight() {
      this.$confirm('确定要将所有差异行都使用右侧内容吗？', '批量操作确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.leftText = this.rightText
        this.performDiff()
        this.$message({
          message: '已将所有内容设置为右侧内容',
          type: 'success',
          duration: 1500
        })
      })
    },
    
    // 显示合并结果
    showMergeResult() {
      // 生成合并结果文本（目前使用右侧文本作为结果）
      this.mergeResultText = this.rightText
      this.mergeResultVisible = true
    },
    
    // 复制合并结果
    copyMergeResult() {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.mergeResultText).then(() => {
          this.$message({
            message: '已复制到剪贴板',
            type: 'success',
            duration: 1500
          })
        }).catch(() => {
          this.fallbackCopyText(this.mergeResultText)
        })
      } else {
        this.fallbackCopyText(this.mergeResultText)
      }
    },
    
    // 备用复制方法
    fallbackCopyText(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message({
          message: '已复制到剪贴板',
          type: 'success',
          duration: 1500
        })
      } catch (err) {
        this.$message({
          message: '复制失败',
          type: 'error',
          duration: 1500
        })
      }
      document.body.removeChild(textArea)
    },
    
    // 下载合并结果
    downloadMergeResult() {
      const blob = new Blob([this.mergeResultText], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `merged-text-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      this.$message({
        message: '合并结果已下载',
        type: 'success',
        duration: 1500
      })
    }
  }
}
</script>

<style scoped>
.text-diff-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.navigation-buttons {
  display: flex;
  gap: 5px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e4e7ed;
}

.panel:last-child {
  border-right: none;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.panel-title {
  font-weight: 600;
  color: #303133;
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

.edit-area {
  height: 100%;
  padding: 16px;
}

.edit-area .el-textarea {
  height: 100%;
}

.edit-area .el-textarea__inner {
  height: 100% !important;
  resize: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.view-area {
  height: 100%;
  display: flex;
  overflow: auto;
}

.line-numbers {
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  padding: 16px 8px;
  min-width: 60px;
  text-align: right;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
}

.line-number {
  height: 21px;
  line-height: 21px;
  padding-right: 8px;
}

.line-number.diff-line {
  background: #fef0f0;
  color: #f56c6c;
}

.text-content {
  flex: 1;
  padding: 16px 16px 16px 60px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.text-line {
  height: 21px;
  line-height: 21px;
  padding: 0 8px;
  margin: 0 -8px;
  display: flex;
  align-items: center;
  position: relative;
}

.text-line.diff-line {
  background: #fef0f0;
}

.text-line.search-highlight {
  background: #fff3cd;
}

.line-actions {
  position: absolute;
  left: -45px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.line-actions:hover {
  opacity: 1;
}

.line-actions .el-button {
  width: 26px;
  height: 22px;
  padding: 0;
  border-radius: 4px;
  font-size: 12px;
  min-width: 26px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.line-actions .el-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.line-actions .el-button--success {
  background: #67c23a;
  border-color: #67c23a;
  color: white;
}

.line-actions .el-button--success:hover {
  background: #5daf34;
  border-color: #5daf34;
}

.line-actions .el-button--warning {
  background: #e6a23c;
  border-color: #e6a23c;
  color: white;
}

.line-actions .el-button--warning:hover {
  background: #cf9236;
  border-color: #cf9236;
}

/* 确保箭头按钮的颜色清晰可见 */
.line-actions .el-button {
  color: white !important;
}

.line-actions .el-button i {
  color: white !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: bold;
}

.line-actions .el-button .el-icon-left,
.line-actions .el-button .el-icon-right {
  color: white !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  font-weight: bold;
  font-size: 14px;
}

.line-actions .el-button--success {
  background: #67c23a !important;
  border-color: #67c23a !important;
  color: white !important;
}

.line-actions .el-button--success:hover {
  background: #5daf34 !important;
  border-color: #5daf34 !important;
  color: white !important;
}

.line-actions .el-button--warning {
  background: #409eff !important;
  border-color: #409eff !important;
  color: white !important;
}

.line-actions .el-button--warning:hover {
  background: #337ecc !important;
  border-color: #337ecc !important;
  color: white !important;
}

/* 专门针对右侧向左箭头的样式 */
.use-right-btn {
  background: #409eff !important;
  border-color: #409eff !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.use-right-btn i {
  color: white !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  font-weight: bold;
  font-size: 14px;
}

.use-right-btn .el-icon-left {
  color: white !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  font-weight: bold;
  font-size: 14px;
}

.use-right-btn:hover {
  background: #337ecc !important;
  border-color: #337ecc !important;
  color: white !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.use-right-btn:hover i {
  color: white !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.use-right-btn:hover .el-icon-left {
  color: white !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

/* 专门针对左侧向右箭头的样式 */
.use-left-btn {
  background: #67c23a !important;
  border-color: #67c23a !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.use-left-btn i {
  color: white !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  font-weight: bold;
  font-size: 14px;
}

.use-left-btn .el-icon-right {
  color: white !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  font-weight: bold;
  font-size: 14px;
}

.use-left-btn:hover {
  background: #5daf34 !important;
  border-color: #5daf34 !important;
  color: white !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.use-left-btn:hover i {
  color: white !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.use-left-btn:hover .el-icon-right {
  color: white !important;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.separator {
  width: 1px;
  background: #e4e7ed;
  flex-shrink: 0;
}

/* 差异高亮样式 */
:deep(.removed) {
  background: #ffebee;
  color: #d32f2f;
  text-decoration: line-through;
  padding: 2px 4px;
  border-radius: 2px;
}

:deep(.added) {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 2px 4px;
  border-radius: 2px;
}

:deep(mark) {
  background: #ffeb3b;
  color: #333;
  padding: 1px 2px;
  border-radius: 2px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
  
  .toolbar-left {
    flex-wrap: wrap;
  }
  
  .main-content {
    flex-direction: column;
  }
  
  .panel {
    border-right: none;
    border-bottom: 1px solid #e4e7ed;
  }
  
  .panel:last-child {
    border-bottom: none;
  }
  
  .separator {
    width: 100%;
    height: 1px;
  }
}

/* 合并结果对话框样式 */
.merge-result-container {
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.merge-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.merge-result-header h4 {
  margin: 0;
  color: #303133;
}

.merge-actions {
  display: flex;
  gap: 10px;
}

.merge-result-content {
  flex: 1;
}

.merge-result-content .el-textarea__inner {
  height: 100% !important;
  resize: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
  font-size: 14px;
  line-height: 1.5;
}
</style>
