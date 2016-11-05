export async function flags ({ download, readFileAsync, flags = [] }, next) { //eslint-disable-line no-shadow
  if (!flags.length || download) {
    return next()
  }

  const nodegyp = await readFileAsync('node.gyp')

  nodegyp.contents = nodegyp.contents.replace(
    "'node_v8_options%': ''",
    `'node_v8_options%': '${ flags.join(' ') }'`)

  return next()
}
