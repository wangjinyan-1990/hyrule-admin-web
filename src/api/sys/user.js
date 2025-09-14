import request from '@/utils/request'

export default {
  // searchModel是前端传来的数据
  getUserList(searchModel){
    return request({
      url: '/sys/user/list',
      method: 'get',
      // post上传的是json格式,get上传的params
      params:{
        pageNo: searchModel.pageNo,
        pageSize: searchModel.pageSize,
        userName: searchModel.userName,
        loginName: searchModel.loginName,
        phone: searchModel.phone
      }
    });
  },
  // 创建用户
  createUser(user){
    return request({
      url: '/sys/user/create',
      method: 'post',
      data: user
    });
  },
  // 编辑用户
  updateUser(user){
    return request({
      url: '/sys/user/update',
      method: 'put',
      data: user
    });
  }

}

