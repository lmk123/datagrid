// https://github.com/Microsoft/TypeScript/issues/9944
/* tslint:disable:no-unused-variable */
import * as t from 'tinyemitter'
import * as g from '../../core/index'
import * as x from '../fixed-table'
/* tslint:enable:no-unused-variable */

import './style.css'
import BaseGrid, { DataGridConstructor, Column } from '../../core'
import addEvent from '../../utils/add-event'
import closest from '../../utils/closest'

// const DESC = -1, // 降序
//   ASC = 1, // 升序
//   NONE = 0 // 不排序

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
    Object.assign(span, element)
    fd.appendChild(span)
  })

  return fd
}

export default function<T extends DataGridConstructor>(Base: T) {
  return class extends Base {
    private sortColumnIndex: number
    private sortOrderIndex = 0

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
          if (index === this.sortColumnIndex && this.sortOrderIndex) {
            th.classList.add('sort-by-' + this.sortOrderIndex)
          }
          // TODO: 后期增加只针对某些 column 开启排序的功能
          th.classList.add('sortable')
          appendSortBlock(th)
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

          let newSortColumnIndex: number
          const isRightFixed = closest.call(th, '.fixed-grid-right')
          if (isRightFixed) {
            newSortColumnIndex =
              this.curData.columns.length -
              (this.fixedTables!.right!.fixedColumns! - thIndex)
          } else {
            newSortColumnIndex = thIndex
          }

          let newOrderIndex: number
          const oldOrderIndex = this.sortOrderIndex
          const oldSortColumnIndex = this.sortColumnIndex
          if (oldSortColumnIndex !== newSortColumnIndex) {
            this.sortColumnIndex = newSortColumnIndex
            newOrderIndex = 1
          } else {
            newOrderIndex = this.sortOrderIndex + 1
            if (newOrderIndex >= orderLength) {
              newOrderIndex -= orderLength
            }
          }
          this.sortOrderIndex = newOrderIndex

          const setSort = (grid: BaseGrid) => {
            const columnIndex2trIndex = (columnIndex: number) => {
              return grid.fixedPlace === 'right'
                ? grid.fixedColumns! -
                    (this.curData.columns.length - columnIndex)
                : columnIndex
            }
            const ths = (grid.ui.fixedTheadRow || grid.ui.theadRow).children
            if (oldOrderIndex) {
              const oldTh = ths[columnIndex2trIndex(oldSortColumnIndex)]
              if (oldTh) {
                oldTh.classList.remove('sort-by-' + oldOrderIndex)
              }
            }
            if (newOrderIndex) {
              const newTh = ths[columnIndex2trIndex(newSortColumnIndex)]
              console.log(
                grid.fixedPlace === 'right'
                  ? grid.fixedColumns! -
                    (this.curData.columns.length - newSortColumnIndex)
                  : newSortColumnIndex
              )
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

          this.emit('sort', thIndex, newOrderIndex)
        })
      }
    }
  }
}
