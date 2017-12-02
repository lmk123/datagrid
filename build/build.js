const path = require('path')
const fs = require('fs-extra')
const config = require('./config')

// 清空输出目录
fs.emptyDirSync(path.resolve(__dirname, '../dist'))

// 编译 js
const rollup = require('rollup')
const uglifyJS = require('uglify-js')
const html = require('rollup-plugin-html')
const postcss = require('rollup-plugin-postcss')
const cssNext = require('postcss-cssnext')
const typescript = require('rollup-plugin-typescript2')
const resolve = require('rollup-plugin-node-resolve')
const buble = require('rollup-plugin-buble')

rollup
  .rollup({
    input: config.input,
    plugins: [
      postcss({
        plugins: [cssNext()]
      }),
      html({
        htmlMinifierOptions: {
          removeComments: true,
          collapseWhitespace: true,
          collapseBooleanAttributes: true,
          conservativeCollapse: false,
          removeAttributeQuotes: true
        }
      }),
      resolve(),
      typescript({
        useTsconfigDeclarationDir: true
      }),
      buble()
    ]
  })
  .then(bundle => {
    // 输出 es 格式
    bundle.write({
      file: config.esOutputPath,
      format: 'es',
      banner: config.banner
    })

    // 输出 cjs 格式
    bundle.write({
      file: config.cjsOutputPath,
      format: 'cjs',
      banner: config.banner
    })

    // 输出 umd 格式
    bundle
      .generate({
        format: 'umd',
        name: config.name,
        banner: config.banner
      })
      .then(({ code }) => {
        fs.writeFile(config.umdOutputPath, code)
        fs.writeFile(
          config.umdMinOutputPath,
          uglifyJS.minify(code, { output: { comments: /^!/ } }).code
        )
      })
  })
