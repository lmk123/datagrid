const config = require('./rollup-config')()

require('rollup').watch(
  Object.assign(config.inputOptions, { output: config.outputOptions[0] })
).on('event', event => {
  console.log(event)
})
