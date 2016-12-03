import { compose } from 'app-builder'
import { Compiler } from './compiler'
import { options } from './options'
import { cli } from './cli'
import { download } from './download'
import { compile } from './compile'
import { artifacts } from './artifacts'
import { nodeGyp } from './gyp'
import { resource } from './resource'
import { flags } from './flags'
import { argv } from './argv'
import { ico } from './ico'
import { noderc } from './noderc'

function build (compilerOptions) {
  const xbin = compose(
    cli,
    download,
    compile,
    artifacts,
    resource,
    ico,
    noderc,
    flags,
    nodeGyp,
    argv
  )
  return xbin(new Compiler(compilerOptions))
}

export {
  build,
  options
}
