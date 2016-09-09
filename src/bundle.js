export async function bundle (compiler, next) {
  compiler.files.push({
    filename: 'lib/xbin_bundle.js',
    contents: compiler.input
  }, {
    filename: 'lib/_third_party_main.js',
    contents: 'require("xbin_bundle")'
  })

  return next()
}
