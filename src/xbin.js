import { compose } from 'app-builder'
import { Compiler } from './compiler'
import { options, cli } from './cli'
import { download } from './download'
import { compile } from './compile'
import { artifacts } from './artifacts'
import { bundle } from './bundle'
import { nodeGyp } from './gyp'
import { flags } from './flags'

const xbin = compose(
    cli,
    download,
    compile,
    artifacts,
    bundle,
    flags,
    nodeGyp
  ),
  build = opts => xbin(new Compiler(opts))

export {
  build,
  options
}
