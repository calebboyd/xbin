import { options } from './options'
import { basename, normalize } from 'path'
import { map, promisify } from 'bluebird'
import { readFile } from 'fs'

const readFileAsync = promisify(readFile),
  fsPatch = `
    var fs = require('fs');
    var path = require('path');
    var originalReadFile = fs.readFile;
    fs.readFile = function (filename, _, callback) {
      var basename = path.basename(filename);
      if (basename in resources) {
        return process.nextTick(() => callback(null, resources[basename]));
      }
      return originalReadFile.apply(fs, arguments);
    };
    var originalReadFileSync = fs.readFileSync;
    fs.readFileSync = function (filename) {
      var basename = path.basename(filename);
      if (basename in resources) {
        return resources[basename];
      }
      return originalReadFileSync.apply(fs, arguments);
    };
  `

export function resource (compiler, next) {
  if (!options.resources.length) {
    return next()
  }

  return map(options.resources, (filename) => {
    return readFileAsync(normalize(filename)).then(contents => {
      return { filename, contents }
    })
  })
    .reduce((src, { filename, contents }) => {
      return src + `
        Object.defineProperty(resources, '${basename(filename)}', {
          get: function () {
            return new Buffer([${Array.from(contents)}]);
          }
        });
      `
    }, 'var resources = {};')
    .then(src => {
      const thirdPartyMain = compiler.files
        .find(x => x.filename === 'lib/_third_party_main.js')
      thirdPartyMain.contents = src + fsPatch + thirdPartyMain.contents
    }).then(next)
}
