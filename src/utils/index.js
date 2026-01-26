/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number|string|Date} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (!time) {
    return ''
  }
  
  let d
  // 如果是 Date 对象，直接使用
  if (time instanceof Date) {
    d = time
  } else if (typeof time === 'string') {
    // 如果是字符串，检查是否是 ISO 8601 格式或其他日期字符串格式
    if (time.includes('T') || time.includes('-') || time.includes('/')) {
      // ISO 8601 格式或其他日期字符串格式，直接传给 Date 构造函数
      d = new Date(time)
    } else if (/^[0-9]+$/.test(time)) {
      // 纯数字字符串，可能是时间戳
      const numTime = parseInt(time)
      if (('' + numTime).length === 10) {
        d = new Date(numTime * 1000)
      } else {
        d = new Date(numTime)
      }
    } else {
      d = new Date(time)
    }
  } else if (typeof time === 'number') {
    // 如果是数字，检查是否是10位时间戳
    if (('' + time).length === 10) {
      d = new Date(time * 1000)
    } else {
      d = new Date(time)
    }
  } else {
    d = new Date(time)
  }
  
  // 检查日期是否有效
  if (isNaN(d.getTime())) {
    return ''
  }
  
  const now = Date.now()
  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(d, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}
