import { normalize } from 'path'
import { Promise, promisify } from 'bluebird'
import { createWriteStream, readFile } from 'fs'
import { argv } from './options'
import { Readable } from 'stream'
import StreamConcat from 'stream-concat'

const readFileAsync = promisify(readFile),
  isWindows = process.platform === 'win32',
  xbinStart = '/*******************xbin-start*************************/\n',
  xbinEnd = '\n/*******************xbin-end*************************/'

function dequoteStdIn (input) {
  input = input.trim()
  if (input.startsWith('\'') && input.endsWith('\'') ||
    input.startsWith('"') && input.endsWith('"')) {
    return input.slice(1).slice(0, -1)
  }
  return input
}

function getStdIn () {
  return new Promise((resolve) => {
    let bundle = ''
    process.stdin.setEncoding('utf-8')
    process.stdin.on('data', chunk => {
      bundle += chunk
    })
    process.stdin.once('end', () => resolve(dequoteStdIn(bundle)))
    process.stdin.resume()
  })
}

async function cli (compiler, next) {
  if (argv.help) {
    process.stdout.write(argv.help)
    process.exit(0)
  }

  if (!compiler.input && !process.stdin.isTTY) {
    compiler.input = await getStdIn()
  } else if (compiler.input) {
    compiler.input = await readFileAsync(normalize(compiler.input), 'utf-8')
  }

  if (!compiler.input) {
    process.stderr.write('\nError: No input file specified...\nAborting...\n')
    process.exit(1)
  }

  await next()

  const deliverable = await compiler.getDeliverableAsync(),
    inputStream = new Readable(),
    outputStream = new StreamConcat([deliverable, inputStream])

  inputStream.push(xbinStart + compiler.input + xbinEnd)
  inputStream.push(null)

  if (!compiler.output && !process.stdout.isTTY) {
    outputStream.pipe(process.stdout)
  } else {
    outputStream.pipe(
      createWriteStream(normalize(compiler.output || `./xbin_${ Date.now() }${ isWindows ? '.exe' : '' }`))
    )
  }
}

export {
  cli
}
