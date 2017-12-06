// https://github.com/Microsoft/TypeScript/issues/5711
import * as t from 'tinyemitter'
import * as g from '../../core/index'

import DataGrid, { DataGridConstructor } from '../../core/index'
import './style.css'

const { some, forEach } = Array.prototype

export interface FixedGrid extends DataGrid {
  fixed: number
}

export interface FixedGrids {
  left?: FixedGrid
  right?: FixedGrid
}

export type GridPlace = keyof FixedGrids

export default function<T extends DataGridConstructor>(Base: T) {
  return class FixedHeader extends Base {
    private readonly fixedTables: FixedGrids = {}

    setFixed(count: number, place: GridPlace = 'left') {
      let fixedTable = this.fixedTables[place]
      if (!count) {
        if (fixedTable) {
          fixedTable.el.style.display = 'none'
        }
        return
      }
      if (!fixedTable) {
        fixedTable = this.createFixedGrid(place)
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
      fixedTable.el.style.display = ''
      this.syncFixedWidth(place)
    }

    syncFixedWidth(place: GridPlace) {
      const fixedTable = this.fixedTables[place]
      if (!fixedTable) return
      const { fixed } = fixedTable
      // 同步 th 的宽度
      let colHtml = ''
      some.call(
        this.ui.thead.children,
        (th: HTMLTableHeaderCellElement, index: number) => {
          if (index === fixed) return true
          colHtml += `<col width="${th.clientWidth}">`
        }
      )
      fixedTable.ui.colgroup.innerHTML = colHtml
      // 同步 tr 的高度
      const trs = fixedTable.ui.tbody.children
      forEach.call(
        this.ui.tbody.children,
        (tr: HTMLTableRowElement, index: number) => {
          ;(trs[index] as HTMLTableRowElement).style.height =
            tr.clientHeight + 'px'
        }
      )
    }

    private createFixedGrid(place: GridPlace) {
      const { options } = this
      const d = new DataGrid({
        td: options.td,
        th: options.th
      }) as FixedGrid
      d.el.classList.add('fixed-grid', 'fixed-grid-' + place)
      this.fixedTables[place] = d
      this.el.appendChild(d.el)
      const { ui } = d
      const colgroup = (ui.colgroup = document.createElement('colgroup'))
      ui.table.insertBefore(colgroup, ui.thead)
      return d
    }
  }
}
