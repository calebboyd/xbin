var vm = require('vm'),
  fs = require('fs'),
  stream = fs.createReadStream(process.execPath),
  removeListeners = () => stream.removeAllListeners(),
  markerStart = '/*******************xbin-',
  markerEnd = '*************************/',
  xbinStart = markerStart + 'start' + markerEnd,
  xbinEnd = markerStart + 'end' + markerEnd,
  startFound = false,
  endFound = false,
  cache = [],
  code = ''

stream.on('data', function (chunk) {
  if (startFound && endFound) {
    return
  }

  if (cache.length > 1) {
    cache.shift()
  }
  cache.push(chunk)

  var cacheContents = Buffer.concat(cache),
    startIndex = cacheContents.indexOf(xbinStart),
    endIndex = cacheContents.indexOf(xbinEnd)

  if (!startFound && startIndex !== -1 && endIndex !== -1) {
    startFound = true
    endFound = true
    code = cacheContents.slice(startIndex, endIndex).toString()
    return
  }

  if (!startFound && startIndex !== -1) {
    startFound = true
    code += cacheContents.slice(startIndex).toString()
    return
  }

  if (startFound && endIndex !== -1) {
    endFound = true
    code += cacheContents.slice(cache[0].length, endIndex + xbinEnd.length).toString()

    return
  }

  if (startFound) {
    code += chunk.toString()
  }
})

stream.on('error', (e) => {
  removeListeners()
  throw e
})

stream.on('end', () => {
  removeListeners()
  if (!startFound || !endFound) {
    throw new Error('Could not find xbin output to execute')
  }

  vm.runInThisContext('(function (require, __filename, __dirname) {' + code + '});', {
    filename: 'xbin-output.js',
    lineOffset: 0,
    displayErrors: true
  })(require, __filename, __dirname)
})
