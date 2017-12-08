// https://github.com/Microsoft/TypeScript/issues/5711
import * as t from 'tinyemitter'
import * as g from '../../core/index'

import BaseGrid, { DataGridConstructor } from '../../core/index'
import addEvent from '../../utils/add-event'
import rafThrottle from '../../utils/raf-throttle'
import getCSSProperty from '../../utils/get-css-property'
import './style.css'

export interface FixedGrids {
  left?: BaseGrid
  right?: BaseGrid
}

export type GridPlace = keyof FixedGrids

const { some, forEach } = Array.prototype

export default function<T extends DataGridConstructor>(Base: T) {
  return class extends Base {
    private readonly fixedTables: FixedGrids = {}
    private leftFixed: number
    private rightFixed: number

    constructor(...args: any[]) {
      super(...args)
      const { scrollContainer } = this.ui
      const { fixedTables } = this
      addEvent(
        scrollContainer,
        'scroll',
        rafThrottle(() => {
          for (let place in fixedTables) {
            fixedTables[place as GridPlace]!.ui.table.style[
              // @ts-ignore
              getCSSProperty('transform')
            ] = `translate3d(0,-${scrollContainer.scrollTop}px,0)`
          }
        })
      )
    }

    /**
     * 创建或更新固定在左侧或右侧的表格。
     * @param count 固定表格的列数。
     * @param place 固定表格的位置，默认为左侧。
     */
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
      this[(place + 'Fixed') as 'leftFixed' | 'rightFixed'] = count
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

    /**
     * 同步一个固定表格的宽度、高度等状态。
     * @param place 要同步宽度的表格的位置。
     */
    syncFixedWidth(place: GridPlace) {
      const fixedTable = this.fixedTables[place]
      if (!fixedTable) return
      const fixed = this[(place + 'Fixed') as 'leftFixed' | 'rightFixed']
      // 同步 table 和 th 的宽度
      let colHtml = ''
      let width = 0
      const ths = this.ui.thead.children
      const thsLength = ths.length - 1

      const getTh =
        place === 'left'
          ? (index: number) => ths[index]
          : (index: number) => ths[thsLength - index]

      some.call(ths, (th: HTMLTableHeaderCellElement, index: number) => {
        if (index === fixed) return true
        const { clientWidth } = getTh(index)
        colHtml += `<col width="${clientWidth}">`
        width += clientWidth
      })
      fixedTable.el.style.width = `${width}px`
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

    /**
     * 创建固定在两侧的表格实例的方法。
     * @param place 表格的位置
     */
    private createFixedGrid(place: GridPlace) {
      const { options } = this
      const innerTable = new (this.constructor as typeof BaseGrid)({
        // XXX: 使用 copy 复制原对象
        td: options.td,
        th: options.th,
        parent: this
      })
      ;(this.children || (this.children = [])).push(innerTable)
      innerTable.el.classList.add('fixed-grid', 'fixed-grid-' + place)
      this.fixedTables[place] = innerTable
      const { ui } = innerTable
      const colgroup = (ui.colgroup = document.createElement('colgroup'))
      ui.table.appendChild(colgroup)
      this.el.appendChild(innerTable.el)
      return innerTable
    }
  }
}
