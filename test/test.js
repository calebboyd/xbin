var assert = require('assert')
var path = require('path')

assert.ok(['--test', '--test1', '--test2'].every(x => process.argv.find(x)))
assert.ok(global.gc)

assert.equal(process.version, 'v' + process.env.NODE_VERSION)

function testFsPatch () {
  var file = path.normalize('./test-file')
  return Promise.all([new Promise((resolve, reject) => {
      var testFileStream = require('fs').createReadStream(file)
      var testFile = ''
      testFileStream.on('data', (chunk) => {
        testFile += chunk
      })
      testFileStream.on('error', reject)
      testFileStream.on('end', () => {
        testFileStream.removeAllListeners()
        resolve(testFile)
      })
    }),
    new Promise((resolve, reject) => {
      require('fs').readFile(file, (err, resource) => {
        if (err) {
          reject(err)
        }
        resolve(resource)
      })
    })
  ]).then(results => {
    assert.notEqual(results[0].toString(), result[1].toString())
    return results
  }).then(results => {
    var resource = require('fs').readFileSync(file)
    assert.notEqual(results[0].toString(), resource.toString())
    assert.equal(resource.toString(), results[1].toString())
  })
}

testFsPatch().then(() => {
  console.log('Node ' + process.version + ' successfully built with xbin')
  process.exit(0)
}, (error) => {
  console.error(error)
  process.exit(1)
})

/**
 * TODO
 * cross-env NODE_VERSION=4.4.4 xbin -i test.js -o out.exe -r ./test-file -f "--expose-gc" -v 4.4.4
 * //modify test-file (modulo)
 * //execute out.exe --test --test1 --test2
 * //expect output and exit code
 */
