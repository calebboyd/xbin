var path = require('path');

module.exports = {
  entry: './index.js',
  target: 'node',
  output: {
    //path: path.join(__dirname, 'build'),
    //filename: 'backend.js'
  },
  resolveLoader: { root: path.join(__dirname) },
  module: {
    loaders: [
      {
        test: /\.node$/,
        loader: "node-loader.js"
      }
    ]


  }
}
