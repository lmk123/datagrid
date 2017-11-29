const path = require('path')
const pkg = require('../package.json')

module.exports = {
  input: path.resolve(__dirname, '../src/index.ts'),
  name: 'Datagrid',
  esOutputPath: path.resolve(__dirname, '../dist/datagrid.esm.js'),
  cjsOutputPath: path.resolve(__dirname, '../dist/datagrid.common.js'),
  umdOutputPath: path.resolve(__dirname, '../dist/datagrid.js'),
  umdMinOutputPath: path.resolve(__dirname, '../dist/datagrid.min.js'),
  banner: [
    '/*!',
    ' * datagrid.js v' + pkg.version,
    ' * https://github.com/lmk123/datagrid',
    ' * Released under the MIT License.',
    ' */'
  ].join('\n')
}
