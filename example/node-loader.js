module.exports = function (source) {
  this.cacheable()
  const byteArrayString = 'var dll = new Buffer([' + Array.from(source).toString() + '])'
  source = null
  return `
    var fs = require('fs')
    ${byteArrayString}
    var path = require('path').join(process.cwd(), 'test.node')
    fs.writeFileSync(path, dll)
    process.dlopen(module, path)
  `
}

module.exports.raw = true
