const livereload = require('rollup-plugin-livereload')
const serve = require('rollup-plugin-serve')
const typescript = require('rollup-plugin-typescript2')
const config = require('./config')

module.exports = {
  input: config.input,
  plugins: [
    typescript(),
    serve({
      open: true,
      contentBase: ''
    }),
    livereload()
  ],
  output: {
    file: config.umdOutputPath,
    format: 'iife',
    name: config.name
  }
}
