# xbin

Package your node applications as standalone executable binaries.

`npm i -g xbin`

## Example

```bash
$ echo 'console.log("Hello World")' | xbin > myApp
$ chmod + x myApp
$ ./myApp
Hello World
$
```

## CLI

In addition to the `stdin` and `stdout` interfaces, `xbin` has the following command line options:

```
xbin --help              CLI OPTIONS

  -i --input      =/main/bundle/file.js   -- main js bundle
  -o --output     =/my/xbin/binary        -- path to output file
  -p --python     =/path/to/python        -- python executable
  -v --version    =4.4.4                  -- node version
  -t --temp       =/temp/build/files      -- xbin temp directory (3Gb+) ~ XBIN_TEMP
  -f --flags      ="--expose-gc"          -- v8 flags to include during compilation
  -c --configure                          -- arguments to forward to configure.py script
  -m --make                               -- arguments to forward to make or vcbuild.bat
  -r --resource                           -- embed file bytes within binary (patches fs)
```

### Prerequisites

- You must be able to [build Node](https://github.com/nodejs/node/blob/master/BUILDING.md)
- You need an application bundle for your node project.
  - browserify
  - webpack
  - jspm


### How does it work

Node supports a `_third_party_main.js`. This file is used to load your application bundle.
`xbin` is just a cli tool to manage a small portion of node's build configuration.

`xbin` does the following
 - facilitates passing commands to `configure` and `make` stages of building node
 - Disables node flags and facilitates passing custom command line arguments `node.cc`
 - modifies `node.gyp` to include additional "core modules" (your application bundle(s))
 - patches `fs.readFile()` and `fs.readFileSync()` methods
   - bundles files keyed by basename (`path.basename()`)

### Node Versions

Should work on versions >= 4.4.1
No plans exist to support anything but the latest LTS releases.

### Use Cases

- Services written on Node.js
	- winsw on Windows
	- systemv or systemd on Linux
- Ship and update runtimes at will

#### TODO
- bundle splitting
- native modules (can be done in userland with webpack)

### LICENSE
- [MIT](https://github.com/calebboyd/xbin/blob/master/LICENSE)
