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
      o: 'output',
      p: 'python',
      v: 'version',
      t: 'temp',
      f: 'flag',
      r: 'resource',
      c: 'configure',
      m: 'make',
      a: 'plugin',
      h: 'help',
      n: 'name',
      d: 'download'
    },
    default: {
      python: null,
      version: process.version.slice(1),
      temp: process.env.XBIN_TEMP || join(process.cwd(), '.xbin'),
      make: isWindows ? ['nosign', 'release'] : []
    }
  }),
  help = `
xbin --help              CLI OPTIONS

  -i --input      =/main/bundle/file.js   -- main js bundle
  -o --output     =/my/xbin/binary        -- path to output file
  -p --python     =/path/to/python2       -- python executable
  -v --version    =4.4.4                  -- node version
  -t --temp       =/path/for/build/files  -- xbin temp directory (3Gb+) ~ XBIN_TEMP
  -n --name       =xbin-output.js         -- file name for error reporting at run time
  -d --download   =win32-x64-X.X.X        -- use prebuilt binary (url or name)
  -f --flag       ="--expose-gc"          -- *v8 flags to include during compilation
  -r --resource                           -- *embed file bytes within binary (patches fs)
  -c --configure                          -- *arguments to forward to configure.py script
  -m --make                               -- *arguments to forward to make or vcbuild.bat
  -a --plugin                             -- *path or directory to load plugin(s) from

  --clean                                 -- force recompile after build caches

                                             * option can be used more than once
`,
  options = Object.assign({}, argv)

options.flags = options.flag
options.resources = options.resource
options.plugins = options.plugin

delete options.flag
delete options.resource
delete options.plugin

argv.help = argv.help ? help : false

ensureArray(options, 'configure')
ensureArray(options, 'make')
ensureArray(options, 'flags')
ensureArray(options, 'resources')
ensureArray(options, 'plugins')

export {
  argv,
  options
}
