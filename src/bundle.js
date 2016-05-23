export function bundle ({ bundles, files }, next) {
  const primaryBundle = bundles.shift()
  files.push({
    filename: 'lib/xbin_bundle.js',
    contents: primaryBundle
  }, {
    filename: 'lib/_third_party_main.js',
    contents: 'require("xbin_bundle")'
  },
  ...bundles.map((contents, i) => {
    return {
      filename: `lib/xbin_bundle_${ i }.js`,
      contents
    }
  }))

  return next()
}
