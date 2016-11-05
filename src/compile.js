import { join } from 'path'
import { readFile } from 'fs'
import { promisify } from 'bluebird'

const readFileAsync = promisify(readFile),
  breakingOptions = ['flags', 'make', 'configure']

function getOptionsComment (options) {
  const optionMarkers = breakingOptions.map(key => {
    return `${ key }: ${ JSON.stringify(options[key]) }`
  })

  return '/** xbin-options ' + optionMarkers.join(', ').replace(/\*\//g, '*\/') + ' **/'
}

export async function compile (compiler, next) {
  if (compiler.download) {
    return next()
  }

  const thirdPartyMain = await compiler.readFileAsync('lib/_third_party_main.js')
  let thirdPartyMainContent = await readFileAsync(join(__dirname, '_third_party_main.js'))

  if (compiler.name) {
    thirdPartyMainContent = thirdPartyMainContent.toString().replace('xbin-output.js', compiler.name)
  }

  thirdPartyMain.contents = getOptionsComment(compiler) + thirdPartyMainContent

  await next()

  await compiler.buildAsync()
}
