// https://github.com/Microsoft/TypeScript/issues/9944
/* tslint:disable:no-unused-variable */
import * as t from 'tinyemitter'
import * as g from '../../core/index'
import * as x from '../fixed-table'
/* tslint:enable:no-unused-variable */

import BaseGrid, { DataGridConstructor, TableData } from '../../core'
import addEvent from '../../utils/add-event'
import closest from '../../utils/closest'

const { indexOf } = Array.prototype

export default function<T extends DataGridConstructor>(Base: T) {
  return class extends Base {
    private selectedRow: object | null = null
    private ch?: Function

    constructor(...args: any[]) {
      super(...args)

      if (!this.parent) {
        const { el } = this
        this.ch = addEvent(el, 'click', e => {
          const tr = closest(
            e.target as Element,
            '.datagrid tbody tr',
            el
          ) as HTMLTableRowElement
          if (!tr) return

          const trs = tr.parentElement!.children
          const trIndex = indexOf.call(trs, tr) as number
          const selectedRow = this.curData.rows[trIndex]
          if (this.setSelected(selectedRow)) {
            this.emit('select', selectedRow)
          }
        })
      }
    }

    /**
     * 设置选中行。
     * @param row 当前被选中的行对象
     * @returns 如果选中的行没有变化，则返回 false，否则返回 true。
     */
    setSelected(row: object | null = null) {
      const oldSelectedRow = this.selectedRow
      if (oldSelectedRow === row) return false
      this.selectedRow = row
      const newRowIndex = row ? this.curData.rows.indexOf(row) : -1

      const updateSelected = function(grid: BaseGrid) {
        const { tbody } = grid.ui
        const lastSelectedRow = tbody.getElementsByClassName('selected-row')
        if (lastSelectedRow.length) {
          lastSelectedRow[0].classList.remove('selected-row')
        }
        const newSelectedRow = tbody.children[newRowIndex]
        if (newSelectedRow) {
          newSelectedRow.classList.add('selected-row')
        }
      }

      updateSelected(this)
      const { children } = this
      if (children) {
        children.forEach(updateSelected)
      }
      return true
    }

    setData(data: TableData) {
      // 刷新表格前重置选中状态
      if (this.selectedRow) {
        this.selectedRow = null
        this.emit('select', null)
      }
      super.setData(data)
    }

    destroy(...args: any[]) {
      const { ch } = this
      if (ch) ch()
      super.destroy(...args)
    }
  }
}
