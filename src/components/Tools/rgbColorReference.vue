<template>
  <div class="rgb-color-reference-container">
    <div class="reference-header">
      <h2>RGB颜色参考对照表</h2>
      <p>提供常用颜色的RGB值和16进制代码参考</p>
    </div>

    <div class="reference-content">
      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索颜色名称..."
          prefix-icon="el-icon-search"
          clearable
          class="search-input"
        />
        <el-select v-model="selectedCategory" placeholder="选择颜色分类" clearable class="category-select">
          <el-option label="全部" value=""></el-option>
          <el-option label="红色系" value="red"></el-option>
          <el-option label="橙色系" value="orange"></el-option>
          <el-option label="黄色系" value="yellow"></el-option>
          <el-option label="绿色系" value="green"></el-option>
          <el-option label="青色系" value="cyan"></el-option>
          <el-option label="蓝色系" value="blue"></el-option>
          <el-option label="紫色系" value="purple"></el-option>
          <el-option label="粉色系" value="pink"></el-option>
          <el-option label="棕色系" value="brown"></el-option>
          <el-option label="灰色系" value="gray"></el-option>
          <el-option label="白色系" value="white"></el-option>
        </el-select>
      </div>

      <!-- 颜色表格 -->
      <div class="color-table-wrapper">
        <el-table
          :data="filteredColors"
          stripe
          border
          style="width: 100%"
          :height="tableHeight"
        >
          <el-table-column label="表色效果" width="100" align="center">
            <template slot-scope="scope">
              <div
                class="color-preview"
                :style="{ backgroundColor: scope.row.hex }"
                @click="copyColor(scope.row.hex)"
              ></div>
            </template>
          </el-table-column>
          
          <el-table-column prop="nameCn" label="中文名称" width="120" align="center"></el-table-column>
          
          <el-table-column prop="nameEn" label="英文名称" width="150" align="center"></el-table-column>
          
          <el-table-column label="R.G.B" width="120" align="center">
            <template slot-scope="scope">
              <span class="rgb-value">{{ scope.row.rgb }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="hex" label="16进制" width="100" align="center">
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="copyColor(scope.row.hex)"
                class="hex-button"
              >
                {{ scope.row.hex }}
              </el-button>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="copyColor(scope.row.hex)">
                复制16进制
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 统计信息 -->
      <div class="statistics">
        <span>共 {{ filteredColors.length }} 种颜色</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RgbColorReference',
  data() {
    return {
      searchKeyword: '',
      selectedCategory: '',
      tableHeight: 600,
      colors: [
        // 白色系
        { nameCn: '雪白', nameEn: 'Snow', rgb: '255 250 250', hex: '#FFFAFA', category: 'white' },
        { nameCn: '幽灵白', nameEn: 'GhostWhite', rgb: '248 248 255', hex: '#F8F8FF', category: 'white' },
        { nameCn: '白烟', nameEn: 'WhiteSmoke', rgb: '245 245 245', hex: '#F5F5F5', category: 'white' },
        { nameCn: '海贝壳', nameEn: 'Seashell', rgb: '255 245 238', hex: '#FFF5EE', category: 'white' },
        { nameCn: '米色', nameEn: 'Beige', rgb: '245 245 220', hex: '#F5F5DC', category: 'white' },
        { nameCn: '旧蕾丝', nameEn: 'OldLace', rgb: '253 245 230', hex: '#FDF5E6', category: 'white' },
        { nameCn: '花白', nameEn: 'FloralWhite', rgb: '255 250 240', hex: '#FFFAF0', category: 'white' },
        { nameCn: '象牙白', nameEn: 'Ivory', rgb: '255 255 240', hex: '#FFFFF0', category: 'white' },
        { nameCn: '古董白', nameEn: 'AntiqueWhite', rgb: '250 235 215', hex: '#FAEBD7', category: 'white' },
        { nameCn: '亚麻色', nameEn: 'Linen', rgb: '250 240 230', hex: '#FAF0E6', category: 'white' },
        { nameCn: '淡紫丁香', nameEn: 'LavenderBlush', rgb: '255 240 245', hex: '#FFF0F5', category: 'white' },
        { nameCn: '薄雾玫瑰', nameEn: 'MistyRose', rgb: '255 228 225', hex: '#FFE4E1', category: 'white' },
        
        // 灰色系
        { nameCn: '庚斯博罗灰', nameEn: 'Gainsboro', rgb: '220 220 220', hex: '#DCDCDC', category: 'gray' },
        { nameCn: '浅灰', nameEn: 'LightGrey', rgb: '211 211 211', hex: '#D3D3D3', category: 'gray' },
        { nameCn: '银色', nameEn: 'Silver', rgb: '192 192 192', hex: '#C0C0C0', category: 'gray' },
        { nameCn: '暗灰', nameEn: 'DarkGray', rgb: '169 169 169', hex: '#A9A9A9', category: 'gray' },
        { nameCn: '灰色', nameEn: 'Gray', rgb: '128 128 128', hex: '#808080', category: 'gray' },
        { nameCn: '昏灰', nameEn: 'DimGray', rgb: '105 105 105', hex: '#696969', category: 'gray' },
        { nameCn: '浅石板灰', nameEn: 'LightSlateGray', rgb: '119 136 153', hex: '#778899', category: 'gray' },
        { nameCn: '石板灰', nameEn: 'SlateGray', rgb: '112 128 144', hex: '#708090', category: 'gray' },
        { nameCn: '暗石板灰', nameEn: 'DarkSlateGray', rgb: '47 79 79', hex: '#2F4F4F', category: 'gray' },
        { nameCn: '黑色', nameEn: 'Black', rgb: '0 0 0', hex: '#000000', category: 'gray' },
        
        // 红色系
        { nameCn: '印度红', nameEn: 'IndianRed', rgb: '205 92 92', hex: '#CD5C5C', category: 'red' },
        { nameCn: '浅珊瑚色', nameEn: 'LightCoral', rgb: '240 128 128', hex: '#F08080', category: 'red' },
        { nameCn: '鲑红', nameEn: 'Salmon', rgb: '250 128 114', hex: '#FA8072', category: 'red' },
        { nameCn: '暗鲑红', nameEn: 'DarkSalmon', rgb: '233 150 122', hex: '#E9967A', category: 'red' },
        { nameCn: '浅鲑红', nameEn: 'LightSalmon', rgb: '255 160 122', hex: '#FFA07A', category: 'red' },
        { nameCn: '猩红', nameEn: 'Crimson', rgb: '220 20 60', hex: '#DC143C', category: 'red' },
        { nameCn: '红色', nameEn: 'Red', rgb: '255 0 0', hex: '#FF0000', category: 'red' },
        { nameCn: '火砖色', nameEn: 'FireBrick', rgb: '178 34 34', hex: '#B22222', category: 'red' },
        { nameCn: '暗红', nameEn: 'DarkRed', rgb: '139 0 0', hex: '#8B0000', category: 'red' },
        
        // 粉色系
        { nameCn: '粉红', nameEn: 'Pink', rgb: '255 192 203', hex: '#FFC0CB', category: 'pink' },
        { nameCn: '浅粉红', nameEn: 'LightPink', rgb: '255 182 193', hex: '#FFB6C1', category: 'pink' },
        { nameCn: '热情粉红', nameEn: 'HotPink', rgb: '255 105 180', hex: '#FF69B4', category: 'pink' },
        { nameCn: '深粉红', nameEn: 'DeepPink', rgb: '255 20 147', hex: '#FF1493', category: 'pink' },
        { nameCn: '中紫红', nameEn: 'MediumVioletRed', rgb: '199 21 133', hex: '#C71585', category: 'pink' },
        { nameCn: '苍白紫罗兰红', nameEn: 'PaleVioletRed', rgb: '219 112 147', hex: '#DB7093', category: 'pink' },
        
        // 橙色系
        { nameCn: '珊瑚', nameEn: 'Coral', rgb: '255 127 80', hex: '#FF7F50', category: 'orange' },
        { nameCn: '番茄', nameEn: 'Tomato', rgb: '255 99 71', hex: '#FF6347', category: 'orange' },
        { nameCn: '橙红', nameEn: 'OrangeRed', rgb: '255 69 0', hex: '#FF4500', category: 'orange' },
        { nameCn: '暗橙', nameEn: 'DarkOrange', rgb: '255 140 0', hex: '#FF8C00', category: 'orange' },
        { nameCn: '橙色', nameEn: 'Orange', rgb: '255 165 0', hex: '#FFA500', category: 'orange' },
        
        // 黄色系
        { nameCn: '金色', nameEn: 'Gold', rgb: '255 215 0', hex: '#FFD700', category: 'yellow' },
        { nameCn: '黄色', nameEn: 'Yellow', rgb: '255 255 0', hex: '#FFFF00', category: 'yellow' },
        { nameCn: '浅黄', nameEn: 'LightYellow', rgb: '255 255 224', hex: '#FFFFE0', category: 'yellow' },
        { nameCn: '柠檬绸', nameEn: 'LemonChiffon', rgb: '255 250 205', hex: '#FFFACD', category: 'yellow' },
        { nameCn: '浅秋麒麟黄', nameEn: 'LightGoldenrodYellow', rgb: '250 250 210', hex: '#FAFAD2', category: 'yellow' },
        { nameCn: '番木瓜', nameEn: 'PapayaWhip', rgb: '255 239 213', hex: '#FFEFD5', category: 'yellow' },
        { nameCn: '鹿皮鞋', nameEn: 'Moccasin', rgb: '255 228 181', hex: '#FFE4B5', category: 'yellow' },
        { nameCn: '桃肉色', nameEn: 'PeachPuff', rgb: '255 218 185', hex: '#FFDAB9', category: 'yellow' },
        { nameCn: '苍黄', nameEn: 'PaleGoldenrod', rgb: '238 232 170', hex: '#EEE8AA', category: 'yellow' },
        { nameCn: '卡其色', nameEn: 'Khaki', rgb: '240 230 140', hex: '#F0E68C', category: 'yellow' },
        { nameCn: '暗卡其色', nameEn: 'DarkKhaki', rgb: '189 183 107', hex: '#BDB76B', category: 'yellow' },
        
        // 紫色系
        { nameCn: '薰衣草', nameEn: 'Lavender', rgb: '230 230 250', hex: '#E6E6FA', category: 'purple' },
        { nameCn: '蓟色', nameEn: 'Thistle', rgb: '216 191 216', hex: '#D8BFD8', category: 'purple' },
        { nameCn: '李子色', nameEn: 'Plum', rgb: '221 160 221', hex: '#DDA0DD', category: 'purple' },
        { nameCn: '紫罗兰', nameEn: 'Violet', rgb: '238 130 238', hex: '#EE82EE', category: 'purple' },
        { nameCn: '兰花紫', nameEn: 'Orchid', rgb: '218 112 214', hex: '#DA70D6', category: 'purple' },
        { nameCn: '紫红', nameEn: 'Fuchsia', rgb: '255 0 255', hex: '#FF00FF', category: 'purple' },
        { nameCn: '品红', nameEn: 'Magenta', rgb: '255 0 255', hex: '#FF00FF', category: 'purple' },
        { nameCn: '中兰花紫', nameEn: 'MediumOrchid', rgb: '186 85 211', hex: '#BA55D3', category: 'purple' },
        { nameCn: '中紫色', nameEn: 'MediumPurple', rgb: '147 112 219', hex: '#9370DB', category: 'purple' },
        { nameCn: '蓝紫', nameEn: 'BlueViolet', rgb: '138 43 226', hex: '#8A2BE2', category: 'purple' },
        { nameCn: '暗紫', nameEn: 'DarkViolet', rgb: '148 0 211', hex: '#9400D3', category: 'purple' },
        { nameCn: '暗兰花紫', nameEn: 'DarkOrchid', rgb: '153 50 204', hex: '#9932CC', category: 'purple' },
        { nameCn: '暗品红', nameEn: 'DarkMagenta', rgb: '139 0 139', hex: '#8B008B', category: 'purple' },
        { nameCn: '紫色', nameEn: 'Purple', rgb: '128 0 128', hex: '#800080', category: 'purple' },
        { nameCn: '靛青', nameEn: 'Indigo', rgb: '75 0 130', hex: '#4B0082', category: 'purple' },
        { nameCn: '深蓝紫', nameEn: 'DarkSlateBlue', rgb: '72 61 139', hex: '#483D8B', category: 'purple' },
        { nameCn: '石板蓝', nameEn: 'SlateBlue', rgb: '106 90 205', hex: '#6A5ACD', category: 'purple' },
        { nameCn: '中石板蓝', nameEn: 'MediumSlateBlue', rgb: '123 104 238', hex: '#7B68EE', category: 'purple' },
        
        // 绿色系
        { nameCn: '绿黄', nameEn: 'GreenYellow', rgb: '173 255 47', hex: '#ADFF2F', category: 'green' },
        { nameCn: '查特酒绿', nameEn: 'Chartreuse', rgb: '127 255 0', hex: '#7FFF00', category: 'green' },
        { nameCn: '草坪绿', nameEn: 'LawnGreen', rgb: '124 252 0', hex: '#7CFC00', category: 'green' },
        { nameCn: '柠檬绿', nameEn: 'Lime', rgb: '0 255 0', hex: '#00FF00', category: 'green' },
        { nameCn: '柠檬绿', nameEn: 'LimeGreen', rgb: '50 205 50', hex: '#32CD32', category: 'green' },
        { nameCn: '苍白绿', nameEn: 'PaleGreen', rgb: '152 251 152', hex: '#98FB98', category: 'green' },
        { nameCn: '浅绿', nameEn: 'LightGreen', rgb: '144 238 144', hex: '#90EE90', category: 'green' },
        { nameCn: '中春绿', nameEn: 'MediumSpringGreen', rgb: '0 250 154', hex: '#00FA9A', category: 'green' },
        { nameCn: '春绿', nameEn: 'SpringGreen', rgb: '0 255 127', hex: '#00FF7F', category: 'green' },
        { nameCn: '中海绿', nameEn: 'MediumSeaGreen', rgb: '60 179 113', hex: '#3CB371', category: 'green' },
        { nameCn: '海绿', nameEn: 'SeaGreen', rgb: '46 139 87', hex: '#2E8B57', category: 'green' },
        { nameCn: '森林绿', nameEn: 'ForestGreen', rgb: '34 139 34', hex: '#228B22', category: 'green' },
        { nameCn: '绿色', nameEn: 'Green', rgb: '0 128 0', hex: '#008000', category: 'green' },
        { nameCn: '暗绿', nameEn: 'DarkGreen', rgb: '0 100 0', hex: '#006400', category: 'green' },
        { nameCn: '黄绿', nameEn: 'YellowGreen', rgb: '154 205 50', hex: '#9ACD32', category: 'green' },
        { nameCn: '橄榄土褐', nameEn: 'OliveDrab', rgb: '107 142 35', hex: '#6B8E23', category: 'green' },
        { nameCn: '橄榄', nameEn: 'Olive', rgb: '128 128 0', hex: '#808000', category: 'green' },
        { nameCn: '暗橄榄绿', nameEn: 'DarkOliveGreen', rgb: '85 107 47', hex: '#556B2F', category: 'green' },
        { nameCn: '中碧绿', nameEn: 'MediumAquamarine', rgb: '102 205 170', hex: '#66CDAA', category: 'green' },
        { nameCn: '暗海绿', nameEn: 'DarkSeaGreen', rgb: '143 188 143', hex: '#8FBC8F', category: 'green' },
        { nameCn: '浅海绿', nameEn: 'LightSeaGreen', rgb: '32 178 170', hex: '#20B2AA', category: 'green' },
        { nameCn: '暗青', nameEn: 'DarkCyan', rgb: '0 139 139', hex: '#008B8B', category: 'green' },
        { nameCn: '水鸭色', nameEn: 'Teal', rgb: '0 128 128', hex: '#008080', category: 'green' },
        
        // 蓝/青色系
        { nameCn: '碧绿', nameEn: 'Aqua', rgb: '0 255 255', hex: '#00FFFF', category: 'cyan' },
        { nameCn: '青色', nameEn: 'Cyan', rgb: '0 255 255', hex: '#00FFFF', category: 'cyan' },
        { nameCn: '浅青', nameEn: 'LightCyan', rgb: '224 255 255', hex: '#E0FFFF', category: 'cyan' },
        { nameCn: '苍白绿松石', nameEn: 'PaleTurquoise', rgb: '175 238 238', hex: '#AFEEEE', category: 'cyan' },
        { nameCn: '碧绿', nameEn: 'Aquamarine', rgb: '127 255 212', hex: '#7FFFD4', category: 'cyan' },
        { nameCn: '绿松石', nameEn: 'Turquoise', rgb: '64 224 208', hex: '#40E0D0', category: 'cyan' },
        { nameCn: '中绿松石', nameEn: 'MediumTurquoise', rgb: '72 209 204', hex: '#48D1CC', category: 'cyan' },
        { nameCn: '暗绿松石', nameEn: 'DarkTurquoise', rgb: '0 206 209', hex: '#00CED1', category: 'cyan' },
        { nameCn: '军服蓝', nameEn: 'CadetBlue', rgb: '95 158 160', hex: '#5F9EA0', category: 'blue' },
        { nameCn: '钢青', nameEn: 'SteelBlue', rgb: '70 130 180', hex: '#4682B4', category: 'blue' },
        { nameCn: '浅钢青', nameEn: 'LightSteelBlue', rgb: '176 196 222', hex: '#B0C4DE', category: 'blue' },
        { nameCn: '粉末蓝', nameEn: 'PowderBlue', rgb: '176 224 230', hex: '#B0E0E6', category: 'blue' },
        { nameCn: '浅蓝', nameEn: 'LightBlue', rgb: '173 216 230', hex: '#ADD8E6', category: 'blue' },
        { nameCn: '天蓝', nameEn: 'SkyBlue', rgb: '135 206 235', hex: '#87CEEB', category: 'blue' },
        { nameCn: '浅天蓝', nameEn: 'LightSkyBlue', rgb: '135 206 250', hex: '#87CEFA', category: 'blue' },
        { nameCn: '深天蓝', nameEn: 'DeepSkyBlue', rgb: '0 191 255', hex: '#00BFFF', category: 'blue' },
        { nameCn: '道奇蓝', nameEn: 'DodgerBlue', rgb: '30 144 255', hex: '#1E90FF', category: 'blue' },
        { nameCn: '矢车菊蓝', nameEn: 'CornflowerBlue', rgb: '100 149 237', hex: '#6495ED', category: 'blue' },
        { nameCn: '中蓝紫', nameEn: 'MediumBlue', rgb: '0 0 205', hex: '#0000CD', category: 'blue' },
        { nameCn: '皇家蓝', nameEn: 'RoyalBlue', rgb: '65 105 225', hex: '#4169E1', category: 'blue' },
        { nameCn: '蓝色', nameEn: 'Blue', rgb: '0 0 255', hex: '#0000FF', category: 'blue' },
        { nameCn: '暗蓝', nameEn: 'DarkBlue', rgb: '0 0 139', hex: '#00008B', category: 'blue' },
        { nameCn: '海军蓝', nameEn: 'Navy', rgb: '0 0 128', hex: '#000080', category: 'blue' },
        { nameCn: '午夜蓝', nameEn: 'MidnightBlue', rgb: '25 25 112', hex: '#191970', category: 'blue' },
        
        // 棕色系
        { nameCn: '玉米丝', nameEn: 'Cornsilk', rgb: '255 248 220', hex: '#FFF8DC', category: 'brown' },
        { nameCn: '白杏仁', nameEn: 'BlanchedAlmond', rgb: '255 235 205', hex: '#FFEBCD', category: 'brown' },
        { nameCn: '俾斯麦棕', nameEn: 'Bisque', rgb: '255 228 196', hex: '#FFE4C4', category: 'brown' },
        { nameCn: '纳瓦霍白', nameEn: 'NavajoWhite', rgb: '255 222 173', hex: '#FFDEAD', category: 'brown' },
        { nameCn: '小麦色', nameEn: 'Wheat', rgb: '245 222 179', hex: '#F5DEB3', category: 'brown' },
        { nameCn: '结实木', nameEn: 'BurlyWood', rgb: '222 184 135', hex: '#DEB887', category: 'brown' },
        { nameCn: '棕褐', nameEn: 'Tan', rgb: '210 180 140', hex: '#D2B48C', category: 'brown' },
        { nameCn: '玫瑰棕', nameEn: 'RosyBrown', rgb: '188 143 143', hex: '#BC8F8F', category: 'brown' },
        { nameCn: '沙棕', nameEn: 'SandyBrown', rgb: '244 164 96', hex: '#F4A460', category: 'brown' },
        { nameCn: '秋麒麟', nameEn: 'Goldenrod', rgb: '218 165 32', hex: '#DAA520', category: 'brown' },
        { nameCn: '暗秋麒麟', nameEn: 'DarkGoldenrod', rgb: '184 134 11', hex: '#B8860B', category: 'brown' },
        { nameCn: '秘鲁', nameEn: 'Peru', rgb: '205 133 63', hex: '#CD853F', category: 'brown' },
        { nameCn: '巧克力', nameEn: 'Chocolate', rgb: '210 105 30', hex: '#D2691E', category: 'brown' },
        { nameCn: '马鞍棕', nameEn: 'SaddleBrown', rgb: '139 69 19', hex: '#8B4513', category: 'brown' },
        { nameCn: '赭黄', nameEn: 'Sienna', rgb: '160 82 45', hex: '#A0522D', category: 'brown' },
        { nameCn: '棕色', nameEn: 'Brown', rgb: '165 42 42', hex: '#A52A2A', category: 'brown' },
        { nameCn: '栗色', nameEn: 'Maroon', rgb: '128 0 0', hex: '#800000', category: 'brown' }
      ]
    }
  },
  computed: {
    filteredColors() {
      let result = this.colors

      // 根据搜索关键词过滤
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        result = result.filter(color => 
          color.nameCn.toLowerCase().includes(keyword) ||
          color.nameEn.toLowerCase().includes(keyword) ||
          color.hex.toLowerCase().includes(keyword) ||
          color.rgb.includes(keyword)
        )
      }

      // 根据分类过滤
      if (this.selectedCategory) {
        result = result.filter(color => color.category === this.selectedCategory)
      }

      return result
    }
  },
  methods: {
    copyColor(hex) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(hex).then(() => {
          this.$message.success(`已复制颜色代码: ${hex}`)
        }).catch(() => {
          this.fallbackCopy(hex)
        })
      } else {
        this.fallbackCopy(hex)
      }
    },

    fallbackCopy(text) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        this.$message.success(`已复制颜色代码: ${text}`)
      } catch (err) {
        this.$message.error('复制失败')
      }
      document.body.removeChild(textArea)
    }
  },
  mounted() {
    // 动态计算表格高度
    this.tableHeight = window.innerHeight - 300
    window.addEventListener('resize', () => {
      this.tableHeight = window.innerHeight - 300
    })
  }
}
</script>

<style scoped>
.rgb-color-reference-container {
  padding: 30px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.reference-header {
  text-align: center;
  margin-bottom: 40px;
}

.reference-header h2 {
  font-size: 28px;
  color: #303133;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.reference-header p {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.reference-content {
  max-width: 1400px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.category-select {
  width: 200px;
}

.color-table-wrapper {
  margin-bottom: 20px;
}

.color-preview {
  width: 60px;
  height: 40px;
  margin: 0 auto;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  cursor: pointer;
  transition: all 0.3s;
}

.color-preview:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.rgb-value {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
}

.hex-button {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #409eff;
}

.hex-button:hover {
  color: #66b1ff;
}

.statistics {
  text-align: right;
  padding: 15px;
  color: #909399;
  font-size: 14px;
  border-top: 1px solid #ebeef5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rgb-color-reference-container {
    padding: 20px;
  }

  .reference-content {
    padding: 20px;
  }

  .filter-section {
    flex-direction: column;
  }

  .search-input,
  .category-select {
    max-width: 100%;
    width: 100%;
  }

  .color-preview {
    width: 50px;
    height: 35px;
  }
}

@media (max-width: 480px) {
  .reference-content {
    padding: 15px;
  }

  .reference-header h2 {
    font-size: 22px;
  }

  .reference-header p {
    font-size: 14px;
  }
}
</style>

