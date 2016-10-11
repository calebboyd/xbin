import { compose } from 'app-builder'
import { Compiler } from './compiler'
import { options } from './options'
import { cli } from './cli'
import { download } from './download'
import { compile } from './compile'
import { artifacts } from './artifacts'
import { bundle } from './bundle'
import { nodeGyp } from './gyp'
import { resource } from './resource'
import { flags } from './flags'
import { argv } from './argv'

function build (compilerOptions) {
  const xbin = compose(
    cli,
    download,
    compile,
    artifacts,
    //TODO cache binary/options,
    bundle,
    //patches
    resource,
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
