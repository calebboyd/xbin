export async function nodeGyp ({ src, files, readFileAsync }, next) {
  const nodegyp = await readFileAsync('node.gyp'),
    nodeGypMarker = "'src/node.js',"

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
