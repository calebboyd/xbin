module.exports = {
  entry: './index.js',
  target: 'node',
  output: {
    filename: 'native-test.js',
    path: './build'
  },
  module: {
    loaders: [
      { test: /\.node$/, loader: "xbin-loader" }
    ]
  }
}
