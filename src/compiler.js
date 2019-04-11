import { dirname, normalize, join } from 'path'
import { promisify, Promise } from 'bluebird'
import { readFile, writeFile, createReadStream } from 'fs'
import { spawn } from 'child_process'
import { get as getHttps } from 'https'
import { get as getHttp } from 'http'
import spinner from 'char-spinner'
import { fileContainsAsync } from './file-contains'
import { EOL } from 'os'

const
  isWindows = process.platform === 'win32',
  isBsd = Boolean(~process.platform.indexOf('bsd')),
  make = isWindows && 'vcbuild.bat'
    || isBsd && 'gmake'
    || 'make',
  configure = isWindows ? 'configure' : './configure',
  readFileAsync = promisify(readFile),
  writeFileAsync = promisify(writeFile),
  NOT_FOUND = 404

function getHttpResponseAsync (url) {
  if (!url.includes('http')) {
    url = `https://calebboyd.github.io/xbin/${url}`
  }
  const getter = url.includes('https') ? getHttps : getHttp
  return new Promise((resolve, reject) => {
    const request = getter(url, response => {
      if (response.statusCode === NOT_FOUND) {
        reject(`Binary "${url}" Not Found!${EOL}` +
          'Please refer to platform prefixed names located here: ' +
          'https://github.com/calebboyd/xbin/tree/gh-pages')
      }
      resolve(response)
      request.removeAllListeners()
    })
      .once('error', (error) => {
        reject(error)
        request.removeAllListeners()
      })
  })
}

function isString (x) {
  return typeof x === 'string' || x instanceof String
}

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

  getDeliverableAsync () {
    if (this.download) {
      return getHttpResponseAsync(isString(this.download)
        ? this.download
        : [process.platform, process.arch, process.version.slice(1)].join('-')
      )
    }
    return Promise.resolve(createReadStream(this.deliverableLocation))
  }
}
