const livereload = require('rollup-plugin-livereload')
const serve = require('rollup-plugin-serve')
const typescript = require('rollup-plugin-typescript2')
const html = require('rollup-plugin-html')
const config = require('./config')

module.exports = {
  input: config.input,
  plugins: [
    html(),
    typescript(),
    serve({
      open: true,
      contentBase: 'dev'
    }),
    livereload()
  ],
  output: {
    file: './dev/datagrid.js',
    format: 'iife',
    name: config.name
  }
}
