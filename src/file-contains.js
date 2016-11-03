import { createReadStream } from 'fs'

export async function fileContainsAsync (filePath, text) {
  const stream = createReadStream(filePath),
    cache = []
  let found = false

  return new Promise(resolve => {
    stream.on('data', function (chunk) {
      if (found) {
        return
      }

      if (cache.length > 1) {
        cache.shift()
      }
      cache.push(chunk)

      var cacheContents = Buffer.concat(cache)

      if (cacheContents.indexOf(text) !== -1) {
        found = true
        resolve(true)
      }
    })

    stream.on('end', () => resolve(found))
    stream.on('error', () => resolve(false))
  })
}
