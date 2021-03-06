const pkg = require('../package.json')

const name = 'datagrid'
const banner = [
  '/*!',
  ' * datagrid v' + pkg.version,
  ' * https://github.com/lmk123/datagrid',
  ' * Released under the MIT License.',
  ' */'
].join('\n')

module.exports = function(isBuild, isModule, isGhPages) {
  return {
    inputOptions: getInputOptions(isBuild, isModule, isGhPages),
    outputOptions: getOutputOptions(isBuild, isModule, isGhPages)
  }
}

function getInputOptions(isBuild, isModule, isGhPages) {
  const plugins = [
    require('rollup-plugin-postcss')({
      plugins: isBuild
        ? [
            require('autoprefixer')(),
            require('cssnano')({
              autoprefixer: false
            })
          ]
        : undefined
    }),
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
    })
  ]

  if (!isModule) {
    plugins.push(require('rollup-plugin-node-resolve')())
  }

  plugins.push(
    require('rollup-plugin-typescript2')({
      useTsconfigDeclarationDir: isBuild,
      tsconfigOverride:
        isBuild && !isGhPages
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
  )

  if (isBuild) {
    plugins.push(require('rollup-plugin-buble')())
  } else if (!isGhPages) {
    plugins.push(
      require('rollup-plugin-serve')({
        open: true,
        contentBase: 'dev'
      }),
      require('rollup-plugin-livereload')()
    )
  }

  return {
    input: isBuild && !isGhPages ? './src/index.ts' : './dev/index.ts',
    external: isModule ? Object.keys(pkg.dependencies) : undefined,
    plugins
  }
}

function getOutputOptions(isBuild, isModule, isGhPages) {
  if (!isBuild || isGhPages) {
    return [
      {
        file: './dev/index.js',
        format: 'iife',
        name
      }
    ]
  }
  if (isModule) {
    return [
      {
        file: './dist/datagrid.esm.js',
        format: 'es',
        banner
      },
      {
        file: './dist/datagrid.common.js',
        format: 'cjs',
        banner
      }
    ]
  }
  return [
    {
      file: './dist/datagrid.js',
      format: 'umd',
      name,
      banner
    }
  ]
}
