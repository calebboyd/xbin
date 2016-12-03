export async function noderc (compiler, next) {
  if (!compiler.rc) {
    return next()
  }

  const options = compiler.rc,
    file = await compiler.readFileAsync('src/res/node.rc')

  if (options.CompanyName) {
    file.contents = file.contents.replace('VALUE "CompanyName", "Node.js"', `VALUE "CompanyName", "${options.CompanyName}"`)
  }

  if (options.ProductName) {
    file.contents = file.contents.replace('VALUE "ProductName", "Node.js"', `VALUE "ProductName", "${options.ProductName}"`)
  }

  if (options.FileDescription) {
    file.contents = file.contents.replace('VALUE "FileDescription", "Node.js: Server-side JavaScript"', `VALUE "FileDescription", "${options.FileDescription}"`)
  }

  if (options.FileVersion) {
    file.contents = file.contents.replace('VALUE "FileVersion", NODE_EXE_VERSION', `VALUE "FileVersion", "${options.FileVersion}"`)
  }

  if (options.ProductVersion) {
    file.contents = file.contents.replace('VALUE "ProductVersion", NODE_EXE_VERSION', `VALUE "ProductVersion", "${options.ProductVersion}"`)
  }

  if (options.OriginalFilename) {
    file.contents = file.contents.replace('VALUE "OriginalFilename", "node.exe"', `VALUE "OriginalFilename", "${options.OriginalFilename}"`)
  }

  if (options.InternalName) {
    file.contents = file.contents.replace('VALUE "InternalName", "node"', `VALUE "InternalName", "${options.InternalName}"`)
  }

  if (options.LegalCopyright) {
    file.contents = file.contents.replace('VALUE "LegalCopyright", "Copyright Node.js contributors. MIT license."', `VALUE "LegalCopyright", "${options.LegalCopyright}"`)
  }

  if (options.LegalTrademarks) {
    file.contents = file.contents.replace(`VALUE "LegalCopyright", "${options.LegalCopyright}"`, `VALUE "LegalCopyright", "${options.LegalCopyright}"\r\n            VALUE "LegalTrademarks", "${options.LegalTrademarks}"`)
  }

  return next()
}
