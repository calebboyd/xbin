var path = require('path')

module.exports = function (source) {
  this.cacheable()
  var newName = path.normalize(this.resourcePath).split(path.delimiter).join('-')
  return `
    var fs = require('fs')
    var dll = new Buffer([${ Array.from(source).toString() }])
    var path = require('path').join(process.cwd(), '${ newName }')
    fs.writeFileSync(path, dll)
    process.dlopen(module, path)
  `
}

module.exports.raw = true
