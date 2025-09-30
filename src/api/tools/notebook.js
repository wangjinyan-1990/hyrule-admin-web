import request from '@/utils/request'

export default {
  /**
   * 获取记事本目录列表
   * @param {Object} params - 查询参数
   * @param {String} params.userId - 用户ID
   * @param {String} params.parentId - 父目录ID（可选，不传则查询根目录）
   * @returns {Promise} 目录列表
   */
  getDirectoryList(params) {
    return request({
      url: '/tools/notebook/directory/list',
      method: 'get',
      params
    })
  },

  /**
   * 获取子目录列表
   * @param {Object} params - 查询参数
   * @param {String} params.userId - 用户ID
   * @param {String} params.parentId - 父目录ID
   * @returns {Promise} 子目录列表
   */
  getChildDirectories(params) {
    return request({
      url: '/tools/notebook/directory/children',
      method: 'get',
      params
    })
  },

  /**
   * 创建记事本目录
   * @param {Object} data - 目录数据
   * @param {String} data.directoryName - 目录名称
   * @param {String} data.directoryParentId - 父目录ID
   * @param {String} data.userId - 用户ID
   * @returns {Promise} 创建结果
   */
  createDirectory(data) {
    return request({
      url: '/tools/notebook/directory/create',
      method: 'post',
      data
    })
  },

  /**
   * 重命名记事本目录
   * @param {Object} data - 重命名数据
   * @param {String} data.directoryId - 目录ID
   * @param {String} data.directoryName - 新目录名称
   * @returns {Promise} 重命名结果
   */
  renameDirectory(data) {
    return request({
      url: '/tools/notebook/directory/rename',
      method: 'put',
      data
    })
  },

  /**
   * 删除记事本目录
   * @param {String} directoryId - 目录ID
   * @returns {Promise} 删除结果
   */
  deleteDirectory(directoryId) {
    return request({
      url: `/tools/notebook/directory/delete/${directoryId}`,
      method: 'delete'
    })
  },

  /**
   * 批量删除记事本目录
   * @param {Array} directoryIds - 目录ID数组
   * @returns {Promise} 删除结果
   */
  batchDeleteDirectory(directoryIds) {
    return request({
      url: '/tools/notebook/directory/batchDelete',
      method: 'delete',
      data: { directoryIds }
    })
  },

  /**
   * 移动记事本目录
   * @param {Object} data - 移动数据
   * @param {String} data.directoryId - 目录ID
   * @param {String} data.newParentId - 新父目录ID
   * @returns {Promise} 移动结果
   */
  moveDirectory(data) {
    return request({
      url: '/tools/notebook/directory/move',
      method: 'put',
      data
    })
  },

  /**
   * 获取目录详情
   * @param {String} directoryId - 目录ID
   * @returns {Promise} 目录详情
   */
  getDirectoryDetail(directoryId) {
    return request({
      url: `/tools/notebook/directory/detail/${directoryId}`,
      method: 'get'
    })
  },

  /**
   * 获取笔记列表
   * @param {Object} params - 查询参数
   * @param {String} params.userId - 用户ID
   * @param {String} params.directoryId - 目录ID（可选，不传则查询所有笔记）
   * @param {String} params.keyword - 搜索关键词（可选）
   * @param {Number} params.pageNum - 页码（可选，默认1）
   * @param {Number} params.pageSize - 每页大小（可选，默认10）
   * @returns {Promise} 笔记列表
   */
  getNoteList(params) {
    return request({
      url: '/tools/notebook/note/list',
      method: 'get',
      params
    })
  },

  /**
   * 获取笔记详情
   * @param {String} noteId - 笔记ID
   * @returns {Promise} 笔记详情
   */
  getNoteDetail(noteId) {
    return request({
      url: `/tools/notebook/note/detail/${noteId}`,
      method: 'get'
    })
  },

  /**
   * 创建笔记
   * @param {Object} data - 笔记数据
   * @param {String} data.noteTitle - 笔记标题
   * @param {String} data.noteContent - 笔记内容（HTML格式）
   * @param {String} data.directoryId - 目录ID（可选，不传则保存到根目录）
   * @param {String} data.userId - 用户ID
   * @param {String} data.createTime - 创建时间（可选）
   * @param {Number} data.fileSize - 文件大小（字节，可选）
   * @returns {Promise} 创建结果
   */
  createNote(data) {
    return request({
      url: '/tools/notebook/note/create',
      method: 'post',
      data
    })
  },

  /**
   * 更新笔记
   * @param {Object} data - 笔记数据
   * @param {String} data.noteId - 笔记ID
   * @param {String} data.noteTitle - 笔记标题
   * @param {String} data.noteContent - 笔记内容（HTML格式）
   * @param {String} data.directoryId - 目录ID（可选）
   * @param {String} data.userId - 用户ID
   * @param {String} data.createTime - 创建时间（可选）
   * @param {Number} data.fileSize - 文件大小（字节，可选）
   * @returns {Promise} 更新结果
   */
  updateNote(data) {
    return request({
      url: '/tools/notebook/note/update',
      method: 'put',
      data
    })
  },

  /**
   * 删除笔记
   * @param {String} noteId - 笔记ID
   * @returns {Promise} 删除结果
   */
  deleteNote(noteId) {
    return request({
      url: `/tools/notebook/note/delete/${noteId}`,
      method: 'delete'
    })
  },

  /**
   * 批量删除笔记
   * @param {Array} noteIds - 笔记ID数组
   * @returns {Promise} 删除结果
   */
  batchDeleteNote(noteIds) {
    return request({
      url: '/tools/notebook/note/batchDelete',
      method: 'delete',
      data: { noteIds }
    })
  },

  /**
   * 移动笔记到其他目录
   * @param {Object} data - 移动数据
   * @param {String} data.noteId - 笔记ID
   * @param {String} data.directoryId - 目标目录ID
   * @returns {Promise} 移动结果
   */
  moveNote(data) {
    return request({
      url: '/tools/notebook/note/move',
      method: 'put',
      data
    })
  },

  /**
   * 复制笔记
   * @param {Object} data - 复制数据
   * @param {String} data.noteId - 源笔记ID
   * @param {String} data.directoryId - 目标目录ID（可选）
   * @param {String} data.title - 新笔记标题（可选，不传则自动生成）
   * @returns {Promise} 复制结果
   */
  copyNote(data) {
    return request({
      url: '/tools/notebook/note/copy',
      method: 'post',
      data
    })
  },

  /**
   * 搜索笔记
   * @param {Object} params - 搜索参数
   * @param {String} params.userId - 用户ID
   * @param {String} params.keyword - 搜索关键词
   * @param {String} params.directoryId - 目录ID（可选，限制搜索范围）
   * @param {Array} params.tags - 标签过滤（可选）
   * @param {String} params.startDate - 开始日期（可选）
   * @param {String} params.endDate - 结束日期（可选）
   * @param {Number} params.pageNum - 页码（可选，默认1）
   * @param {Number} params.pageSize - 每页大小（可选，默认10）
   * @returns {Promise} 搜索结果
   */
  searchNotes(params) {
    return request({
      url: '/tools/notebook/note/search',
      method: 'get',
      params
    })
  },

  /**
   * 获取笔记统计信息
   * @param {Object} params - 查询参数
   * @param {String} params.userId - 用户ID
   * @param {String} params.directoryId - 目录ID（可选）
   * @returns {Promise} 统计信息
   */
  getNoteStatistics(params) {
    return request({
      url: '/tools/notebook/note/statistics',
      method: 'get',
      params
    })
  }
}
