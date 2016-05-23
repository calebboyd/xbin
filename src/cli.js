import parseArgv from 'minimist'
import { join, normalize } from 'path'
import { promisify } from 'bluebird'
import { createWriteStream, readFile } from 'fs'

const isWindows = process.platform === 'win32',
  readFileAsync = promisify(readFile),
  ensureArray = (hash, key) => {
    const value = hash[key] || []
    hash[key] = Array.isArray(value) ? value : [value]
  },
  argv = parseArgv(process.argv, {
    alias: {
      i: 'input',
      p: 'python',
      v: 'version',
      t: 'temp',
      c: 'configure',
      f: 'flags',
      o: 'output',
      m: 'make',
      b: 'bundle',
      r: 'resource',
      flag: 'flags',
      h: 'help'
    },
    default: {
      python: null,
      version: '4.4.4',
      temp: process.env.XBIN_TEMP || join(process.cwd(), '.xbin'),
      make: isWindows ? ['nosign', 'release'] : [],
      output: './xbin_' + Date.now() + (isWindows ? '.exe' : '')
    }
  }),
  help = `
xbin --help              CLI OPTIONS

  -i --input      =/main/bundle/file.js   -- main js bundle
  -o --output     =/my/xbin/binary     -- path to output file
  -p --python     =/path/to/python        -- python executable
  -v --version    =4.4.4                  -- node version
  -t --temp       =/path/for/build/files  -- xbin temp directory (3Gb+) ~ XBIN_TEMP
  -f --flags      ="--expose-gc"          -- v8 flags to include during compilation
  -c --configure                          -- arguments to forward to configure.py script
  -m --make                               -- arguments to forward to make or vcbuild.bat
  -b --bundle                             -- bundle contents eg. \`-b $(cat bundle)\`
  
  -r --resource                           -- Not Supported yet (resource files)
  
  `,
  options = {
    configure: argv.configure,
    make: argv.make,
    resources: argv.resource,
    flags: argv.flags,
    bundles: argv.bundle,
    output: argv.output,
    version: argv.version,
    python: argv.python,
    tempDir: argv.temp,
    src: join(argv.temp, argv.version)
  }

ensureArray(options, 'configure')
ensureArray(options, 'make')
ensureArray(options, 'flags')
ensureArray(options, 'resources')
ensureArray(options, 'bundles')

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
    process.stdout.write(help)
    process.exit(0)
  }

  if (!process.stdin.isTTY) {
    compiler.bundles.unshift(await getStdIn())
  } else if (argv.input) {
    compiler.bundles.push(await readFileAsync(normalize(argv.input), 'utf-8'))
  }

  if (!compiler.bundles.length) {
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
  cli,
  argv,
  options
}
