<template>
  <div class="idcard-generator-container">
    <div class="generator-header">
      <h2>身份证号在线生成</h2>
      <p>生成符合格式的身份证号码</p>
    </div>

    <div class="generator-form">
      <!-- 生成数量 -->
      <div class="form-row">
        <div class="form-item">
          <label class="form-label">生成数量</label>
          <el-input
            v-model="generateCount"
            type="number"
            :min="1"
            :max="100"
            placeholder="5"
            class="count-input"
          />
        </div>
      </div>

      <!-- 出生地选择 -->
      <div class="form-row">
        <div class="form-item">
          <label class="form-label">出生地</label>
          <div class="location-selectors">
            <el-select v-model="selectedProvince" placeholder="所在省" @change="onProvinceChange">
              <el-option
                v-for="province in provinces"
                :key="province.code"
                :label="province.name"
                :value="province.code">
              </el-option>
            </el-select>

            <el-select v-model="selectedCity" placeholder="所在市" @change="onCityChange">
              <el-option
                v-for="city in cities"
                :key="city.code"
                :label="city.name"
                :value="city.code">
              </el-option>
            </el-select>

            <el-select v-model="selectedDistrict" placeholder="所在地区">
              <el-option
                v-for="district in districts"
                :key="district.code"
                :label="district.name"
                :value="district.code">
              </el-option>
            </el-select>
          </div>
        </div>
      </div>

      <!-- 出生日期和性别 -->
      <div class="form-row">
        <div class="form-item">
          <label class="form-label">出生日期</label>
          <el-date-picker
            v-model="birthDate"
            type="date"
            placeholder="出生日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            class="date-picker"
          />
        </div>

        <div class="form-item">
          <label class="form-label">性别</label>
          <el-radio-group v-model="gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 输出区域 -->
      <div class="output-section">
        <el-input
          v-model="generatedIds"
          type="textarea"
          :rows="8"
          readonly
          placeholder="生成的身份证号码将显示在这里..."
          class="output-textarea"
        />
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="generateIdCards" :disabled="!canGenerate">
          生成
        </el-button>
        <el-button @click="copyResults" :disabled="!generatedIds.trim()">
          复制
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'IdCardGenerator',
  data() {
    return {
      generateCount: 10,
      selectedProvince: '',
      selectedCity: '',
      selectedDistrict: '',
      birthDate: '',
      gender: '男',
      generatedIds: '',

      // 省份数据
      provinces: [
        { code: '11', name: '北京市' },
        { code: '12', name: '天津市' },
        { code: '13', name: '河北省' },
        { code: '14', name: '山西省' },
        { code: '15', name: '内蒙古自治区' },
        { code: '21', name: '辽宁省' },
        { code: '22', name: '吉林省' },
        { code: '23', name: '黑龙江省' },
        { code: '31', name: '上海市' },
        { code: '32', name: '江苏省' },
        { code: '33', name: '浙江省' },
        { code: '34', name: '安徽省' },
        { code: '35', name: '福建省' },
        { code: '36', name: '江西省' },
        { code: '37', name: '山东省' },
        { code: '41', name: '河南省' },
        { code: '42', name: '湖北省' },
        { code: '43', name: '湖南省' },
        { code: '44', name: '广东省' },
        { code: '45', name: '广西壮族自治区' },
        { code: '46', name: '海南省' },
        { code: '50', name: '重庆市' },
        { code: '51', name: '四川省' },
        { code: '52', name: '贵州省' },
        { code: '53', name: '云南省' },
        { code: '54', name: '西藏自治区' },
        { code: '61', name: '陕西省' },
        { code: '62', name: '甘肃省' },
        { code: '63', name: '青海省' },
        { code: '64', name: '宁夏回族自治区' },
        { code: '65', name: '新疆维吾尔自治区' }
      ],

      cities: [],
      districts: [],

      // 简化的城市数据
      cityData: {
        '11': [{ code: '1101', name: '北京市' }],
        '12': [{ code: '1201', name: '天津市' }],
        '13': [
          { code: '1301', name: '石家庄市' },
          { code: '1302', name: '唐山市' },
          { code: '1303', name: '秦皇岛市' }
        ],
        '31': [{ code: '3101', name: '上海市' }],
        '32': [
          { code: '3201', name: '南京市' },
          { code: '3202', name: '无锡市' },
          { code: '3203', name: '徐州市' }
        ],
        '44': [
          { code: '4401', name: '广州市' },
          { code: '4402', name: '韶关市' },
          { code: '4403', name: '深圳市' }
        ],
        '61': [
          { code: '6101', name: '西安市' },
          { code: '6102', name: '铜川市' },
          { code: '6103', name: '宝鸡市' },
          { code: '6104', name: '咸阳市' },
          { code: '6105', name: '渭南市' },
          { code: '6106', name: '延安市' },
          { code: '6107', name: '汉中市' },
          { code: '6108', name: '榆林市' },
          { code: '6109', name: '安康市' },
          { code: '6111', name: '商洛市' }
        ]
      },
      // 简化的区县数据
      districtData: {
        '1101': [
          { code: '110101', name: '东城区' },
          { code: '110102', name: '西城区' },
          { code: '110105', name: '朝阳区' }
        ],
        '1301': [
          { code: '130101', name: '长安区' },
          { code: '130102', name: '桥东区' },
          { code: '130104', name: '桥西区' }
        ],
        '3201': [
          { code: '320101', name: '玄武区' },
          { code: '320102', name: '白下区' },
          { code: '320104', name: '秦淮区' }
        ],
        '4401': [
          { code: '440101', name: '荔湾区' },
          { code: '440102', name: '越秀区' },
          { code: '440103', name: '海珠区' }
        ],
        '6101': [
          { code: '610102', name: '新城区' },
          { code: '610103', name: '碑林区' },
          { code: '610104', name: '莲湖区' },
          { code: '610111', name: '灞桥区' },
          { code: '610112', name: '未央区' },
          { code: '610113', name: '雁塔区' },
          { code: '610114', name: '阎良区' },
          { code: '610115', name: '临潼区' },
          { code: '610116', name: '长安区' },
          { code: '610117', name: '高陵区' },
          { code: '610118', name: '鄠邑区' },
          { code: '610122', name: '蓝田县' },
          { code: '610124', name: '周至县' }
        ]
      }
    }
  },
  computed: {
    canGenerate() {
      return this.selectedProvince && this.selectedCity && this.selectedDistrict && this.birthDate
    }
  },
  methods: {
    onProvinceChange(provinceCode) {
      this.selectedCity = ''
      this.selectedDistrict = ''
      this.cities = this.cityData[provinceCode] || []
      this.districts = []
    },

    onCityChange(cityCode) {
      this.selectedDistrict = ''
      this.districts = this.districtData[cityCode] || []
    },

    generateIdCards() {
      if (!this.canGenerate) {
        this.$message.warning('请完善所有必填信息')
        return
      }

      const ids = []
      for (let i = 0; i < this.generateCount; i++) {
        const id = this.generateIdCard()
        ids.push(id)
      }

      this.generatedIds = ids.join('\n')
      this.$message.success(`成功生成 ${this.generateCount} 个身份证号码`)
    },

    generateIdCard() {
      // 前6位：地区代码
      let areaCode = this.selectedDistrict

      // 中间8位：出生日期
      const birthDateStr = this.birthDate.replace(/-/g, '')

      // 第15-17位：顺序码
      const sequenceCode = this.generateSequenceCode()

      // 最后1位：校验码
      const checkCode = this.calculateCheckCode(areaCode + birthDateStr + sequenceCode)

      return areaCode + birthDateStr + sequenceCode + checkCode
    },

    generateSequenceCode() {
      // 生成3位顺序码，奇数表示男性，偶数表示女性
      let sequence = Math.floor(Math.random() * 999) + 1

      if (this.gender === '男') {
        // 男性：奇数
        if (sequence % 2 === 0) {
          sequence += 1
        }
      } else {
        // 女性：偶数
        if (sequence % 2 === 1) {
          sequence += 1
        }
      }

      return sequence.toString().padStart(3, '0')
    },

    calculateCheckCode(id17) {
      // 身份证校验码计算
      const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
      const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

      let sum = 0
      for (let i = 0; i < 17; i++) {
        sum += parseInt(id17[i]) * weights[i]
      }

      return checkCodes[sum % 11]
    },

    copyResults() {
      if (!this.generatedIds.trim()) {
        this.$message.warning('没有可复制的内容')
        return
      }

      // 使用现代浏览器的 Clipboard API
      if (navigator.clipboard) {
        navigator.clipboard.writeText(this.generatedIds).then(() => {
          this.$message.success('身份证号码已复制到剪贴板')
        }).catch(() => {
          this.fallbackCopy(this.generatedIds)
        })
      } else {
        this.fallbackCopy(this.generatedIds)
      }
    },

    fallbackCopy(text) {
      // 兼容旧浏览器的复制方法
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message.success('身份证号码已复制到剪贴板')
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textArea)
    }
  },
  mounted() {
    // 初始化默认值
    this.selectedProvince = '11' // 北京市
    this.onProvinceChange('11')
    this.selectedCity = '1101'
    this.onCityChange('1101')
    this.selectedDistrict = '110101'

    // 设置默认出生日期（20年前）
    const today = new Date()
    const defaultDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate())
    this.birthDate = defaultDate.toISOString().split('T')[0]
  }
}
</script>

<style scoped>
.idcard-generator-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.generator-header {
  text-align: center;
  margin-bottom: 40px;
}

.generator-header h2 {
  font-size: 24px;
  color: #409eff;
  margin: 0 0 10px 0;
}

.generator-header p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.generator-form {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: flex;
  gap: 30px;
  margin-bottom: 25px;
  align-items: flex-start;
}

.form-item {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.count-input {
  width: 100px;
}

.count-input >>> .el-input__inner {
  text-align: center;
}

.location-selectors {
  display: flex;
  gap: 10px;
}

.location-selectors .el-select {
  flex: 1;
}

.date-picker {
  width: 200px;
}

.form-item .el-radio-group {
  display: flex;
  gap: 20px;
}

.form-item .el-radio-group .el-radio {
  margin-right: 0;
}

.output-section {
  margin: 30px 0;
}

.output-textarea {
  width: 100%;
}

.output-textarea >>> .el-textarea__inner {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.8;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
  color: #303133;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.action-buttons .el-button {
  min-width: 100px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .idcard-generator-container {
    padding: 20px;
  }

  .generator-form {
    padding: 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 20px;
  }

  .location-selectors {
    flex-direction: column;
  }

  .count-input {
    width: 100%;
  }

  .date-picker {
    width: 100%;
  }

  .form-item .el-radio-group {
    flex-direction: column;
    gap: 10px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .location-selectors {
    gap: 5px;
  }

  .output-textarea >>> .el-textarea__inner {
    font-size: 13px;
  }
}
</style>
