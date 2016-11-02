# xbin loader for webpack

## Installation

`npm install xbin-loader`

## Usage

``` javascript
var addon = require('./my/native/addon.node')
...
```

## About

This loader saves the native addon `.node` bytes in the webpack bundle, writes them to a file and then loads them into the runtime. 
The filename is an MD5 hash of the native addon, and is stored next to the runtime that executated the bundle.

[Documentation: Using loaders](http://webpack.github.io/docs/using-loaders.html)

## License

MIT