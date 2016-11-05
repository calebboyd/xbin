export async function argv (compiler, next) {
  if (compiler.download) {
    return next()
  }

  const nodecc = await compiler.readFileAsync('src/node.cc'),
    nodeccMarker = "argv[index][0] == '-'"

  nodecc.contents = nodecc.contents.replace(
    nodeccMarker,
    nodeccMarker.replace('-', ']')
  )

  return next()
}
