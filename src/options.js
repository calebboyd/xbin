import parseArgv from 'minimist'
import { join } from 'path'

const isWindows = process.platform === 'win32',
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
      r: 'resource',
      flag: 'flags',
      h: 'help'
    },
    default: {
      python: null,
      version: '4.4.4',
      temp: process.env.XBIN_TEMP || join(process.cwd(), '.xbin'),
      make: isWindows ? ['nosign', 'release'] : []
    }
  }),
  help = `
xbin --help              CLI OPTIONS

  -i --input      =/main/bundle/file.js   -- main js bundle
  -o --output     =/my/xbin/binary        -- path to output file
  -p --python     =/path/to/python        -- python executable
  -v --version    =4.4.4                  -- node version
  -t --temp       =/path/for/build/files  -- xbin temp directory (3Gb+) ~ XBIN_TEMP
  -f --flags      ="--expose-gc"          -- v8 flags to include during compilation
  -c --configure                          -- arguments to forward to configure.py script
  -m --make                               -- arguments to forward to make or vcbuild.bat
  -r --resource                           -- embed file bytes within binary (patches fs)

  `,
  options = {
    configure: argv.configure,
    make: argv.make,
    resources: argv.resource,
    flags: argv.flags,
    input: argv.input,
    output: argv.output,
    version: argv.version,
    python: argv.python,
    tempDir: argv.temp
  }

argv.help = argv.help ? help : false

ensureArray(options, 'configure')
ensureArray(options, 'make')
ensureArray(options, 'flags')
ensureArray(options, 'resources')

export {
  argv,
  options
}
