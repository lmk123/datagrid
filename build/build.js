const getConfig = require('./rollup-config')
const rollup = require('rollup')
const fs = require('fs-extra')

fs.emptyDirSync('./dist')
fs.emptyDirSync('./declaration')

function runBuild(isBuild, isModule) {
  const config = getConfig(isBuild, isModule)
  rollup.rollup(config.inputOptions).then(bundle => {
    config.outputOptions.forEach(opt => {
      bundle.write(opt)
    })
  })
}

runBuild(true)
runBuild(true, true)
