
import { readFile } from 'fs'
import { normalize } from 'path'
import { promisify } from 'bluebird'

const readFileAsync = promisify(readFile)

export async function ico (compiler, next) {
  if (compiler.download) {
    return next()
  }
  if (!compiler.ico) {
    return next()
  }
  const file = await compiler.readFileAsync('src/res/node.ico')
  file.contents = await readFileAsync(normalize(compiler.ico))
  return next()
}
