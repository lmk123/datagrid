// https://github.com/Microsoft/TypeScript/issues/9944
/* tslint:disable:no-unused-variable */
import * as t from 'tinyemitter'
import * as g from '../../core'
import * as x from '../fixed-table'
/* tslint:enable:no-unused-variable */

import './style.css'
// tslint:disable-next-line:no-duplicate-imports
import BaseGrid, { DataGridConstructor, Column } from '../../core'
import addEvent from '../../utils/add-event'
import assign from '../../utils/assign'
import closest from '../../utils/closest'

const orderLength = 3

const { indexOf } = Array.prototype

export type SortBlockFn = () => Node
export type SortBlock = string | SortBlockFn

function defaultSortBlock() {
  const fd = document.createDocumentFragment()
  ;[
    {
      className: 'asc',
      innerHTML: '&#8593;'
    },
    {
      className: 'desc',
      innerHTML: '&#8595;'
    }
  ].forEach(element => {
    const span = document.createElement('span')
    assign(span, element)
    fd.appendChild(span)
  })

  return fd
}

export default function<T extends DataGridConstructor>(Base: T) {
  return class extends Base {
    private sortColumn: Column | null
    private sortOrderIndex = 0
    private clickEventHandler?: Function

    constructor(...args: any[]) {
      super(...args)

      const sortBlock = this.options.sortBlock || defaultSortBlock
      const appendSortBlock =
        typeof sortBlock === 'string'
          ? (th: HTMLElement) => {
              th.innerHTML += sortBlock
            }
          : (th: HTMLElement) => {
              th.appendChild(sortBlock())
            }

      this.on(
        'after th render',
        (th: HTMLTableHeaderCellElement, column: Column, index: number) => {
          if (column === this.sortColumn && this.sortOrderIndex) {
            th.classList.add('sort-by-' + this.sortOrderIndex)
          }
          // TODO: 后期增加只针对某些 column 开启排序的功能
          th.classList.add('sortable')
          appendSortBlock(th)
        }
      )
      if (!this.parent) {
        const { el } = this
        this.clickEventHandler = addEvent(el, 'click', e => {
          const th = closest(
            e.target as Element,
            '.datagrid th',
            el
          ) as HTMLTableHeaderCellElement
          if (!th) return
          const ths = (th.parentElement as HTMLTableSectionElement).children
          const thIndex = indexOf.call(ths, th)

          // 开始计算被排序的列的索引
          let newSortColumnIndex: number

          // 如果被点击的是右侧的固定表格，则索引号的计算方式要稍微复杂一些
          const isRightFixed = closest(th, '.fixed-grid-right', el)
          if (isRightFixed) {
            newSortColumnIndex =
              this.curData.columns.length -
              (this.fixedTables!.right!.fixedColumns! - thIndex)
          } else {
            // 点击主表格本身或者左侧固定表格的索引号就是 th 元素的索引号
            newSortColumnIndex = thIndex
          }

          const sortColumn = this.curData.columns[newSortColumnIndex]
          let newOrderIndex: number
          if (this.sortColumn !== sortColumn) {
            newOrderIndex = 1
          } else {
            newOrderIndex = this.sortOrderIndex + 1
            if (newOrderIndex >= orderLength) {
              newOrderIndex -= orderLength
            }
          }

          this.setSort(sortColumn, newOrderIndex)
          this.emit('sort', sortColumn, newOrderIndex)
        })
      }
    }

    setSort(sortColumn: Column | null = null, newOrderIndex = 0) {
      const oldSortColumn = this.sortColumn
      const oldOrderIndex = this.sortOrderIndex
      const setSort = (grid: BaseGrid) => {
        const thRow = grid.ui.fixedTheadRow || grid.ui.theadRow

        // 清除上一个排序指示箭头
        const oldSortClass = 'sort-by-' + oldOrderIndex
        const lastSortTh = thRow.getElementsByClassName(oldSortClass)
        if (lastSortTh.length) {
          lastSortTh[0].classList.remove('sort-by-' + oldOrderIndex)
        }

        // 给表格设置正确的排序状态以在重新调用 setData() 时保留排序指示箭头
        // @ts-ignore
        grid.sortOrderIndex = newOrderIndex
        // @ts-ignore
        grid.sortColumn = sortColumn

        // 有排序方向时才给表格设置新的指示箭头
        if (newOrderIndex) {
          const gridThIndex = sortColumn
            ? grid.curData.columns.indexOf(sortColumn)
            : -1
          const newTh = thRow.children[gridThIndex]
          if (newTh) {
            newTh.classList.add('sort-by-' + newOrderIndex)
          }
        }
      }

      setSort(this)
      const { children } = this
      if (children) {
        children.forEach(setSort)
      }
    }

    destroy(...args: any[]) {
      const { clickEventHandler } = this
      if (clickEventHandler) clickEventHandler()
      super.destroy(...args)
    }
  }
}
