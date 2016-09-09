export async function argv (compiler, next) {
  const nodecc = await compiler.readFileAsync('src/node.cc'),
    nodeccMarker = '  bool short_circuit = false;'

  nodecc.contents = nodecc.contents.replace(
    nodeccMarker,
    nodeccMarker.replace('false', 'true')
  )

  return next()
}
