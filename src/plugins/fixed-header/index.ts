// https://github.com/Microsoft/TypeScript/issues/5711
import * as g from '../../core/index'
import * as t from 'tinyemitter'

import DataGrid, { DataGridConstructor, TableData } from '../../core/index'
import addEvent from '../../utils/add-event'
import rafThrottle, { raf } from '../../utils/raf-throttle'
import getCSSProperty from '../../utils/get-css-property'
import './style.css'

export default function<T extends DataGridConstructor>(Base: T) {
  return class FixedHeader extends Base {
    private fixedTHead = document.createElement('thead')
    private readonly fixedHeaderTable = document.createElement('table')
    private readonly colGroup = document.createElement('colgroup')
    private readonly unbindEvents: (() => void)[] = []

    constructor(...args: any[]) {
      super(...args)
      const { el, ui } = this
      ui.thead.style.visibility = 'hidden'

      // 创建一个包含表头的 div，通过 CSS 固定在滚动区域上方
      const fixedHeaderWrapper = document.createElement('div')
      fixedHeaderWrapper.className = 'fixed-header'
      // 创建一个仅包含 thead 的表格作为固定表头
      // 使用 colgroup 保持原本的表格与固定表头的单元格宽度一致
      const { fixedHeaderTable, colGroup } = this
      fixedHeaderTable.appendChild(colGroup)
      fixedHeaderTable.appendChild(this.fixedTHead)
      fixedHeaderWrapper.appendChild(fixedHeaderTable)

      el.appendChild(fixedHeaderWrapper)

      const { scrollContainer } = ui
      this.unbindEvents.push(
        addEvent(
          window,
          'resize',
          rafThrottle(() => {
            this.syncFixedHeader()
          })
        ),
        // 表格滚动时，使用 transform 移动固定表头的位置以获得更平滑的效果
        addEvent(
          scrollContainer,
          'scroll',
          rafThrottle(() => {
            // 使用 transform 会比同步 scrollLeft 流畅很多
            fixedHeaderTable.style[
              // @ts-ignore
              getCSSProperty('transform')
            ] = `translate3d(-${scrollContainer.scrollLeft}px,0,0)`
          })
        )
      )
    }

    /**
     * 同步表头中单元格的宽度。
     * FIXME: 还应该同步表头的高度。
     * 目前默认是从 this.ui.thead 同步的，
     * 但是 fixedTable 应该从父表格的 thead 同步而不是从它自身的 thead 同步，
     * 否则高度就不一致，所以还应该加一个参数用于指定同步来源表头，
     * 默认为自身的 this.ui.thead。
     */
    syncFixedHeader() {
      this.colGroup.innerHTML = Array.prototype.reduce.call(
        this.ui.thead.children,
        (result: string, th: HTMLTableHeaderCellElement) => {
          return (result += `<col width="${th.clientWidth}">`)
        },
        ''
      )

      this.fixedHeaderTable.style.width = this.ui.table.clientWidth + 'px'
    }

    /** 重载 setData 方法，在渲染完表格后同步表头的内容。 */
    setData(data: TableData) {
      super.setData(data)
      this.fixedTHead.innerHTML = this.ui.thead.innerHTML
      // 需要等到 fixedTable 中的 syncFixedWidth 更新完之后再同步宽度，
      // 不然会出现 header 宽度不一致的问题
      raf(() => {
        this.syncFixedHeader()
      })
    }

    destroy(...args: any[]) {
      this.unbindEvents.forEach(unbind => unbind())
      super.destroy(...args)
    }
  }
}
