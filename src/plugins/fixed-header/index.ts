import DataGrid from '../../core/index'
import addEvent from '../../utils/add-event'
import rafThrottle from '../../utils/raf-throttle'
import getProperty from '../../utils/get-property'
import './style.css'

export default function(datagrid: DataGrid) {
  const { el } = datagrid
  const { table, thead, tbody } = datagrid.ui
  // 创建一个滚动区域包裹表格
  const scrollContainer = document.createElement('div')
  scrollContainer.className = 'scroll-container'
  scrollContainer.appendChild(table)

  // 创建一个包含表头的 div，通过 CSS 固定在滚动区域上方
  const fixedHeaderWrapper = document.createElement('div')
  fixedHeaderWrapper.className = 'fixed-header'
  // 创建一个仅包含 thead 的表格作为固定表头
  const fixedHeaderTable = document.createElement('table')
  // 使用 colgroup 保持原本的表格与固定表头的单元格宽度一直
  const colGroups = document.createElement('colgroup')
  fixedHeaderTable.appendChild(colGroups)
  // 将原本的 thead 移动到固定表头中
  fixedHeaderTable.appendChild(thead)
  fixedHeaderWrapper.appendChild(fixedHeaderTable)
  // 重新布局
  el.appendChild(fixedHeaderWrapper)
  el.appendChild(scrollContainer)

  let lastThead: HTMLTableSectionElement

  /** 同步原本的表格与固定表头之间的单元格与表格宽度 */
  function syncWidth() {
    colGroups.innerHTML = Array.prototype.reduce.call(
      lastThead.children,
      (result: string, th: HTMLTableHeaderCellElement) => {
        return (result += `<col width="${th.clientWidth}">`)
      },
      ''
    )

    fixedHeaderTable.style.width = table.clientWidth + 'px'
  }

  const unbindEvents = [
    addEvent(window, 'resize', rafThrottle(syncWidth)),
    // 表格滚动时，使用 transform 移动固定表头的位置以获得更平滑的效果
    addEvent(
      scrollContainer,
      'scroll',
      rafThrottle(() => {
        // @ts-ignore
        fixedHeaderTable.style[getProperty('transform')] = `translate3d(-${
          scrollContainer.scrollLeft
        }px,0,0)`
      })
    )
  ]

  // 重新渲染数据后，将固定表头复制一份放在表格里，然后同步宽度
  datagrid.on('afterSetData', () => {
    if (lastThead) {
      table.removeChild(lastThead)
    }
    lastThead = thead.cloneNode(true) as HTMLTableSectionElement
    lastThead.className = 'fake-header'
    table.insertBefore(lastThead, tbody)
    syncWidth()
  })

  datagrid.on('beforeDestroy', () => {
    unbindEvents.forEach(unbind => unbind())
  })
}
