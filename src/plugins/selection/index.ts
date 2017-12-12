// https://github.com/Microsoft/TypeScript/issues/9944
/* tslint:disable:no-unused-variable */
import * as t from 'tinyemitter'
import * as g from '../../core/index'
import * as x from '../fixed-table'
/* tslint:enable:no-unused-variable */

import BaseGrid, { DataGridConstructor } from '../../core'
import addEvent from '../../utils/add-event'
import closest from '../../utils/closest'

const { indexOf } = Array.prototype

export default function<T extends DataGridConstructor>(Base: T) {
  return class extends Base {
    private selectionIndex: number
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
          const oldSelectionIndex = this.selectionIndex
          if (oldSelectionIndex !== trIndex) {
            this.selectionIndex = trIndex
            this.emit('select', trIndex)

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
              children.forEach(updateSelected)
            }
          }
        })
      }
    }

    destroy(...args: any[]) {
      const { ch } = this
      if (ch) ch()
      super.destroy(...args)
    }
  }
}
