import { Extract } from 'tar'
import { Gunzip } from 'zlib'
import { get } from 'https'
import { stat } from 'fs'
import { Promise, promisify } from 'bluebird'
import ProgressBar from 'progress'

const statAsync = promisify(stat)

function fetchNodeSource (path, version) {
  const url = `https://nodejs.org/dist/v${ version }/node-v${ version }.tar.gz`
  return new Promise((resolve, reject) => {
    get(url, response => {
      const total = Number.parseInt(response.headers['content-length'], 10),
        bar = new ProgressBar(`Downloading Node ${ version }: :percent`, { total }),
        end = (fn, x) => fn(x) | response.removeAllListeners()

      response.on('data', x => bar.tick(x.length))
      response.pipe(new Gunzip()).pipe(new Extract({ path, strip: 1 }))
        .once('end', () => end(resolve))
        .once('error', (e) => end(reject, e))
    })
  })
}

export async function download ({ src, version }, next) {
  await statAsync(src).then(
    x => !x.isDirectory() && fetchNodeSource(src, version),
    () => fetchNodeSource(src, version)
  )
  return next()
}
