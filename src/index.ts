// https://github.com/Microsoft/TypeScript/issues/9944
/* tslint:disable:no-unused-variable */
import * as t from 'tinyemitter'
import * as g from './core'
import * as h from './plugins/fixed-header'
import * as ta from './plugins/fixed-table'
/* tslint:enable:no-unused-variable */

/* tslint:disable:no-duplicate-imports */
import BaseGrid from './core'

import fixedHeader from './plugins/fixed-header'
import fixedTable from './plugins/fixed-table'
import sort from './plugins/sort'
import selection from './plugins/selection'
/* tslint:enable:no-duplicate-imports */

// 默认返回一个功能丰富的表格类。
// 这里的繁琐写法是为了让 TypeScript 能正确解析类型。
//
// 注意：由于同时使用了 `export` 和 `export default`，
// CommonJS 和浏览器端要使用 `default` 属性读取到这个输出。
//
// CommonJS: `const DataGrid = require('datagrid').default`
// 浏览器：`const Grid = DataGrid.default`
export default selection(sort(fixedHeader(fixedTable(BaseGrid))))

// 输出基本类和内置插件，让用户可以自行构造。
export { BaseGrid, fixedHeader, fixedTable, sort, selection }
