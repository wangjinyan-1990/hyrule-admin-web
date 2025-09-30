<template>
  <div class="note-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <i class="el-icon-loading"></i>
      <p>加载笔记中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-alert
        :title="error"
        type="error"
        :closable="false"
        show-icon
      />
    </div>

    <!-- 笔记详情内容 -->
    <div v-else-if="noteData" class="note-content-container">
      <!-- 标题区域 -->
      <div class="note-header">
        <!-- 标题和元数据 -->
        <div class="note-info">
          <h1 class="note-title">{{ (mode === 'edit' ? editForm.title : noteData.noteTitle) || '无标题' }}</h1>
          <div class="note-meta">
            <span class="meta-item">
              <i class="el-icon-time"></i>
              创建时间: {{ formatDate(noteData.createTime) }}
            </span>
            <span class="meta-item">
              <i class="el-icon-document"></i>
              字数: {{ currentWordCount }} 字
            </span>
            <span v-if="currentFileSize" class="meta-item">
              <i class="el-icon-folder"></i>
              大小: {{ formatFileSize(currentFileSize) }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 - 右上角 -->
        <div class="note-actions">
          <el-button
            v-if="mode === 'view'"
            type="primary"
            icon="el-icon-edit"
            @click="handleEdit"
          >
            编辑
          </el-button>
          <el-button
            type="default"
            icon="el-icon-back"
            @click="handleGoBack"
          >
            返回
          </el-button>
        </div>
      </div>

      <!-- 笔记内容区域 -->
      <div class="note-body">
        <!-- 查看模式：显示只读内容 -->
        <div v-if="mode === 'view'" class="note-content" v-html="noteData.noteContent"></div>

        <!-- 编辑模式：显示可编辑的编辑器 -->
        <div v-else-if="mode === 'edit'" class="note-editor-container">
          <!-- 标题输入 -->
          <div class="editor-header">
            <el-input v-model="editForm.title" placeholder="请输入笔记标题" class="title-input" size="large" />
          </div>
          <!-- 富文本编辑器工具栏 -->
          <div class="editor-toolbar">
            <button type="button" onclick="document.execCommand('undo')" title="撤销" class="toolbar-btn">
              <i class="el-icon-refresh-left"></i>
            </button>
            <button type="button" onclick="document.execCommand('redo')" title="重做" class="toolbar-btn">
              <i class="el-icon-refresh-right"></i>
            </button>
            <div class="toolbar-separator"></div>
            <button type="button" onclick="document.execCommand('bold')" title="粗体" class="toolbar-btn">
              <b>B</b>
            </button>
            <button type="button" onclick="document.execCommand('italic')" title="斜体" class="toolbar-btn">
              <i>I</i>
            </button>
            <button type="button" onclick="document.execCommand('underline')" title="下划线" class="toolbar-btn">
              <u>U</u>
            </button>
            <div class="toolbar-separator"></div>
            <!-- 字体颜色选择器 -->
            <div class="toolbar-group">
              <input type="color" @change="setFontColor"  title="字体颜色" class="color-picker" value="#000000"/>
              <span class="toolbar-label">颜色</span>
            </div>
            <!-- 字体大小选择器 -->
            <div class="toolbar-group">
              <select @change="setFontSize" title="字体大小" class="font-size-select">
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px" selected>16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="28px">28px</option>
                <option value="32px">32px</option>
              </select>
              <span class="toolbar-label">大小</span>
            </div>
            <div class="toolbar-separator"></div>
            <button type="button" onclick="document.execCommand('justifyLeft')" title="左对齐" class="toolbar-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M3 4H21V6H3V4ZM3 19H17V21H3V19ZM3 14H21V16H3V14ZM3 9H17V11H3V9Z"></path>
              </svg>
            </button>
            <button type="button" onclick="document.execCommand('justifyCenter')" title="居中" class="toolbar-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M3 4H21V6H3V4ZM5 19H19V21H5V19ZM3 14H21V16H3V14ZM5 9H19V11H5V9Z"></path>
              </svg>
            </button>
            <button type="button" onclick="document.execCommand('justifyRight')" title="右对齐" class="toolbar-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M3 4H21V6H3V4ZM7 19H21V21H7V19ZM3 14H21V16H3V14ZM7 9H21V11H7V9Z"></path>
              </svg>
            </button>
            <div class="toolbar-separator"></div>
            <button type="button" onclick="document.execCommand('insertUnorderedList')" title="无序列表" class="toolbar-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M8 4H21V6H8V4ZM4.5 6.5C3.67157 6.5 3 5.82843 3 5C3 4.17157 3.67157 3.5 4.5 3.5C5.32843 3.5 6 4.17157 6 5C6 5.82843 5.32843 6.5 4.5 6.5ZM4.5 13.5C3.67157 13.5 3 12.8284 3 12C3 11.1716 3.67157 10.5 4.5 10.5C5.32843 10.5 6 11.1716 6 12C6 12.8284 5.32843 13.5 4.5 13.5ZM4.5 20.4C3.67157 20.4 3 19.7284 3 18.9C3 18.0716 3.67157 17.4 4.5 17.4C5.32843 17.4 6 18.0716 6 18.9C6 19.7284 5.32843 20.4 4.5 20.4ZM8 11H21V13H8V11ZM8 18H21V20H8V18Z"></path>
              </svg>
            </button>
            <button type="button" onclick="document.execCommand('insertOrderedList')" title="有序列表" class="toolbar-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M5.75024 3.5H4.71733L3.25 3.89317V5.44582L4.25002 5.17782L4.25018 8.5H3V10H7V8.5H5.75024V3.5ZM10 4H21V6H10V4ZM10 11H21V13H10V11ZM10 18H21V20H10V18ZM2.875 15.625C2.875 14.4514 3.82639 13.5 5 13.5C6.17361 13.5 7.125 14.4514 7.125 15.625C7.125 16.1106 6.96183 16.5587 6.68747 16.9167L6.68271 16.9229L5.31587 18.5H7V20H3.00012L2.99959 18.8786L5.4717 16.035C5.5673 15.9252 5.625 15.7821 5.625 15.625C5.625 15.2798 5.34518 15 5 15C4.67378 15 4.40573 15.2501 4.37747 15.5688L4.3651 15.875H2.875V15.625Z"></path>
              </svg>
            </button>
          </div>
          <!-- 内容编辑区域 -->
          <div class="editor-content">
            <div ref="noteEditor" class="note-editor-content" contenteditable="true"  @input="handleContentChange" @blur="handleContentChange"></div>
          </div>
          <!-- 操作按钮 -->
          <div class="editor-actions">
            <el-button @click="handleCancelEdit">取消</el-button>
            <el-button type="primary" @click="handleSaveNote" :loading="saveLoading">保存</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-container">
      <el-empty description="笔记不存在或已被删除">
        <el-button type="primary" @click="handleGoBack">返回列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import notebookApi from '@/api/tools/notebook'

export default {
  name: 'NoteDetail',
  data() {
    return {
      loading: true,
      error: null,
      noteData: null,
      wordCount: 0,
      saveLoading: false,
      editorInitialized: false,
      editForm: {
        noteId: null,
        title: '',
        content: '',
        directoryId: null,
        createTime: null
      }
    }
  },
  computed: {
    mode() {
      return this.$route.query.mode || 'view'
    },
    noteId() {
      return this.$route.params.noteId
    },
    isNewNote() {
      return this.$route.query.isNew === 'true'
    },
    parentDirectoryId() {
      return this.$route.query.directoryId
    },
    // 实时计算字数
    currentWordCount() {
      if (this.mode === 'edit') {
        return this.editForm.content ? this.editForm.content.replace(/<[^>]*>/g, '').length : 0
      }
      return this.wordCount
    },
    // 实时计算文件大小
    currentFileSize() {
      if (this.mode === 'edit') {
        return this.calculateFileSize(this.editForm.content)
      }
      return this.noteData?.fileSize || 0
    }
  },
  created() {
    this.loadNoteDetail()
  },
  mounted() {
    if (this.mode === 'edit') {
      this.$nextTick(() => {
        this.initEditor()
      })
    }
  },
  watch: {
    '$route'(to, from) {
      if (to.params.noteId !== from.params.noteId) {
        this.editorInitialized = false
        this.loadNoteDetail()
      }
    },
    editForm: {
      handler(newVal, oldVal) {
        // 只在编辑器未初始化且内容真正变化时才初始化
        if (newVal && this.mode === 'edit' && !this.editorInitialized &&
            (!oldVal || newVal.content !== oldVal.content)) {
          console.log('editForm watcher 触发初始化，newVal:', newVal)
          this.$nextTick(() => {
            this.initEditor()
          })
        }
      },
      deep: true
    }
  },
  methods: {
    // 初始化编辑器
    initEditor() {
      const editor = this.$refs.noteEditor
      console.log('初始化编辑器，editor:', editor, 'editForm.content:', this.editForm.content)
      if (editor) {
        const content = this.editForm.content
        if (content && content.trim()) {
          editor.innerHTML = content
          console.log('编辑器内容已设置:', content)
        } else {
          editor.innerHTML = ''
          console.log('编辑器内容设置为空')
        }
        editor.focus()
        this.editorInitialized = true
        console.log('编辑器初始化完成')
      } else {
        console.error('找不到编辑器元素')
      }
    },

    // 处理内容变化
    handleContentChange(event) {
      if (event && event.target) {
        this.editForm.content = event.target.innerHTML
        this.updateWordCount()
      }
    },

    // 加载笔记详情
    async loadNoteDetail() {
      // 如果是新建笔记，不需要从API加载数据
      if (this.isNewNote) {
        console.log('新建笔记模式，isNewNote:', this.isNewNote, 'mode:', this.mode)
        this.loading = false
        this.error = null
        this.noteData = {
          noteId: null,
          noteTitle: '',
          noteContent: '',
          directoryId: this.parentDirectoryId,
          createTime: new Date().toISOString()
        }
        this.updateWordCount()

        // 初始化编辑表单
        if (this.mode === 'edit') {
          this.editForm = {
            noteId: null,
            title: '',
            content: '',
            directoryId: this.parentDirectoryId,
            createTime: new Date().toISOString()
          }
          console.log('新建笔记初始化表单:', this.editForm)
          console.log('新建笔记noteData:', this.noteData)
        }
        return
      }

      if (!this.noteId) {
        this.error = '缺少笔记ID参数'
        this.loading = false
        return
      }

      this.loading = true
      this.error = null

      try {
        console.log('加载笔记详情，noteId:', this.noteId, 'mode:', this.mode)

        const response = await notebookApi.getNoteDetail(this.noteId)
        console.log('笔记详情API响应:', response)

        if ((response.code === 200 || response.code === 20000) && response.data) {
          this.noteData = response.data
          this.updateWordCount()

          // 如果是编辑模式，初始化编辑表单
          if (this.mode === 'edit') {
            this.editForm = {
              noteId: this.noteData.noteId,
              title: this.noteData.noteTitle || '',
              content: this.noteData.noteContent || '',
              directoryId: this.noteData.directoryId,
              createTime: this.noteData.createTime
            }
            console.log('编辑模式初始化表单:', this.editForm)
            console.log('笔记内容:', this.noteData.noteContent)
          }

          console.log('成功加载笔记数据:', this.noteData)
        } else {
          this.error = `笔记不存在或已被删除: ${response.message || '未知错误'}`
          console.error('笔记详情API返回错误:', response)
        }
      } catch (error) {
        console.error('从API加载笔记失败:', error)
        const errorMessage = error.message || error.toString()
        if (errorMessage.includes('记事本不存在')) {
          this.error = '笔记不存在或已被删除'
        } else {
          this.error = `加载笔记失败: ${errorMessage}`
        }
      } finally {
        this.loading = false
      }
    },

    // 更新字数统计
    updateWordCount() {
      if (this.noteData && this.noteData.noteContent) {
        // 移除HTML标签，获取纯文本
        const textContent = this.noteData.noteContent.replace(/<[^>]*>/g, '')
        this.wordCount = textContent.length
      } else {
        this.wordCount = 0
      }
    },

    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes) return '-'
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    },

    // 计算文件大小（字节数）
    calculateFileSize(content) {
      if (!content) return 0
      // 将内容转换为UTF-8字节数组来计算大小
      return new TextEncoder().encode(content).length
    },

    // 设置字体颜色
    setFontColor(event) {
      const color = event.target.value
      const editor = this.$refs.noteEditor
      
      // 确保编辑器有焦点
      if (editor) {
        editor.focus()
        
        // 检查是否有选中的文本
        const selection = window.getSelection()
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
          // 有选中文本，直接设置颜色
          document.execCommand('foreColor', false, color)
        } else {
          // 没有选中文本，提示用户
          this.$message.warning('请先选中要设置颜色的文字')
        }
      }
    },

    // 设置字体大小
    setFontSize(event) {
      const fontSize = event.target.value
      const editor = this.$refs.noteEditor
      
      // 确保编辑器有焦点
      if (editor) {
        editor.focus()
        
        // 检查是否有选中的文本
        const selection = window.getSelection()
        if (selection.rangeCount > 0 && !selection.isCollapsed) {
          // 有选中文本，使用CSS样式设置字体大小
          const range = selection.getRangeAt(0)
          const span = document.createElement('span')
          span.style.fontSize = fontSize
          try {
            range.surroundContents(span)
          } catch (e) {
            // 如果surroundContents失败，尝试insertNode
            span.appendChild(range.extractContents())
            range.insertNode(span)
          }
          selection.removeAllRanges()
        } else {
          // 没有选中文本，提示用户
          this.$message.warning('请先选中要设置大小的文字')
        }
      }
    },

    // 编辑笔记
    handleEdit() {
      if (this.noteData) {
        // 跳转到编辑模式
        this.$router.push({
          name: 'noteEditor',
          params: { noteId: this.noteData.noteId },
          query: {
            title: `编辑 - ${this.noteData.noteTitle}`,
            mode: 'edit'
          }
        })
      }
    },

    // 保存笔记
    async handleSaveNote() {
      try {
        this.saveLoading = true
        console.log('保存笔记数据:', this.editForm)

        const saveData = {
          noteId: this.isNewNote ? null : this.editForm.noteId,
          noteTitle: this.editForm.title.trim(),
          noteContent: this.editForm.content,
          userId: this.$store.getters.userId || 'default-user',
          directoryId: this.editForm.directoryId || null,
          createTime: this.editForm.createTime || new Date().toISOString(),
          fileSize: this.calculateFileSize(this.editForm.content)
        }

        console.log('准备保存的数据:', saveData)

        let response
        if (this.isNewNote) {
          // 新建笔记
          response = await notebookApi.createNote(saveData)
        } else {
          // 更新笔记
          response = await notebookApi.updateNote(saveData)
        }

        if (response.code === 20000) {
          this.$message.success(this.isNewNote ? '笔记创建成功' : '笔记保存成功')

          let realNoteId

          if (this.isNewNote) {
            // 新建笔记：从后端获取ID
            realNoteId = response.data?.noteId || response.data?.id || response.data
            if (!realNoteId) {
              console.error('API未返回笔记ID:', response)
              this.$message.error('保存成功但无法获取笔记ID')
              return
            }
          } else {
            // 更新已有笔记：使用现有的noteId
            realNoteId = this.editForm.noteId
          }

          // 更新本地数据
          this.noteData = {
            ...this.noteData,
            noteId: realNoteId,
            noteTitle: saveData.noteTitle,
            noteContent: saveData.noteContent
          }

          // 切换到查看模式
          this.$router.replace({
            name: 'noteViewer',
            params: { noteId: realNoteId },
            query: {
              title: `查看 - ${this.noteData.noteTitle}`,
              mode: 'view'
            }
          })
        } else {
          this.$message.error(`保存失败: ${response.message || '未知错误'}`)
        }
      } catch (error) {
        console.error('保存笔记失败:', error)
        this.$message.error(`保存失败: ${error.message || error.toString()}`)
      } finally {
        this.saveLoading = false
      }
    },

    // 取消编辑
    handleCancelEdit() {
      // 切换到查看模式
      this.$router.replace({
        name: 'noteViewer',
        params: { noteId: this.noteData.noteId },
        query: {
          title: `查看 - ${this.noteData.noteTitle}`,
          mode: 'view'
        }
      })
    },

    // 返回列表
    handleGoBack() {
      this.$router.push({
        name: 'notebook'
      })
    }
  }
}
</script>

<style scoped>
.note-detail-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

.note-content-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.note-header {
  padding: 20px 30px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.note-info {
  flex: 1;
}

.note-title {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.note-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #606266;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-item i {
  color: #909399;
}

.note-actions {
  display: flex;
  gap: 10px;
  margin-left: 20px;
  flex-shrink: 0;
}

.note-body {
  flex: 1;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.note-content {
  flex: 1;
  padding: 30px;
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  overflow-y: auto;
  word-wrap: break-word;
  white-space: pre-wrap;
  background-color: #fff;
}

/* 笔记内容样式 */
.note-content h1,
.note-content h2,
.note-content h3,
.note-content h4,
.note-content h5,
.note-content h6 {
  margin: 20px 0 10px 0;
  font-weight: bold;
  color: #303133;
}

.note-content p {
  margin: 10px 0;
}

.note-content ul,
.note-content ol {
  margin: 10px 0;
  padding-left: 20px;
}

.note-content li {
  margin: 5px 0;
}

.note-content blockquote {
  margin: 15px 0;
  padding: 10px 20px;
  border-left: 4px solid #409eff;
  background-color: #f0f9ff;
  color: #606266;
}

.note-content code {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #e6a23c;
}

.note-content pre {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 15px 0;
}

.note-content pre code {
  background-color: transparent;
  padding: 0;
  color: #303133;
}

.note-content a {
  color: #409eff;
  text-decoration: underline;
}

.note-content a:hover {
  color: #66b1ff;
}

.note-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 15px auto;
  border-radius: 4px;
}

/* 编辑模式样式 */
.note-editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-header {
  padding: 20px 30px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
}

.title-input {
  font-size: 20px;
  font-weight: 600;
}

.title-input .el-input__inner {
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  padding: 0;
}

.title-input .el-input__inner:focus {
  border: none;
  box-shadow: none;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 30px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
}

.toolbar-btn {
  padding: 6px 8px;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.toolbar-btn:hover {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.toolbar-btn:active {
  background-color: #e6f7ff;
  border-color: #409eff;
}

.toolbar-separator {
  width: 1px;
  height: 20px;
  background-color: #dcdfe6;
  margin: 0 4px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 4px;
  transition: all 0.3s;
}

.toolbar-group:hover {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
}

.color-picker {
  width: 24px;
  height: 24px;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  cursor: pointer;
  padding: 0;
  background: transparent;
  outline: none;
}

.color-picker:hover {
  border-color: #409eff;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
  border: none;
  border-radius: 2px;
}

.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: 2px;
}

.font-size-select {
  border: none;
  background: transparent;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  min-width: 50px;
  padding: 2px 4px;
}

.toolbar-label {
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
}

.editor-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.note-editor-content {
  flex: 1;
  border: none;
  padding: 20px 30px;
  outline: none;
  font-size: 16px;
  line-height: 1.8;
  color: #303133;
  overflow-y: auto;
  background-color: #fff;
}

.editor-actions {
  padding: 15px 30px;
  border-top: 1px solid #ebeef5;
  background-color: #fafafa;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .note-content-container {
    margin: 10px;
  }

  .note-header {
    padding: 15px 20px;
    flex-direction: column;
    align-items: flex-start;
  }

  .note-title {
    font-size: 20px;
  }

  .note-content {
    padding: 20px;
    font-size: 14px;
  }

  .note-meta {
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
  }

  .note-actions {
    margin-left: 0;
    align-self: flex-end;
  }
}
</style>
