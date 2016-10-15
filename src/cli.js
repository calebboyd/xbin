import { normalize } from 'path'
import { Promise, promisify } from 'bluebird'
import { createWriteStream, readFile } from 'fs'
import { argv } from './options'

const readFileAsync = promisify(readFile)

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
    process.stderr.write('Error: No input file specified...\nAborting...')
    process.exit(1)
  }

  await next()

  if (!process.stdout.isTTY) {
    compiler.deliverable().pipe(process.stdout)
  } else {
    compiler.deliverable().pipe(
      createWriteStream(normalize(compiler.output))
    )
  }
}

export {
  cli
}
