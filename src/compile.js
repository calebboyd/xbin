export async function compile (compiler, next) {
  await next()
  await compiler.configureAsync()
  await compiler.buildAsync()
}
