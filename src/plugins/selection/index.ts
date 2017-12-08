// https://github.com/Microsoft/TypeScript/issues/5711
import * as t from 'tinyemitter'
import BaseGrid, * as g from '../../core/index'

import DataGrid, { DataGridConstructor, Column } from '../../core/index'
import addEvent from '../../utils/add-event'
import closest from '../../utils/closest'

const { indexOf } = Array.prototype

export default function<T extends DataGridConstructor>(Base: T) {
  return class extends Base {
    private selectionIndex: number

    constructor(...args: any[]) {
      super(...args)

      if (!this.parent) {
        addEvent(this.el, 'click', e => {
          const tr = closest.call(
            e.target,
            '.datagrid tr'
          ) as HTMLTableRowElement
          if (!tr) return

          const trs = (tr.parentElement as HTMLTableSectionElement).children
          const trIndex = indexOf.call(trs, tr)
          const oldSelectionIndex = this.selectionIndex
          if (oldSelectionIndex !== trIndex) {
            this.selectionIndex = trIndex

            const updateSelected = function(grid: BaseGrid) {
              const { children } = grid.ui.tbody
              const lastSelectedRow = children[oldSelectionIndex]
              if (lastSelectedRow) {
                lastSelectedRow.classList.remove('selected-row')
              }
              children[trIndex].classList.add('selected-row')
            }

            updateSelected(this)
            const { children } = this
            if (children) {
              children.forEach(grid => {
                updateSelected(grid)
              })
            }
          }
        })
      }
    }
  }
}
