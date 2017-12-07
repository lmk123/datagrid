// https://github.com/Microsoft/TypeScript/issues/5711
import * as t from 'tinyemitter'
import * as g from './core/index'
import * as h from './plugins/fixed-header'
import * as ta from './plugins/fixed-table'

import BaseGrid from './core/index'

import fixedHeader from './plugins/fixed-header'
import fixedTable from './plugins/fixed-table'

// 默认返回一个功能丰富的表格类。
// 这里的繁琐写法是为了让 TypeScript 能正确解析类型。
// 注意：由于同时使用了 `export` 和 `export default`，
// CommonJS 和浏览器端要使用 `default` 属性读取到这个输出。
// CommonJS: `const DataGrid = require('datagrid').default`
// 浏览器：`const Grid = DataGrid.default`
export default fixedHeader(fixedTable(BaseGrid))

// 输出基本类和内置插件，让用户可以自行构造。
export { BaseGrid, fixedHeader, fixedTable }
