# xbin

Package your node applications as standalone executable binaries.

`npm i -g xbin`

## Example

```bash
$ echo 'console.log("Hello World")' | xbin > myApp
$ chmod +x myApp
$ ./myApp
Hello World
$
```

### Prerequisites

- You must be able to [build Node](https://github.com/nodejs/node/blob/master/BUILDING.md)
- You need an application bundle for your node project.
  - webpack (target: 'node')
  - browserify
  - jspm


## CLI

In addition to the `stdin` and `stdout` interfaces, `xbin` has the following command line options:
The CLI may be useful for maintaining your build configuration in a `Dockerfile`

```
xbin --help              CLI OPTIONS

  -i --input      =/main/bundle/file.js   -- main js bundle
  -o --output     =/my/xbin/binary        -- path to output file
  -p --python     =/path/to/python2       -- python executable
  -v --version    =4.4.4                  -- node version
  -t --temp       =/path/for/build/files  -- xbin temp directory (3Gb+) ~ XBIN_TEMP
  -f --flag       ="--expose-gc"          -- *v8 flags to include during compilation
  -r --resource                           -- *embed file bytes within binary (patches fs)
  -c --configure                          -- *arguments to forward to configure.py script
  -m --make                               -- *arguments to forward to make or vcbuild.bat
  -a --plugin                             -- *path or directory to load plugin(s) from

                                             * option can be used more than once
```

## API

```javascript
import { build } from 'xbin'

//Programatic API is the same as CLI, except for those values accepting arrays
build({
  input: './path/to/input/bundle.js',     //Required
  output: './output.exe',                 //Default: './xbin_TIMESTAMP.suffix'
  python: '/python2/path',                //Default: '' //assumed present in environment
  version: '6.9.1',                       //Default: Host node version
  temp: '/tmp/build/directory',           //Default: './.xbin'
  flags: [...],                           //Default: []
  resources: [...],                       //Default: []
  configure: [...],                       //Default: []
  make: [...],                            //Default: ['nosign', 'release'] on Windows; [] on *nix
  plugins: [...]                          //Default: []
}).then(() => console.log('done!'))
```

## Plugins

```javascript
export function xbinSuperPlugin (compiler, next) {
  //Command line arguments will be available by key name on the compiler instance
  // patch an existing source file or build on previous patches/additions
  return compiler.readFileAsync('src/file/of/interest').then(file => {
    file.contents = myTransform(file.contents)
    return next()
  })
  // OR/AND
  // add new files or overwrite existing files
  compiler.files.push({
    filename: '/src/my/new/file'
    contents: myFileContents
  })
  return next()
}
```

### How does it work

Node supports a `_third_party_main.js`. This file is used to load your application bundle.
`xbin` is just a cli tool to manage a small portion of node's build configuration.

`xbin` does the following
 - facilitates passing commands to `configure` and `make` stages of building node
 - compiles node flags `--flags` which facilitates passing custom command line arguments to your application
 - modifies `node.gyp` to include additional "core modules" (your application bundle(s))
 - bundles resources and patches `fs.readFile()` and `fs.readFileSync()` methods
 - facilitates arbitrary source code patches via a plugin interface (not yet implemented)

### How can I use Native Modules?

With a custom `node-loader` (see [node-loader](example/node-loader,js)). You can bundle `.node` files (native extensions).
These files are loaded into memory and written to file at runtime. The temp file is required because
most environments do not have mechanisms for loading dynamic libraries from RAM.

### Node Versions

LTS Versions 4.X and 6.X are supported

### Use Cases

- Services written on Node.js
	- winsw on Windows
	- systemv or systemd on Linux
- Ship and update runtimes at will!

### LICENSE
- [MIT](https://github.com/calebboyd/xbin/blob/master/LICENSE)
