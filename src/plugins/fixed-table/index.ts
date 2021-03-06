// https://github.com/Microsoft/TypeScript/issues/9944
/* tslint:disable:no-unused-variable */
import * as t from 'tinyemitter'
import * as g from '../../core'
/* tslint:enable:no-unused-variable */

// tslint:disable-next-line:no-duplicate-imports
import BaseGrid, { DataGridConstructor } from '../../core'
import debounce from '../../utils/debounce'
import addEvent from '../../utils/add-event'
import assign from '../../utils/assign'
import closest from '../../utils/closest'
import getCSSProperty from '../../utils/get-css-property'
import './style.css'

export interface FixedGrids {
  left?: BaseGrid
  right?: BaseGrid
}

export type GridPlace = keyof FixedGrids

const { some, /* forEach, */ indexOf } = Array.prototype

export default function<T extends DataGridConstructor>(Base: T) {
  return class extends Base {
    private lastHoverIndex: number | undefined
    private readonly fixedTableEvents?: Function[]

    constructor(...args: any[]) {
      super(...args)
      const { scrollContainer } = this.ui
      if (!this.parent) {
        const { el } = this
        this.fixedTableEvents = [
          // 窗口大小变化后重新同步表格的宽度
          addEvent(
            window,
            'resize',
            debounce(() => {
              const { fixedTables } = this
              if (fixedTables) {
                for (const place in fixedTables) {
                  this.syncFixedWidth(place as GridPlace)
                }
              }
            })
          ),
          // 同步表格的滚动条位置
          addEvent(scrollContainer, 'scroll', () => {
            const { fixedTables } = this
            if (!fixedTables) return
            for (let place in fixedTables) {
              fixedTables[place as GridPlace]!.ui.table.style[
                // @ts-ignore
                getCSSProperty('transform')
              ] = `translateY(-${scrollContainer.scrollTop}px)`
            }
          }),
          // 同步表格的 hover 状态
          addEvent(el, 'mouseover', e => {
            const tr = closest(
              e.target as Element,
              '.datagrid tbody tr',
              el
            ) as HTMLTableRowElement
            if (!tr) return
            const trs = tr.parentElement!.children
            const { lastHoverIndex } = this
            const index = indexOf.call(trs, tr) as number
            if (lastHoverIndex === index) return
            this.lastHoverIndex = index
            const setHover = (grid: BaseGrid) => {
              const trs = grid.ui.tbody.children
              const lastHoverTr = trs[lastHoverIndex!] as HTMLTableRowElement
              if (lastHoverTr) {
                lastHoverTr.classList.remove('hover-row')
              }
              trs[index] && trs[index].classList.add('hover-row')
            }
            setHover(this)
            const { children } = this
            if (children) {
              children.forEach(setHover)
            }
          })
        ]
      }
    }

    /**
     * 创建或更新固定在左侧或右侧的表格。
     * @param count 固定表格的列数。
     * @param place 固定表格的位置，默认为左侧。
     */
    setFixed(count: number, place: GridPlace = 'left') {
      const { fixedTables } = this
      let fixedTable = fixedTables && fixedTables[place]
      if (!count) {
        if (fixedTable) {
          fixedTable.el.style.display = 'none'
        }
        return
      }
      if (!fixedTable) {
        fixedTable = this.createFixedGrid(place)
      } else {
        fixedTable.el.style.display = ''
      }
      const { curData } = this
      fixedTable.fixedColumns = count
      this.syncFixedWidth(place)
      fixedTable.setData({
        columns:
          place === 'left'
            ? curData.columns.slice(0, count)
            : curData.columns.slice(-count),
        rows: curData.rows
      })
    }

    /**
     * 同步一个固定表格的宽度、高度等状态。
     * @param place 要同步宽度的表格的位置。
     */
    syncFixedWidth(place: GridPlace) {
      const { fixedTables } = this
      const fixedTable = fixedTables && fixedTables[place]
      if (!fixedTable) return
      const fixed = fixedTable.fixedColumns
      // 同步 table 和 th 的宽度
      let colHtml = ''
      // let width = 0
      const ths = this.ui.theadRow.children
      const thsLength = ths.length - 1

      const getTh =
        place === 'left'
          ? (index: number) => ths[index] as HTMLElement
          : (index: number) => ths[thsLength - index] as HTMLElement

      some.call(ths, (th: HTMLTableHeaderCellElement, index: number) => {
        if (index === fixed) return true
        const { offsetWidth } = getTh(index)
        colHtml += `<col width="${offsetWidth}">`
        // width += offsetWidth
      })
      // 在使用默认主题（给 th 加了右 border）的情况下，
      // 给容器固定这个宽度可以让固定表格两侧的 border 不显示出来
      // fixedTable.el.style.width = `${width}px`
      fixedTable.ui.colgroup.innerHTML = colHtml

      const { scrollContainer } = this.ui
      // 将固定表格的高度设为主表格的内容高度，这样做是为了露出主表格的横向滚动条
      fixedTable.el.style.height = scrollContainer.clientHeight + 'px'

      // 将右侧固定表格的右偏移值设为主表格的竖向滚动条的宽度以露出主表格的竖向滚动条
      if (place === 'right') {
        fixedTable.el.style.right =
          scrollContainer.offsetWidth - scrollContainer.clientWidth + 'px'
      }

      // 目前的做法是根据表格内容平铺表格，不会导致换行，所以暂时注释掉同步高度的代码
      // 同步表头的高度
      // fixedTable.ui.theadRow.style.height = this.ui.theadRow.offsetHeight + 'px'
      // 同步 tr 的高度
      // const trs = fixedTable.ui.tbody.children
      // forEach.call(
      //   this.ui.tbody.children,
      //   (tr: HTMLTableRowElement, index: number) => {
      //     ;(trs[index] as HTMLTableRowElement).style.height =
      //       tr.offsetHeight + 'px'
      //   }
      // )
    }
    destroy(...args: any[]) {
      const { fixedTableEvents } = this
      if (fixedTableEvents) fixedTableEvents.forEach(fn => fn())
      super.destroy(...args)
    }

    /**
     * 创建固定在两侧的表格实例的方法。
     * @param place 表格的位置
     */
    private createFixedGrid(place: GridPlace) {
      const innerTable = new (this.constructor as typeof BaseGrid)(
        assign(
          {
            parent: this
          },
          this.options
        )
      )
      innerTable.fixedPlace = place
      // TODO: 将代码里的 children 都换成 fixedTables
      ;(this.children || (this.children = [])).push(innerTable)
      ;(this.fixedTables || (this.fixedTables = {}))[place] = innerTable
      innerTable.el.classList.add('fixed-grid', 'fixed-grid-' + place)
      const { ui } = innerTable
      const colgroup = (ui.colgroup = document.createElement('colgroup'))
      ui.table.appendChild(colgroup)
      this.el.appendChild(innerTable.el)
      return innerTable
    }
  }
}
