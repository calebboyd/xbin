var path = require('path')
var crypto = require('crypto')
module.exports = xbinLoader
xbinLoader.raw = true
function xbinLoader(source) {
  this.cacheable()
  var newName = crypto.createHash('md5').update(source).digest('hex') 
    + path.extname(this.resourcePath)
  return `
    var fs = require('fs');
    var dll = new Buffer([${ Array.from(source).toString() }]);
    var path = require('path').join(process.cwd(), '${ newName }');
    fs.writeFileSync(path, dll);
    process.dlopen(module, path);
  `
}
