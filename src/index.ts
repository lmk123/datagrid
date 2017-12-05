import DataGrid, { Constructor, DataGridOptions } from './core/index'

import fixedHeader from './plugins/fixed-header'
// import fixedTable from './plugins/fixed-table'

type Plugin = typeof fixedHeader

type P = typeof fixedHeader

export default function(options: DataGridOptions, ...plugins: P[]) {
  const Ctor = plugins.reduce((Grid, Ctor) => Ctor(Grid), DataGrid)
  return new Ctor(options)
}

export { fixedHeader /*, fixedTable*/ }
