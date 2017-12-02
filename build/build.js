const config = require('./rollup-config')(true)
const rollup = require('rollup')
const fs =require('fs-extra')

fs.emptyDirSync('./dist')
fs.emptyDirSync('./declaration')

rollup.rollup(config.inputOptions).then(bundle => {
  config.outputOptions.forEach(opt => {
    bundle.write(opt)
  })
})
