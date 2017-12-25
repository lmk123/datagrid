// https://github.com/Microsoft/TypeScript/issues/9944
/* tslint:disable:no-unused-variable */
import * as g from '../../core'
import * as t from 'tinyemitter'
import * as x from '../fixed-table'
/* tslint:enable:no-unused-variable */

// tslint:disable-next-line:no-duplicate-imports
import { DataGridConstructor, TableData } from '../../core'
import addEvent from '../../utils/add-event'
import { raf } from '../../utils/raf-throttle'
import getCSSProperty from '../../utils/get-css-property'
import './style.css'

export default function<T extends DataGridConstructor>(Base: T) {
  return class extends Base {
    private fixedHeaderWrapper = document.createElement('div')
    private fixedTHead = document.createElement('thead')
    private fixedTheadRow = document.createElement('tr')
    private readonly fixedHeaderTable = document.createElement('table')
    private readonly colGroup = document.createElement('colgroup')
    private readonly unbindEvents?: Function[]

    constructor(...args: any[]) {
      super(...args)
      const { el, ui } = this
      ui.thead.style.visibility = 'hidden'

      // 创建一个仅包含 thead 的表格作为固定表头
      // 使用 colgroup 保持原本的表格与固定表头的单元格宽度一致
      const {
        fixedHeaderWrapper,
        fixedHeaderTable,
        colGroup,
        fixedTHead,
        fixedTheadRow
      } = this
      fixedHeaderWrapper.className = 'fixed-header'
      ui.fixedThead = fixedTHead
      ui.fixedTheadRow = fixedTheadRow
      fixedHeaderTable.appendChild(colGroup)
      fixedTHead.appendChild(fixedTheadRow)
      fixedHeaderTable.appendChild(fixedTHead)
      fixedHeaderWrapper.appendChild(fixedHeaderTable)

      el.appendChild(fixedHeaderWrapper)

      if (!this.parent) {
        const { scrollContainer } = ui
        this.unbindEvents = [
          // 窗口大小变化后重新同步表格的宽度
          // TODO: 窗口大小变化后表格的宽度似乎没有变化？
          // addEvent(
          //   window,
          //   'resize',
          //   rafThrottle(() => {
          //     this.syncFixedHeader()
          //   })
          // ),
          // 表格滚动时，使用 transform 移动固定表头的位置以获得更平滑的效果
          addEvent(scrollContainer, 'scroll', () => {
            // 使用 transform 会比同步 scrollLeft 流畅很多
            fixedHeaderTable.style[
              // @ts-ignore
              getCSSProperty('transform')
            ] = `translateX(-${scrollContainer.scrollLeft}px)`
          })
        ]
      }
    }

    /** 同步表头中单元格的宽度。 */
    syncFixedHeader() {
      const { table, theadRow } = this.ui
      this.colGroup.innerHTML = Array.prototype.reduce.call(
        theadRow.children,
        (result: string, th: HTMLTableHeaderCellElement) => {
          // 这里不能用 clientWidth，偶尔会有 1px 的偏差
          return (result += `<col width="${th.offsetWidth}">`)
        },
        ''
      )
      this.fixedHeaderTable.style.width = table.offsetWidth + 'px'

      // 保证主表格的固定表头始终露出右侧的竖向滚动条
      if (!this.parent) {
        this.fixedHeaderWrapper.style.width =
          this.ui.scrollContainer.clientWidth + 'px'
      }

      // 同步表头的高度
      this.fixedTheadRow.style.height = theadRow.offsetHeight + 'px'
    }

    /** 重载 setData 方法，在渲染完表格后同步表头的内容。 */
    setData(data: TableData) {
      super.setData(data)
      this.fixedTheadRow.innerHTML = this.ui.theadRow.innerHTML
      this.syncFixedHeader()
    }

    destroy(...args: any[]) {
      const { unbindEvents } = this
      if (unbindEvents) unbindEvents.forEach(unbind => unbind())
      super.destroy(...args)
    }
  }
}
