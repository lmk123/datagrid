// https://github.com/Microsoft/TypeScript/issues/9944
import * as g from '../../core/index'
import * as t from 'tinyemitter'

import './style.css'
import { DataGridConstructor, TableData } from '../../core/index'
import addEvent from '../../utils/add-event'
import rafThrottle, { raf } from '../../utils/raf-throttle'
var MIN_WIDTH = 100
var IS_TOUCH = 'ontouchstart' in window
var MOUSEDOWN = IS_TOUCH ? 'touchstart' : 'mousedown'
var MOUSEMOVE = IS_TOUCH ? 'touchmove' : 'mousemove'
var MOUSEUP = IS_TOUCH ? 'touchend' : 'mouseup'
var indexOf = Array.prototype.indexOf
var getPageX = IS_TOUCH
  ? function(e: MouseEvent & TouchEvent) {
      return e.changedTouches[0].pageX
    }
  : function(e: MouseEvent & TouchEvent) {
      return e.pageX
    }

export default function<T extends DataGridConstructor>(Base: T) {
  return class FixedHeader extends Base {
    constructor(...args: any[]) {
      super(...args)
      this.on('after th render', (th: HTMLTableHeaderCellElement) => {
        const span = document.createElement('span')
        span.className = 'drag-lever'
        th.appendChild(span)
      })
      if (this.parent) return

      // 拖动时显示的虚线
      var dragLine = document.createElement('div')
      dragLine.classList.add('dragging-line')
      this.el.appendChild(dragLine)

      var dragging = false // 是否正在拖动中
      var draggingTH: HTMLElement // 被拖动的 th 元素
      var draggingColumnIndex: number // 被拖动的元素是第几个字段
      var startX: number // 拖动开始时的 pageX 值
      var draggingLineInitLeft: number // 拖动开始时虚线的左编剧
      var minLeft: number // 当往左边拖动时能拖动的最大距离

      const showDragLine = (th: HTMLElement) => {
        // 显示虚线
        var ui = this.ui
        var $columnsWrapper = ui.$columnsWrapper
        var $bodyWrapper = ui.$bodyWrapper

        dragLine.style.height = this.el.offsetHeight + 'px'
        draggingLineInitLeft =
          th.offsetLeft + th.offsetWidth - ui.scrollContainer.scrollLeft
        dragLine.style.left = draggingLineInitLeft + 1 + 'px'
        document.documentElement.classList.add('data-grid-dragging')
      }

      // 在非触摸屏设备上，鼠标移上去的时候就显示拖拽虚线
      if (!IS_TOUCH) {
        addEvent(this.el, 'mouseover', e => {
          const target = e.target as HTMLElement
          if (!target.classList.contains('drag-lever')) return
          showDragLine(target.parentElement!)
        })
        addEvent(this.el, 'mouseout', function(e) {
          if (dragging) return
          const target = e.target as HTMLElement
          if (!target.classList.contains('drag-lever')) return
          document.documentElement.classList.remove('data-grid-dragging')
        })
      }

      // @ts-ignore
      addEvent(this.el, MOUSEDOWN, (e: MouseEvent & TouchEvent) => {
        if (!IS_TOUCH && e.button !== 0) return
        const target = e.target as HTMLElement
        if (!target.classList.contains('drag-lever')) return
        var th = target.parentElement

        if (IS_TOUCH) showDragLine(th!)

        // TODO: 避免触发排序
        minLeft = -(th!.offsetWidth - MIN_WIDTH)
        draggingTH = th!
        dragging = true
        startX = getPageX(e)
        draggingColumnIndex = indexOf.call(th!.parentElement!.children, th)
      })

      //@ts-ignore
      addEvent(document, MOUSEMOVE, (e: MouseEvent & TouchEvent) => {
        if (!dragging) return
        e.preventDefault() // 阻止在 PC 端拖动鼠标时选中文字或在移动端滑动屏幕
        // 调整虚线的 left 值
        var moved = getPageX(e) - startX
        if (moved > minLeft) {
          dragLine.style.left =
            draggingLineInitLeft + (getPageX(e) - startX) + 'px'
        }
      })

      //@ts-ignore
      addEvent(document, MOUSEUP, (e: MouseEvent & TouchEvent) => {
        if (!dragging) return
        document.documentElement.classList.remove('data-grid-dragging')
        dragging = false
        var moved = getPageX(e) - startX // 计算移动的距离
        if (moved < minLeft) moved = minLeft
        // TODO: 设置宽度
      })
    }
  }
}
