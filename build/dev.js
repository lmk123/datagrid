const fs = require('fs-extra')
const rollup = require('rollup')
const config = require('./rollup-config')()

rollup.watch(
  Object.assign(config.inputOptions, { output: config.outputOptions[0] })
)
