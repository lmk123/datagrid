import DataGrid from '../../core/index'
import './style.css'

export interface FixedTablesElement {
  left?: DataGrid
  right?: DataGrid
}

type TablePlace = keyof FixedTablesElement

function createFixedGrid(parentDatagrid: DataGrid, place: TablePlace) {
  const { options } = parentDatagrid
  const d = new DataGrid({
    td: options.td,
    th: options.th
  })
  d.el.classList.add('fixed-grid', 'fixed-grid-' + place)
  parentDatagrid.fixedTables[place] = d
  parentDatagrid.el.appendChild(d.el)
  const { ui } = d
  const colgroup = (ui.colgroup = document.createElement('colgroup'))
  ui.table.insertBefore(colgroup, ui.thead)
  return d
}

const methods = {
  fixedTables: {},
  setFixed(this: DataGrid, count: number, place: TablePlace = 'left') {
    let fixedTable = this.fixedTables[place]
    if (!count) {
      if (fixedTable) {
        fixedTable.el.style.display = 'none'
      }
      return
    }
    if (fixedTable) {
      fixedTable.el.style.display = ''
    } else {
      fixedTable = createFixedGrid(this, place)
    }
    const { curData } = this
    fixedTable.fixed = count
    fixedTable.setData({
      columns:
        place === 'left'
          ? curData.columns.slice(0, count)
          : curData.columns.slice(-count),
      rows: curData.rows
    })
    this.syncFixedWidth(place)
  },
  syncFixedWidth(place: TablePlace) {
    const fixedTable = this.fixedTables[place]
    if (!fixedTable) return
    const { fixed } = fixedTable
    // 同步 th 的宽度
    let colHtml = ''
    Array.prototype.some.call(this.ui.thead.children, (th, index) => {
      if (index === fixed) return true
      colHtml += `<col width="${th.clientWidth}">`
    })
    fixedTable.ui.colgroup.innerHTML = colHtml
    // 同步 tr 的高度
    const trs = fixedTable.ui.tbody.children
    Array.prototype.forEach.call(this.ui.tbody.children, (tr, index) => {
      trs[index].style.height = tr.clientHeight + 'px'
    })
  }
}

export default function(datagrid: DataGrid) {
  // 这里的 newDatagrid 完全等价于 datagrid，
  // 但是在 TypeScript 中必须使用 Object.assign 的返回值才能得到正确的提示
  const newDatagrid = Object.assign(datagrid, methods)
}
