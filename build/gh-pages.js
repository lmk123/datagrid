const config = require('./rollup-config')(true, false, true)

require('rollup')
  .rollup(config.inputOptions)
  .then(bundle => {
    return bundle.write(config.outputOptions[0])
  })
  .then(() => {
    require('gh-pages').publish('dev', {
      src: ['index.html', 'index.js'],
      remote: 'github'
    })
  })
