export async function nodeGyp ({ files, readFileAsync, download }, next) {
  if (download) {
    return next()
  }
  const nodegyp = await readFileAsync('node.gyp'),
    nodeGypMarker = "'lib/fs.js',"

  nodegyp.contents = nodegyp.contents
    .replace(nodeGypMarker, `
      ${ nodeGypMarker }
      ${ files
    .filter(x => x.filename.startsWith('lib'))
    .map(x => `'${ x.filename }'`)
    .toString() },
    `.trim())

  return next()
}
