export async function flags ({ readFileAsync, flags }, next) { //eslint-disable-line no-shadow
  if (!flags.length) {
    return next()
  }

  const nodegyp = await readFileAsync('node.gyp')

  nodegyp.contents = nodegyp.contents.replace(
    "'node_v8_options%': ''",
    `'node_v8_options%': '${ flags.join(' ') }'`)

  return next()
}
