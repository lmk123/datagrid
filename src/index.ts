// https://github.com/Microsoft/TypeScript/issues/5711
import * as t from 'tinyemitter'
import * as g from './core/index'
import * as h from './plugins/fixed-header'
import * as ta from './plugins/fixed-table'

import BaseGrid from './core/index'

import fixedHeader from './plugins/fixed-header'
import fixedTable from './plugins/fixed-table'

export default fixedHeader(fixedTable(BaseGrid))

export { BaseGrid, fixedHeader, fixedTable }
