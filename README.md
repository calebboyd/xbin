# xbin

Package your node applications as standalone executable binaries, instantly.

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
  -n --name       =xbin-output.js         -- file name for error reporting at run time
     --clean                              -- force recompile after build caches
  -d --download   =win32-x64-X.X.X        -- use prebuilt binary (url or name)
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
  name: 'xbin-output.js'                  //Default: 'xbin-output.js'
  clean: true                             //Default: false
  flags: [...],                           //Default: []
  resources: [...],                       //Default: []
  configure: [...],                       //Default: []
  make: [...],                            //Default: ['nosign', 'release'] on Windows; [] on *nix
  plugins: [...]                          //Default: []
}).then(() => console.log('done!'))
```

## Replace app's icon and further details (node.rc)

Each attribute in the "rc" json will override the original node details.

```javascript
build({
  input: './path/to/input/bundle.js',     //Required
  output: './output.exe',                 //Default: './xbin_TIMESTAMP.suffix'
  python: '/python2/path',                //Default: '' //assumed present in environment
  version: '6.9.1',                       //Default: Host node version
  temp: '/tmp/build/directory',           //Default: './.xbin'
  name: 'xbin-output.js'                  //Default: 'xbin-output.js'
  clean: true                             //Default: false
  flags: [...],                           //Default: []
  resources: [...],                       //Default: []
  configure: [...],                       //Default: []
  make: [...],                            //Default: ['nosign', 'release'] on Windows; [] on *nix
  plugins: [...],                         //Default: []
  ico: './assets/blah-blah.ico',
  rc: {
      "CompanyName": "Blah Blah Inc.",
      "ProductName": "Blah Blah",
      "FileDescription": "Short description here",
      "FileVersion": "1.0.1",
      "ProductVersion": "3.0.3",
      "OriginalFilename": "blah-blah.exe",
      "InternalName": "blah-blah",
      "LegalCopyright": "(C) Blah Blah Inc.",
      "LegalTrademarks": "(TM) Blah Blah Inc."
  }
}).then(() => console.log('done!'))
```


## Plugins (not supported yet)

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

## Fast Rebuilds

Once you have successfully built with xbin, the compiled version of Node will be cached and reused for future builds.
You can change your `input` and `resource`s without the need to recompile Node.  Changes to `version`, `name`, `flag`s,
`configure`, and `make` will automatically cause a recompile.  If you wish to force a recompile, you can set the `--clean` option.

```bash
$ echo 'console.log("Hello World")' | xbin > myApp # several minutes
$ echo 'console.log("Hello Different World")' | xbin > myApp # seconds
$ echo 'console.log("Hello Clean World")' | xbin --clean > myApp # several minutes
```
### How can I use Native Modules?

With the custom `xbin-loader` (see [xbin-loader](https://github.com/calebboyd/xbin/blob/master/xbin-loader/README.md)). You can bundle `.node` files (native extensions).
These files are loaded into memory and written to file at runtime. The temp file is required because
most environments do not have mechanisms for loading dynamic libraries from RAM. For troubleshooting, see [issue #4](https://github.com/calebboyd/xbin/issues/4)

### Node Versions

LTS Versions 4.X and 6.X are supported

### Use Cases

- Services written on Node.js
	- winsw on Windows (save it as a resource!)
	- systemv or systemd on Linux
- Ship and update runtimes at will!

## How it works

xbin is built around a series of [middleware](https://github.com/calebboyd/app-builder). Each middleware function is described below. The first point will describe the upstream function and the second, its downstream function.

 - **cli**
  - Collects and normalizes input
  - Writes and noramlizes output
 - **download**
  - Downloads the Node Source if not present in the configured or default storage location
  - Nothing
 - **compile**
  - Adds an additional source file to node source `_third_party_main.js`. This file contains code that is responsible for loading your application bundle
  - Executes the node build process with parameters provided to `xbin`
 - **artifacts**
  - Creates a temporary `xbin` directory in the node source folder. If the temp directory already exists, it repopulates the node source with the versions stored in the temporary directory
  - Stores original node source files before they're overwritten, and then writes their patched versions and adds new files.
 - **nodegyp**
  - Nothing
  - Appends any additional source files setup during the other middleware or plugin phases and records them in the node.gyp manifest
 - **flags**
  - Nothing
  - If any v8 flags `--flag` are passed to xbin. The flag is compiled with the node runtime. These options also exist in the node.gyp file.
 - **argv**
  - Updates `src/node.cc` of the Node Source, to bypass strict argv options. Allowing you to pass arbitrary command line options to your custom runtime.
 - **resource**
  - If resource flags are supplied, additional code is added that builds a dictionary of getters keyed by resource basename. The getters return a Buffer of the resource's bytes. They are retrieved at runtime by reading from `fs.readFile` and `fs.readFileSync`
    - eg. `cat input.js | xbin --resource ./some/file > out.run` will cause any `readFile` or `readFileSync` of `./any/path/file` where the basename is `file` to retrieve the embedded resource.
 - **ico**
  - Overwrites node's included icon file

Plugins act as additional middleware appended after the ones described here

### Compiler

The Compiler object that is passed to each middleware function has _all_ of the xbin configuration properties (options) appended to it. Additionally it has these relevant methods

 - `readFileAsync('node/src/file'): Promise<{ filename: string, contents: Buffer }>` - The file path should _not_ be normalized, or be prefaced with a `/`.  The filename will be joined and normalized with the temporary source locatoin. Files that are read into the compiler cache are written out during the `articacts` downstream function
 - `writeFileAsync('node/src/file'): Promise<void>` - This method immediately writes a file to the node source directory currently being operated on.


### LICENSE
- [MIT](https://github.com/calebboyd/xbin/blob/master/LICENSE)
