import dl from 'download'
import { stat } from 'fs'
import { promisify } from 'bluebird'
import ProgressBar from 'progress'

const statAsync = promisify(stat)

function fetchNodeSource (dest, version) {
  const url = `https://nodejs.org/dist/v${ version }/node-v${ version }.tar.gz`
  return dl(url, dest, { extract: true, strip: 1 })
    .on('response', (res) => {
      const total = +res.headers['content-length'],
        bar = new ProgressBar(`Downloading Node ${ version }: :percent`, { total })

      res.on('data', data => bar.tick(data.length))
    })
}

export async function download (compiler, next) {
  if (compiler.download) {
    return next()
  }
  const { src, version } = compiler
  await statAsync(src).then(
    x => !x.isDirectory() && fetchNodeSource(src, version),
    () => fetchNodeSource(src, version)
  )
  return next()
}
