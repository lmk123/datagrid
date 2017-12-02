const config = require('./config')

module.exports = {
  input: config.input,
  plugins: [
    require('rollup-plugin-postcss')(),
    require('rollup-plugin-html')(),
    require('rollup-plugin-node-resolve')(),
    require('rollup-plugin-typescript2')(),
    require('rollup-plugin-serve')({
      open: true,
      contentBase: 'dev'
    }),
    require('rollup-plugin-livereload')()
  ],
  output: {
    file: './dev/datagrid.js',
    format: 'iife',
    name: config.name
  }
}
