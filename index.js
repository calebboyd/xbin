#!/usr/bin/env node
var xbin = require('./lib/xbin')

if (require.main === module) {
  xbin.build(xbin.options).catch(function (e) { console.error(e) })
} else {
  module.exports = xbin
}
