<template>
  <div class="sports-nav-container">
    <div class="sports-nav-content">
      <!-- SIT -->
      <div class="nav-category">
        <div class="category-header">
          <span class="category-name">SIT</span>
        </div>
        <div class="category-links">
          <a v-for="link in sitLinks" :key="link.name" :href="link.url" class="nav-link" target="_blank">
            {{ link.name }}
          </a>
        </div>
      </div>

      <!-- PAT -->
      <div class="nav-category">
        <div class="category-header">
          <span class="category-name">PAT</span>
        </div>
        <div class="category-links">
          <a v-for="link in patLinks" :key="link.name" :href="link.url" class="nav-link" target="_blank">
            {{ link.name }}
          </a>
        </div>
      </div>

      <!-- DEMO -->
      <div class="nav-category">
        <div class="category-header">
          <span class="category-name">DEMO</span>
        </div>
        <div class="category-links">
          <a v-for="link in demoLinks" :key="link.name" :href="link.url" class="nav-link" target="_blank">
            {{ link.name }}
          </a>
        </div>
      </div>

      <!-- SDK -->
      <div class="nav-category">
        <div class="category-header">
          <span class="category-name">SDK</span>
        </div>
        <div class="category-links">
          <a v-for="link in sdkLinks" :key="link.name" :href="link.url" class="nav-link" target="_blank">
            {{ link.name }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DtpReleaseNavigation',
  data() {
    return {
      sitLinks: [
        { name: '管理台后端', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/bootWeb-starter-sit/build?delay=0sec' },
        { name: '管理台前端', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/smartvue-sit/build?delay=0sec' },
        { name: '外呼', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/callEtc-sit/build?delay=0sec' },
        { name: '缓存', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/cache_modul_server-sit/build?delay=0sec' },
        { name: '配置中心', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/config-server-sit/build?delay=0sec' },
        { name: '后管', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/idqm_server_sit/build?delay=0sec' },
        { name: '锁', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/lock-sit/build?delay=0sec' },
        { name: '消息采集', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/msgdaq-sit/build?delay=0sec' },
        { name: '注册中心', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/register-sit/build?delay=0sec' },
        { name: '路由', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/router-sit/build?delay=0sec' },
        { name: '调度', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/schedule_cente-sit/build?delay=0sec' },
        { name: '安全中心', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/security-sit/build?delay=0sec' },
        { name: '文件', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/tfmng-sit/build?delay=0sec' },
        { name: '序号', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/tseq-sit/build?delay=0sec' },
        { name: '注册中心同步', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/rgstr_syn_cent-sit/build?delay=0sec' },
        { name: '文件传输代理', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/sit/job/tfmngAgent-sit/build?delay=0sec' },

      ],
      patLinks: [
        { name: '管理台后端', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/bootWeb-starter-pat/build?delay=0sec' },
        { name: '管理台前端', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/smartvue-pat/build?delay=0sec' },
        { name: '外呼', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/callEtc-pat/build?delay=0sec' },
        { name: '缓存', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/cache_modul_server-pat/build?delay=0sec' },
        { name: '配置中心', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/config-server-pat/build?delay=0sec' },
        { name: '后管', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/idqm_modul-pat/build?delay=0sec' },
        { name: '锁', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/lock-pat/build?delay=0sec' },
        { name: '消息采集', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/msgdaq-pat/build?delay=0sec' },
        { name: '注册中心', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/register-pat/build?delay=0sec' },
        { name: '路由', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/router-pat/build?delay=0sec' },
        { name: '调度', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/schedule_cent-pat/build?delay=0sec' },
        { name: '安全中心', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/security-pat/build?delay=0sec' },
        { name: '文件', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/tfmng-pat/build?delay=0sec' },
        { name: '序号', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/tseq-pat/build?delay=0sec' },
        { name: '注册中心同步', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/rgstr_syn_cent-pat/build?delay=0sec' },
        { name: '文件传输代理', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/pat/job/tfmngAgent-pat/build?delay=0sec' },
      ],
      demoLinks: [
        { name: '通讯', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/demo/job/comm_modul_demo/build?delay=0sec' },
        { name: '消息', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/demo/job/message_demo/build?delay=0sec' },
        { name: '缓存', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/demo/job/cache_modul_demo/build?delay=0sec' },
        { name: '配置中心', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/view/demo/job/config_server_demo/build?delay=0sec' },
      ],
      sdkLinks: [
        { name: 'SNAPSHOT快照版', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/job/A_publish-depency/build?delay=0sec' },
        { name: 'RELEASE发布版', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/job/A_PublishPackage-RELEASE/build?delay=0sec' },
        { name: 'RELEASE发布版-补充', url: 'http://9.1.70.112:8080/view/DTP/job/DTP_Compile/job/A_PublishPackage-RELEASE-buchong/build?delay=0sec' },
      ],
    }
  }
}
</script>

<style scoped>
  .sports-nav-container {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
  }

  .sports-nav-content {
    max-width: 1000px;
    margin: 0 auto;
    background: #fff;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .nav-category {
    margin-bottom: 30px;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 20px;
  }

  .nav-category:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .category-header {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .category-name {
    font-size: 16px;
    font-weight: 700;
    color: #303133;
  }

  .category-count {
    font-size: 14px;
    color: #909399;
    margin-left: 5px;
  }

  .category-links {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }

  .nav-link {
    display: block;
    padding: 8px 12px;
    text-align: center;
    color: #409eff;
    text-decoration: none;
    font-size: 14px;
    border-radius: 4px;
    transition: all 0.3s;
    background-color: #f5f7fa;
  }

  .nav-link:hover {
    background-color: #ecf5ff;
    color: #66b1ff;
    text-decoration: underline;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .sports-nav-content {
      padding: 20px;
    }

    .category-links {
      grid-template-columns: repeat(3, 1fr);
    }

    .nav-link {
      font-size: 13px;
      padding: 6px 8px;
    }
  }

  @media (max-width: 480px) {
    .category-links {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
