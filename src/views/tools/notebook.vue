<template>
  <div class="notebook-container">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-buttons">
        <!-- 返回上一级按钮 -->
        <el-button 
          v-if="currentParentId" 
          icon="el-icon-back" 
          @click="handleGoBack"
          class="back-button"
        >
          返回上一级
        </el-button>
        <el-button type="primary" icon="el-icon-upload" @click="handleUpload">
          上传文件
        </el-button>
        <el-button icon="el-icon-folder-add" @click="handleCreateFolder">
          新建文件夹
        </el-button>
        <el-button type="success" icon="el-icon-edit" @click="handleCreateNote">
          新笔记
        </el-button>
        <el-button icon="el-icon-download" @click="handleDownload" :disabled="selectedItems.length === 0">
          下载笔记
        </el-button>
        <el-button type="danger" icon="el-icon-delete" @click="handleDelete" :disabled="selectedItems.length === 0">
          删除
        </el-button>
      </div>
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文件或目录名"
          @input="handleSearchInput"
          @keyup.enter="handleSearch"
          clearable
          class="search-input"
        >
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>
      </div>
    </div>

    <!-- 搜索结果提示 -->
    <div v-if="searchKeyword" class="search-results-info">
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        <template slot="title">
          <span>搜索 "{{ searchKeyword }}" 找到 {{ filteredDirectoryList.length }} 个结果</span>
          <el-button type="text" size="mini" @click="clearSearch" style="margin-left: 10px;">
            清空搜索
          </el-button>
        </template>
      </el-alert>
    </div>

    <!-- 目录列表 -->
    <div class="file-list-container">
      <el-table
        :data="filteredDirectoryList"
        @selection-change="handleSelectionChange"
        @row-dblclick="handleRowDoubleClick"
        v-loading="loading"
        stripe
        border
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="directoryName" label="文件名" min-width="300">
          <template slot-scope="scope">
            <div class="file-item">
              <i :class="getItemIcon(scope.row)" class="file-icon"></i>
              <span class="file-name">{{ getItemName(scope.row) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.type === 'directory' ? 'primary' : 'success'">
              {{ scope.row.type === 'directory' ? '目录' : '笔记' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="大小" width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.type === 'directory'" class="size-text">-</span>
            <span v-else class="size-text">{{ formatNoteSize(scope.row.noteContent) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150" sortable>
          <template slot-scope="scope">
            <span class="time-text">{{ formatDate(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template slot-scope="scope">
            <el-button v-if="scope.row.type === 'directory'" size="mini" @click="handleRename(scope.row)">
              重命名
            </el-button>
            <el-button v-if="scope.row.type === 'note'" size="mini" type="primary" @click="handleEditNote(scope.row)">
              编辑
            </el-button>
            <el-button v-if="scope.row.type === 'note'" size="mini" type="success" @click="handleViewNote(scope.row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 附件列表 -->
    <div v-if="currentParentId" class="attachment-list-container">
      <div class="attachment-header">
        <h3>附件列表</h3>
        <el-tag type="info">{{ attachmentList.length }} 个附件</el-tag>
      </div>
      
      <div v-loading="attachmentLoading" class="attachment-content">
        <div v-if="attachmentList.length === 0" class="no-attachment">
          <i class="el-icon-folder-opened"></i>
          <p>暂无附件</p>
        </div>
        
        <el-table v-else :data="attachmentList" stripe border>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column label="文件名" min-width="300">
            <template slot-scope="scope">
              <div class="file-item">
                <i :class="getAttachmentFileIcon(scope.row.originalFileName)" class="file-icon"></i>
                <span class="file-name">{{ scope.row.originalFileName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="100">
            <template slot-scope="scope">
              <el-tag type="warning">附件</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="大小" width="100">
            <template slot-scope="scope">
              <span class="size-text">{{ formatFileSize(scope.row.attachmentSize) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="上传时间" width="150" sortable>
            <template slot-scope="scope">
              <span class="time-text">{{ formatDate(scope.row.uploadDate) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260">
            <template slot-scope="scope">
              <el-button 
                size="mini" 
                type="success" 
                icon="el-icon-view"
                @click="viewAttachment(scope.row.attachmentId, scope.row.originalFileName, scope.row.attachmentSize, scope.row.uploadDate)"
              >
                查看
              </el-button>
              <el-button 
                size="mini" 
                type="primary" 
                icon="el-icon-download"
                @click="downloadAttachment(scope.row.attachmentId, scope.row.originalFileName)"
              >
                下载
              </el-button>
              <el-button 
                size="mini" 
                type="danger" 
                icon="el-icon-delete"
                @click="deleteAttachment(scope.row.attachmentId)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 新建文件夹对话框 -->
    <el-dialog
      title="新建文件夹"
      :visible.sync="createFolderDialogVisible"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="folderForm" :rules="folderRules" ref="folderForm" label-width="80px">
        <el-form-item label="文件夹名" prop="directoryName">
          <el-input v-model="folderForm.directoryName" placeholder="请输入文件夹名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createFolderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmCreateFolder" :loading="createFolderLoading">确定</el-button>
      </div>
    </el-dialog>

    <!-- 重命名对话框 -->
    <el-dialog
      title="重命名"
      :visible.sync="renameDialogVisible"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form :model="renameForm" :rules="renameRules" ref="renameForm" label-width="80px">
        <el-form-item label="新名称" prop="directoryName">
          <el-input v-model="renameForm.directoryName" placeholder="请输入新名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmRename" :loading="renameLoading">确定</el-button>
      </div>
    </el-dialog>

    <!-- 文件上传对话框 -->
    <FileUploadDialog
      :visible="uploadDialogVisible"
      title="上传文件"
      :multiple="true"
      :auto-upload="true"
      :upload-config="uploadConfig"
      @success="handleUploadSuccess"
      @error="handleUploadError"
      @cancel="handleCancelUpload"
      @close="handleCancelUpload"
    />

  </div>
</template>

<script>
import notebookApi from '@/api/tools/notebook'
import FileUploadDialog from '@/views/sys/common/FileUploadDialog'
import fileUploadService from '@/api/sys/common/fileUploadService'

export default {
  name: "notebook",
  components: {
    FileUploadDialog
  },
  data() {
    return {
      loading: false,
      searchKeyword: '',
      selectedItems: [],
      directoryList: [],
      attachmentList: [], // 附件列表
      attachmentLoading: false, // 附件加载状态
      currentParentId: null, // 当前父目录ID
      currentPath: [], // 当前路径
      createFolderDialogVisible: false,
      createFolderLoading: false,
      renameDialogVisible: false,
      renameLoading: false,
      uploadDialogVisible: false,
      folderForm: {
        directoryName: ''
      },
      renameForm: {
        directoryName: '',
        directoryId: null
      },
      folderRules: {
        directoryName: [
          { required: true, message: '请输入文件夹名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ]
      },
      renameRules: {
        directoryName: [
          { required: true, message: '请输入新名称', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    filteredDirectoryList() {
      if (!this.searchKeyword) {
        return this.directoryList
      }
      
      const keyword = this.searchKeyword.trim().toLowerCase()
      if (!keyword) {
        return this.directoryList
      }
      
      return this.directoryList.filter(item => {
        // 搜索目录名
        if (item.type === 'directory') {
          const directoryName = item.directoryName ? item.directoryName.toLowerCase() : ''
          return directoryName.includes(keyword)
        }
        
        // 搜索笔记标题
        if (item.type === 'note') {
          const noteTitle = item.noteTitle ? item.noteTitle.toLowerCase() : ''
          return noteTitle.includes(keyword)
        }
        
        return false
      })
    },
    uploadConfig() {
      return {
        url: '/framework/attachment/upload/batch',
        module: 'notebook',
        relateId: this.currentParentId || ''
      }
    }
  },
  created() {
    this.loadDirectoryList()
  },
  
  methods: {
    
    // 加载目录列表和笔记
    async loadDirectoryList() {
      this.loading = true
      try {
        // 并行加载目录、笔记和附件
        const [directoryResponse, noteResponse] = await Promise.all([
          notebookApi.getDirectoryList({
            userId: this.$store.getters.userId,
            parentId: this.currentParentId
          }),
          notebookApi.getNoteList({
            userId: this.$store.getters.userId,
            directoryId: this.currentParentId
          }),
          this.loadAttachments() // 同时加载附件
        ])

        // 检查响应状态码
        if ((directoryResponse.code !== 200 && directoryResponse.code !== 20000) || 
            (noteResponse.code !== 200 && noteResponse.code !== 20000)) {
          throw new Error('API响应状态码错误')
        }
        
        // 合并目录和笔记数据
        const directories = directoryResponse.data || []
        const notes = noteResponse.data || []

        // 为笔记添加类型标识和图标
        const noteItems = notes.map(note => ({
          ...note,
          type: 'note',
          icon: 'el-icon-document',
          isDirectory: false
        }))

        // 为目录添加类型标识
        const directoryItems = directories.map(dir => ({
          ...dir,
          type: 'directory',
          icon: 'el-icon-folder',
          isDirectory: true
        }))

        // 合并并排序（目录在前，笔记在后）
        this.directoryList = [...directoryItems, ...noteItems]

        console.log('加载的数据:', {
          directories: directoryItems,
          notes: noteItems,
          total: this.directoryList.length
        })
      } catch (error) {
        console.error('加载数据失败:', error)
        this.$message.error('加载数据失败')
      } finally {
        this.loading = false
      }
    },

    // 获取项目图标
    getItemIcon(item) {
      if (item.type === 'note') {
        return 'el-icon-document'
      }
      return 'el-icon-folder'
    },

    // 获取项目名称
    getItemName(item) {
      if (item.type === 'note') {
        return item.noteTitle || '未命名笔记'
      }
      return item.directoryName
    },

    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('zh-CN')
    },

    // 选择变化
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },

    // 行双击
    handleRowDoubleClick(row) {
      if (row.type === 'directory') {
        // 进入目录
        this.currentParentId = row.directoryId
        this.currentPath.push({
          directoryId: row.directoryId,
          directoryName: row.directoryName
        })
        this.loadDirectoryList()
      } else if (row.type === 'note') {
        // 在系统标签页中打开笔记查看
        this.openNoteInSystemTab(row, 'view')
      }
    },

    // 返回上一级
    handleGoBack() {
      if (this.currentPath.length > 0) {
        // 移除当前路径
        this.currentPath.pop()
        // 设置新的父目录ID
        if (this.currentPath.length > 0) {
          this.currentParentId = this.currentPath[this.currentPath.length - 1].directoryId
        } else {
          this.currentParentId = null
        }
        this.loadDirectoryList()
      }
    },

    // 上传文件
    handleUpload() {
      this.uploadDialogVisible = true
    },

    // 新建文件夹
    handleCreateFolder() {
      this.folderForm.directoryName = ''
      this.createFolderDialogVisible = true
    },

    // 新建笔记
    handleCreateNote() {
      // 生成一个临时ID用于新建笔记
      const tempId = 'new_' + Date.now()
      
      // 跳转到编辑模式
      this.$router.push({
        name: 'noteEditor',
        params: { noteId: tempId },
        query: {
          title: '新建笔记',
          mode: 'edit',
          isNew: 'true',
          directoryId: this.currentParentId
        }
      })
    },

    // 确认新建文件夹
    async handleConfirmCreateFolder() {
      this.$refs.folderForm.validate(async(valid) => {
        if (valid) {
          this.createFolderLoading = true
          try {
            const data = {
              directoryName: this.folderForm.directoryName,
              directoryParentId: this.currentParentId,
              userId: this.$store.getters.userId
            }
            await notebookApi.createDirectory(data)
            this.$message.success('文件夹创建成功')
            this.createFolderDialogVisible = false
            this.loadDirectoryList()
          } catch (error) {
            this.$message.error('创建文件夹失败')
          } finally {
            this.createFolderLoading = false
          }
        }
      })
    },

    // 下载
    async handleDownload() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要下载的项目')
        return
      }

      try {
        // 分类选中的项目
        const directories = this.selectedItems.filter(item => item.type === 'directory')
        const notes = this.selectedItems.filter(item => item.type === 'note')

        if (notes.length === 0) {
          this.$message.warning('只能下载笔记文件，目录无法下载')
          return
        }

        // 暂时使用逐个下载方式（避免JSZip依赖问题）
        if (notes.length === 1) {
          // 单个笔记直接下载
          await this.downloadSingleNote(notes[0])
        } else {
          // 多个笔记逐个下载
          await this.downloadNotesIndividually(notes)
        }

        this.$message.success(`成功下载 ${notes.length} 个笔记`)
      } catch (error) {
        console.error('下载失败:', error)
        this.$message.error('下载失败，请重试')
      }
    },

    // 下载单个笔记
    async downloadSingleNote(note) {
      try {
        // 创建下载内容
        const content = this.formatNoteForDownload(note)
        
        // 创建Blob对象
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
        
        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${note.noteTitle || '未命名笔记'}.html`
        
        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // 清理URL对象
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('下载单个笔记失败:', error)
        throw error
      }
    },

    // 下载多个笔记（ZIP格式）- 暂时禁用，使用逐个下载
    // async downloadMultipleNotes(notes) {
    //   try {
    //     // 使用require方式导入JSZip（更兼容）
    //     const JSZip = require('jszip')
    //     const zip = new JSZip()

    //     // 为每个笔记创建HTML文件
    //     notes.forEach((note, index) => {
    //       const content = this.formatNoteForDownload(note)
    //       const fileName = `${note.noteTitle || `笔记${index + 1}`}.html`
    //       zip.file(fileName, content)
    //     })

    //     // 生成ZIP文件
    //     const zipBlob = await zip.generateAsync({ type: 'blob' })
        
    //     // 创建下载链接
    //     const url = window.URL.createObjectURL(zipBlob)
    //     const link = document.createElement('a')
    //     link.href = url
    //     link.download = `笔记集合_${new Date().toISOString().slice(0, 10)}.zip`
        
    //     // 触发下载
    //     document.body.appendChild(link)
    //     link.click()
    //     document.body.removeChild(link)
        
    //     // 清理URL对象
    //     window.URL.revokeObjectURL(url)
    //   } catch (error) {
    //     console.error('ZIP下载失败，尝试逐个下载:', error)
    //     // 如果ZIP下载失败，逐个下载笔记
    //     await this.downloadNotesIndividually(notes)
    //   }
    // },

    // 逐个下载笔记（备用方法）
    async downloadNotesIndividually(notes) {
      for (let i = 0; i < notes.length; i++) {
        try {
          await this.downloadSingleNote(notes[i])
          // 添加小延迟，避免浏览器阻止多个下载
          if (i < notes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } catch (error) {
          console.error(`下载第${i + 1}个笔记失败:`, error)
        }
      }
    },

    // 格式化笔记内容用于下载
    formatNoteForDownload(note) {
      const title = note.noteTitle || '未命名笔记'
      const content = note.noteContent || ''
      const createTime = this.formatDate(note.createTime)
      
      return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
        }
        .note-header {
            border-bottom: 2px solid #e1e8ed;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .note-title {
            font-size: 28px;
            font-weight: bold;
            color: #2c3e50;
            margin: 0 0 10px 0;
        }
        .note-meta {
            color: #7f8c8d;
            font-size: 14px;
        }
        .note-content {
            font-size: 16px;
            line-height: 1.8;
        }
        .note-content h1, .note-content h2, .note-content h3, .note-content h4, .note-content h5, .note-content h6 {
            color: #2c3e50;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        .note-content p {
            margin-bottom: 15px;
        }
        .note-content ul, .note-content ol {
            margin-bottom: 15px;
            padding-left: 30px;
        }
        .note-content blockquote {
            border-left: 4px solid #3498db;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #f8f9fa;
            color: #555;
        }
        .note-content code {
            background-color: #f1f2f6;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        .note-content pre {
            background-color: #f1f2f6;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
        }
        .note-content img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 20px auto;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .note-content a {
            color: #3498db;
            text-decoration: none;
        }
        .note-content a:hover {
            text-decoration: underline;
        }
        .note-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e1e8ed;
            color: #7f8c8d;
            font-size: 12px;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="note-header">
        <h1 class="note-title">${title}</h1>
        <div class="note-meta">
            创建时间: ${createTime}
        </div>
    </div>
    
    <div class="note-content">
        ${content}
    </div>
    
    <div class="note-footer">
        此文件由记事本系统导出 - ${new Date().toLocaleString('zh-CN')}
    </div>
</body>
</html>`
    },

    // 删除
    handleDelete() {
      if (this.selectedItems.length === 0) {
        this.$message.warning('请选择要删除的项目')
        return
      }

      // 分类选中的项目
      const directories = this.selectedItems.filter(item => item.type === 'directory')
      const notes = this.selectedItems.filter(item => item.type === 'note')

      let confirmMessage = '确定要删除选中的项目吗？\n'
      if (directories.length > 0) {
        confirmMessage += `目录: ${directories.length} 个\n`
      }
      if (notes.length > 0) {
        confirmMessage += `笔记: ${notes.length} 个\n`
      }

      this.$confirm(confirmMessage, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          // 删除目录
          if (directories.length > 0) {
            if (directories.length === 1) {
              await notebookApi.deleteDirectory(directories[0].directoryId)
          } else {
              const directoryIds = directories.map(item => item.directoryId)
            await notebookApi.batchDeleteDirectory(directoryIds)
            }
          }

          // 删除笔记
          if (notes.length > 0) {
            if (notes.length === 1) {
              await notebookApi.deleteNote(notes[0].noteId)
            } else {
              const noteIds = notes.map(item => item.noteId)
              await notebookApi.batchDeleteNote(noteIds)
            }
          }

          this.$message.success('删除成功')
          this.loadDirectoryList()
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    // 重命名
    handleRename(row) {
      this.renameForm.directoryName = row.directoryName
      this.renameForm.directoryId = row.directoryId
      this.renameDialogVisible = true
    },

    // 确认重命名
    async handleConfirmRename() {
      this.$refs.renameForm.validate(async (valid) => {
        if (valid) {
          this.renameLoading = true
          try {
            const data = {
              directoryId: this.renameForm.directoryId,
              directoryName: this.renameForm.directoryName
            }
            await notebookApi.renameDirectory(data)
            this.$message.success('重命名成功')
            this.renameDialogVisible = false
            this.loadDirectoryList()
          } catch (error) {
            this.$message.error('重命名失败')
          } finally {
            this.renameLoading = false
          }
        }
      })
    },

    // 搜索输入处理（实时搜索）
    handleSearchInput() {
      // 实时搜索，无需额外处理，computed会自动更新
    },

    // 搜索
    handleSearch() {
      // 搜索逻辑已在computed中实现
      if (this.searchKeyword) {
        const resultCount = this.filteredDirectoryList.length
        this.$message.info(`找到 ${resultCount} 个匹配的文件或目录`)
      }
    },


    // 清空搜索
    clearSearch() {
      this.searchKeyword = ''
    },

    // 加载附件列表
    async loadAttachments() {
      if (!this.currentParentId) {
        this.attachmentList = []
        return
      }

      this.attachmentLoading = true
      try {
        const result = await fileUploadService.getAttachments('notebook', this.currentParentId)
        
        if (result.success) {
          this.attachmentList = result.data || []
          console.log('加载附件列表成功:', this.attachmentList)
        } else {
          console.error('加载附件列表失败:', result.message)
          this.attachmentList = []
        }
      } catch (error) {
        console.error('加载附件列表异常:', error)
        this.attachmentList = []
      } finally {
        this.attachmentLoading = false
      }
    },

    // 查看附件
    viewAttachment(attachmentId, fileName, attachmentSize = 0, uploadDate = '') {
      // 通过路由跳转到附件预览页面
      this.$router.push({
        name: 'viewAttachment',
        params: { 
          attachmentId: attachmentId 
        },
        query: { 
          title: `附件预览 - ${fileName}`,
          fileName: fileName,
          attachmentSize: attachmentSize,
          uploadDate: uploadDate
        }
      })
    },

    // 下载附件
    async downloadAttachment(attachmentId, fileName) {
      try {
        const result = await fileUploadService.downloadAttachment(attachmentId, fileName)
        
        if (result.success) {
          this.$message.success('下载成功')
        } else {
          this.$message.error(result.message)
        }
      } catch (error) {
        console.error('下载附件失败:', error)
        this.$message.error('下载失败，请重试')
      }
    },

    // 删除附件
    async deleteAttachment(attachmentId) {
      try {
        await this.$confirm('确定要删除这个附件吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const result = await fileUploadService.deleteAttachment(attachmentId)
        
        if (result.success) {
          this.$message.success('删除成功')
          // 重新加载附件列表
          await this.loadAttachments()
        } else {
          this.$message.error(result.message)
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除附件失败:', error)
          this.$message.error('删除失败，请重试')
        }
      }
    },

    // 根据文件名获取文件图标
    getAttachmentFileIcon(fileName) {
      if (!fileName) return 'el-icon-document'
      
      // 获取文件扩展名
      const ext = fileName.split('.').pop().toLowerCase()
      
      const iconMap = {
        // 文档类型
        'pdf': 'el-icon-document',
        'doc': 'el-icon-document',
        'docx': 'el-icon-document',
        'txt': 'el-icon-document',
        // 表格类型
        'xls': 'el-icon-tickets',
        'xlsx': 'el-icon-tickets',
        'csv': 'el-icon-tickets',
        // 图片类型
        'jpg': 'el-icon-picture',
        'jpeg': 'el-icon-picture',
        'png': 'el-icon-picture',
        'gif': 'el-icon-picture',
        'bmp': 'el-icon-picture',
        'svg': 'el-icon-picture',
        // 压缩文件
        'zip': 'el-icon-folder-opened',
        'rar': 'el-icon-folder-opened',
        '7z': 'el-icon-folder-opened',
        // 视频文件
        'mp4': 'el-icon-video-camera',
        'avi': 'el-icon-video-camera',
        'mov': 'el-icon-video-camera',
        // 音频文件
        'mp3': 'el-icon-phone',
        'wav': 'el-icon-phone'
      }
      
      return iconMap[ext] || 'el-icon-document'
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 格式化笔记内容大小
    formatNoteSize(noteContent) {
      if (!noteContent) return '0 B'
      
      // 计算文本内容的字节大小（UTF-8编码）
      const bytes = new Blob([noteContent]).size
      return this.formatFileSize(bytes)
    },

    // 上传成功回调
    handleUploadSuccess(data) {
      // 重新加载附件列表
      this.loadAttachments()
      // 刷新目录列表
      this.loadDirectoryList()
    },

    // 上传失败回调
    handleUploadError(error) {
      console.error('上传失败:', error)
    },

    // 取消上传
    handleCancelUpload() {
      this.uploadDialogVisible = false
    },



    // 编辑笔记
    handleEditNote(note) {
      this.openNoteInSystemTab(note, 'edit')
    },

    // 查看笔记
    handleViewNote(note) {
      this.openNoteInSystemTab(note, 'view')
    },

    // 在系统标签页中打开笔记
    openNoteInSystemTab(note, mode = 'view') {
      // 通过路由跳转添加新的系统标签页
      const routeName = mode === 'edit' ? 'noteEditor' : 'noteViewer'
      const routeTitle = mode === 'edit' ? `编辑 - ${note.noteTitle}` : `查看 - ${note.noteTitle}`
      
      // 使用 router.push 跳转到新路由，这会自动添加标签页
      this.$router.push({
        name: routeName,
        params: { noteId: note.noteId },
        query: { 
          title: routeTitle,
          mode: mode 
        }
      })
    },



    // 保存笔记
    async handleSaveNote(noteData) {
      try {
        // 刷新目录列表以显示更新后的笔记
        await this.loadDirectoryList()
      } catch (error) {
        console.error('处理保存结果失败:', error)
        this.$message.error('处理保存结果失败')
      }
    }
  }
    }
</script>

<style scoped>
.notebook-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 缩小操作按钮 */
.action-buttons .el-button {
  padding: 6px 12px;
  font-size: 12px;
  height: 28px;
}

.action-buttons .el-button .el-icon {
  font-size: 12px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

/* 缩小搜索输入框 */
.search-input {
  flex: 1;
  max-width: 150px;
  height: 18px !important;
}

.search-input .el-input__inner {
  height: 18px !important;
  font-size: 9px;
  padding: 0 4px;
  line-height: 18px;
  border-radius: 2px;
}

/* 缩小占位符文字 */
.search-input .el-input__inner::placeholder {
  font-size: 9px;
  color: #c0c4cc;
}

.search-input .el-input-group {
  height: 18px !important;
}

.search-input .el-input-group__append {
  height: 18px !important;
  line-height: 18px;
}

.search-input .el-input-group__append .el-button {
  padding: 1px 4px !important;
  height: 18px !important;
  font-size: 9px;
  line-height: 1;
  min-width: 20px;
  border-radius: 0 2px 2px 0;
}

.search-input .el-input-group__append .el-button .el-icon {
  font-size: 9px;
}

/* 确保整个输入组高度一致 */
.search-input .el-input-group .el-input__inner {
  height: 18px !important;
}


.search-results-info {
  margin-bottom: 15px;
}

.file-list-container {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  font-size: 16px;
  color: #409EFF;
}

.file-name {
  font-size: 14px;
  color: #303133;
}

.dialog-footer {
  text-align: right;
}

/* 表格样式优化 */
.el-table {
  border: none;
}

.el-table th {
  background-color: #fafafa;
  color: #606266;
  font-weight: 500;
  padding: 4px 0;
  font-size: 12px;
}

.el-table td {
  border-bottom: 1px solid #ebeef5;
  padding: 4px 0;
  font-size: 12px;
}

.el-table .el-table__row:hover {
  background-color: #f5f7fa;
}

/* 缩小表格行高度 */
.el-table .el-table__row {
  height: 28px;
}

.el-table th .cell,
.el-table td .cell {
  line-height: 20px;
}

/* 缩小表格中的按钮和标签 */
.el-table .el-button {
  padding: 2px 6px;
  font-size: 10px;
  height: 20px;
}

.el-table .el-button .el-icon {
  font-size: 10px;
}

.el-table .el-tag {
  font-size: 10px;
  padding: 1px 4px;
  height: 18px;
  line-height: 16px;
}

.el-table .file-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.el-table .file-icon {
  font-size: 14px;
}

.el-table .file-name {
  font-size: 12px;
}


/* 返回按钮样式 */
.back-button {
  background-color: #f0f9ff;
  border-color: #0ea5e9;
  color: #0ea5e9;
  margin-right: 10px;
}

.back-button:hover {
  background-color: #0ea5e9;
  border-color: #0ea5e9;
  color: #fff;
}

/* 附件列表样式 */
.attachment-list-container {
  margin-top: 20px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.attachment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background: #fafafa;
}

.attachment-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.attachment-content {
  padding: 0;
  min-height: 100px;
}

.no-attachment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
}

.no-attachment i {
  font-size: 48px;
  margin-bottom: 10px;
}

.no-attachment p {
  margin: 0;
  font-size: 14px;
}

/* 调整大小和时间的字体大小 */
.size-text,
.time-text {
  font-size: 12px;
}


</style>
