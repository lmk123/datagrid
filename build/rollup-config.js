const pkg = require('../package.json')
const name = 'Datagrid'
const banner = [
  '/*!',
  ' * datagrid.js v' + pkg.version,
  ' * https://github.com/lmk123/datagrid',
  ' * Released under the MIT License.',
  ' */'
].join('\n')

module.exports = function(isBuild) {
  const plugins = [
    require('rollup-plugin-postcss')(),
    require('rollup-plugin-html')({
      htmlMinifierOptions: isBuild
        ? {
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            conservativeCollapse: false,
            removeAttributeQuotes: true
          }
        : undefined
    }),
    require('rollup-plugin-node-resolve')(),
    require('rollup-plugin-typescript2')({
      useTsconfigDeclarationDir: isBuild,
      tsconfigOverride: isBuild
        ? {
            compilerOptions: {
              declaration: true,
              declarationDir: 'declaration'
            }
          }
        : {
            include: ['src/**/*', 'dev/**/*']
          }
    })
  ]
  if (isBuild) {
    plugins.push(require('rollup-plugin-buble')())
  } else {
    plugins.push(
      require('rollup-plugin-serve')({
        open: true,
        contentBase: 'dev'
      }),
      require('rollup-plugin-livereload')()
    )
  }
  return {
    inputOptions: {
      input: isBuild ? './src/index.ts' : './dev/index.ts',
      plugins
    },
    outputOptions: isBuild
      ? [
          {
            file: './dist/datagrid.esm.js',
            format: 'es',
            name,
            banner
          },
          {
            file: './dist/datagrid.common.js',
            format: 'cjs',
            name,
            banner
          },
          {
            file: './dist/datagrid.js',
            format: 'umd',
            name,
            banner
          }
        ]
      : [
          {
            file: './dev/index.js',
            format: 'iife',
            name
          }
        ]
  }
}
