import { dirname, normalize, join } from 'path'
import { promisify, Promise } from 'bluebird'
import { readFile, writeFile, createReadStream } from 'fs'
import { spawn } from 'child_process'
import spinner from 'char-spinner'
import { fileContainsAsync } from './file-contains'

const isWindows = process.platform === 'win32',
  isBsd = Boolean(~process.platform.indexOf('bsd')),
  make = isWindows && 'vcbuild.bat'
    || isBsd && 'gmake'
    || 'make',
  configure = isWindows ? 'configure' : './configure',
  readFileAsync = promisify(readFile),
  writeFileAsync = promisify(writeFile)

export class Compiler {
  constructor (options) {
    const compiler = Object.assign(this, options)
    compiler.src = join(compiler.temp, compiler.version)
    compiler.env = Object.assign({}, process.env)
    compiler.files = []
    compiler.readFileAsync = async (file) => {
      const cachedFile = compiler.files.find(x => normalize(x.filename) === normalize(file))
      if (cachedFile) {
        return Promise.resolve(cachedFile)
      }
      compiler.files.push({
        filename: file,
        contents: await readFileAsync(join(compiler.src, file), 'utf-8').catch(e => {
          if (e.code !== 'ENOENT') {
            throw e
          }
          return ''
        })
      })
      return compiler.readFileAsync(file)
    }
    compiler.writeFileAsync = (file, contents) => writeFileAsync(join(compiler.src, file), contents)
  }

  set python (pythonPath) {
    if (!pythonPath) {
      return
    }
    if (isWindows) {
      this.env.PATH = this.env.PATH + ';' + normalize(dirname(pythonPath))
    } else {
      this.env.PYTHON = pythonPath
    }
  }

  get deliverableLocation () {
    return isWindows
      ? join(this.src, 'Release', 'node.exe')
      : join(this.src, 'out', 'Release', 'node')
  }

  runBuildCommandAsync (command, args) {
    return new Promise((resolve, reject) => {
      spawn(command, args, {
        cwd: this.src,
        env: this.env,
        stdio: 'ignore'
      })
      .once('error', reject)
      .once('close', resolve)
    })
  }

  _configureAsync () {
    return this.runBuildCommandAsync(
      this.env.PYTHON || 'python',
      [configure, ...this.configure]
    )
  }

  async _isBuildCachedAsync () {
    const thirdPartyMain = await this.readFileAsync('lib/_third_party_main.js')

    return fileContainsAsync(this.deliverableLocation, thirdPartyMain.contents)
  }

  async buildAsync () {
    if (!this.clean && await this._isBuildCachedAsync()) {
      return
    }

    const spinning = spinner()
    await this._configureAsync()

    try {
      await this.runBuildCommandAsync(make, this.make)
    } catch (e) {
      throw e
    } finally {
      spinning && clearTimeout(spinning)
      spinning && spinner.clear()
    }
  }

  deliverable () {
    return createReadStream(this.deliverableLocation)
  }
}
