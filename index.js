#!/usr/bin/env node
var xbin = require('./lib/xbin')

if (require.main === module) {
  xbin.build(xbin.options)
} else {
  module.exports = xbin
}
