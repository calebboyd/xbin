import { join, dirname } from 'path'
import { readdir, stat, readFile, unlink, writeFile } from 'fs'
import { promisify, map as mapAsync } from 'bluebird'
import mkdirp from 'mkdirp'

const mkdirpAsync = promisify(mkdirp),
  statAsync = promisify(stat),
  unlinkAsync = promisify(unlink),
  readdirAsync = promisify(readdir),
  writeAnyFileAysnc = promisify(writeFile),
  readFileAsync = promisify(readFile),
  readDirAsync = (dir) => {
    return readdirAsync(dir).map(async (file) => {
      const path = join(dir, file)
      return (await statAsync(path)).isDirectory() ? readDirAsync(path) : path
    }).reduce((a, b) => a.concat(b), [])
  },
  maybeReadFileContents = (file) => {
    return readFileAsync(file, 'utf-8')
      .catch(e => {
        if (e.code === 'ENOENT') {
          return ''
        }
        throw e
      })
  }

/**
 * Restores original files so xbin operates idempotently (ish -- custom files are dereferenced and zeroed out)
 * After patches are staged:
 *  - removes previous original source files
 *  - saves original versions of staged patched files
 *  - writes the patched versions
 */
export async function artifacts ({ files, writeFileAsync, src, download }, next) {
  if (download) {
    return next()
  }
  const temp = join(src, 'xbin')
  await mkdirpAsync(temp)
  const tmpFiles = await readDirAsync(temp) //eslint-disable-line one-var

  await mapAsync(tmpFiles, async (path) => {

    return writeFileAsync(path.replace(temp, ''), await readFileAsync(path, 'utf-8'))
  })
  await next()
  await mapAsync(tmpFiles, x => unlinkAsync(x))
  await mapAsync(files, async (file) => {
    const sourceFile = join(src, file.filename),
      tempFile = join(temp, file.filename),
      fileContents = await maybeReadFileContents(sourceFile)

    await mkdirpAsync(dirname(tempFile))
    await writeAnyFileAysnc(tempFile, fileContents)
    await writeFileAsync(file.filename, file.contents)
  })
}
