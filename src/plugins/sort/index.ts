// https://github.com/Microsoft/TypeScript/issues/5711
import * as t from 'tinyemitter'
import * as g from '../../core/index'

import DataGrid, { DataGridConstructor, Column } from '../../core/index'
import addEvent from '../../utils/add-event'
import closest from '../../utils/closest'

const DESC = -1, // 降序
  ASC = 1, // 升序
  NONE = 0 // 不排序

const orderLength = 3

var CLASS_ASC = 'order-by-asc'
var CLASS_DESC = 'order-by-desc'

const { indexOf } = Array.prototype

export default function<T extends DataGridConstructor>(Base: T) {
  return class extends Base {
    private sortColumnIndex: number
    private sortOrderIndex = 0

    constructor(...args: any[]) {
      super(...args)

      this.on(
        'after th render',
        (th: HTMLTableHeaderCellElement, column: Column, index: number) => {
          if (index === this.sortColumnIndex && this.sortOrderIndex) {
            th.classList.add('sort-by-' + this.sortOrderIndex)
          }
          // XXX: 用 appendChild()
          th.innerHTML += '<span><span>上</span><span>下</span></span>'
        }
      )
      if (!this.parent) {
        addEvent(this.el, 'click', e => {
          const th = closest.call(
            e.target,
            '.datagrid th'
          ) as HTMLTableHeaderCellElement
          if (!th) return
          const ths = (th.parentElement as HTMLTableSectionElement).children
          const thIndex = indexOf.call(ths, th)

          let newOrderIndex
          const oldSortColumnIndex = this.sortColumnIndex
          // TODO: 先在原本的表格上排序，然后点击了左侧或右侧固定表格的排序时会报错
          if (oldSortColumnIndex !== thIndex) {
            const oldSortTh = ths[oldSortColumnIndex]
            if (oldSortTh) {
              oldSortTh.classList.remove('sort-by-1', 'sort-by-2')
            }
            this.sortColumnIndex = thIndex
            newOrderIndex = 1
          } else {
            newOrderIndex = this.sortOrderIndex + 1
            if (newOrderIndex >= orderLength) {
              newOrderIndex -= orderLength
            }
          }
          this.sortOrderIndex = newOrderIndex
          th.classList.remove('sort-by-1', 'sort-by-2')
          if (newOrderIndex) {
            th.classList.add('sort-by-' + newOrderIndex)
          }
          this.emit('sort', thIndex, newOrderIndex)
        })
      }
    }
  }
}
