import { argv } from './argv'
import { readFile } from 'fs'
import { join } from 'path'
import { promisify } from 'bluebird'

const readFileAsync = promisify(readFile)

async function tryReadLastBuild (src) {
  let file
  try {
    file = await readFileAsync(join(src, 'xbin', 'build.json'))
  } catch (e) {
    return void e
  }
  return JSON.parse(file)
}

export async function binary (compiler, next) {
  if (argv.production || argv.force) {
    return next()
  }

  const build = await tryReadLastBuild(compiler.src)

  if (!build || Buffer.byteLength(compiler.input, 'utf-8') > build.byteLength) {
    return next()
  }

  //artifact exists?
  return next()
}
