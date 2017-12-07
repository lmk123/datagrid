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
    private lastThead: HTMLTableSectionElement
    private readonly fixedHeaderTable = document.createElement('table')
    private readonly colGroup = document.createElement('colgroup')
    private readonly unbindEvents: (() => void)[] = []

    constructor(...args: any[]) {
      super(...args)
      const { el, ui } = this

      // 创建一个包含表头的 div，通过 CSS 固定在滚动区域上方
      const fixedHeaderWrapper = document.createElement('div')
      fixedHeaderWrapper.className = 'fixed-header'
      // 创建一个仅包含 thead 的表格作为固定表头
      // 使用 colgroup 保持原本的表格与固定表头的单元格宽度一致
      const { fixedHeaderTable, colGroup } = this
      fixedHeaderTable.appendChild(colGroup)
      // 将原本的 thead 移动到固定表头中
      fixedHeaderTable.appendChild(ui.thead)
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

    /** 同步表头中单元格的宽度。 */
    syncFixedHeader() {
      this.colGroup.innerHTML = Array.prototype.reduce.call(
        this.lastThead.children,
        (result: string, th: HTMLTableHeaderCellElement) => {
          return (result += `<col width="${th.clientWidth}">`)
        },
        ''
      )

      this.fixedHeaderTable.style.width = this.ui.table.clientWidth + 'px'
    }

    /** 重载 setData 方法，在渲染完表格后替换旧的固定表头。 */
    setData(data: TableData) {
      super.setData(data)

      let { ui, lastThead } = this
      const { table } = ui
      if (lastThead) {
        table.removeChild(lastThead)
      }
      lastThead = this.lastThead = ui.thead.cloneNode(
        true
      ) as HTMLTableSectionElement
      lastThead.className = 'fake-header'
      table.insertBefore(lastThead, ui.tbody)
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
