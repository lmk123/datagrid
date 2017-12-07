/**
 * @fileOverview 输出一个最基本的、仅包含核心功能的表格类。
 */

import TinyEmitter from 'tinyemitter'
import template from './template.html'
import './style.css'

export type DataGridConstructor = new (...args: any[]) => BaseGrid

export interface ColumnObj {
  key: string
}

export type Column = string | ColumnObj

export interface Row {
  [prop: string]: any
}

export interface DataGridOptions {
  th?: (column: ColumnObj) => string
  td?: (column: ColumnObj, row: Row) => string
  plugins?: Plugin[]
}

export interface InnerDataGridOptions extends DataGridOptions {
  [prop: string]: any
}

export interface TableData {
  columns: Column[]
  rows: Row[]
}

function defaultThRenderer(column: ColumnObj) {
  return column.key
}

function defaultTdRenderer(column: ColumnObj, row: Row) {
  return row[column.key]
}

const fragment = document.createDocumentFragment()

export default class BaseGrid extends TinyEmitter {
  protected options: InnerDataGridOptions
  readonly el = document.createElement('div')
  readonly ui: { [prop: string]: HTMLElement } = {}
  protected curData: TableData

  constructor(options: DataGridOptions = {}) {
    super()
    this.options = Object.assign(
      {
        td: defaultTdRenderer,
        th: defaultThRenderer,
        plugins: []
      },
      options
    )
    const el = this.el
    el.className = 'datagrid'
    el.innerHTML = template
    Object.assign(this.ui, {
      scrollContainer: el.getElementsByClassName('scroll-container')[0],
      table: el.getElementsByTagName('table')[0],
      thead: el.getElementsByTagName('thead')[0],
      tbody: el.getElementsByTagName('tbody')[0],
      modal: el.getElementsByClassName('modal-content')[0]
    })
  }

  /** 根据数据生成表格内容。 */
  setData(data: TableData) {
    const { columns = [], rows = [] } = data
    this.curData = {
      columns,
      rows
    }
    const { thead, tbody } = this.ui

    // 首先重新渲染表头
    if (columns.length) {
      columns.forEach(column => {
        if (typeof column === 'string') {
          column = {
            key: column
          }
        }
        const th = document.createElement('th')
        th.innerHTML = this.options.th!(column)
        fragment.appendChild(th)
      })
      thead.textContent = ''
      thead.appendChild(fragment)
    } else {
      thead.textContent = ''
    }

    // 然后渲染表格
    if (rows.length) {
      rows.forEach(row => {
        const tr = document.createElement('tr')
        columns.forEach(column => {
          if (typeof column === 'string') {
            column = {
              key: column
            }
          }
          const td = document.createElement('td')
          td.innerHTML = this.options.td!(column, row)
          tr.appendChild(td)
        })
        fragment.appendChild(tr)
      })
      tbody.textContent = ''
      tbody.appendChild(fragment)
      this.hideModal()
    } else {
      tbody.textContent = ''
      this.showModal()
    }
  }

  /** 显示一段消息。默认会显示“暂无数据” */
  showModal(html = '暂无数据') {
    this.ui.modal.innerHTML = html
    this.el.classList.add('show-modal')
  }

  /** 隐藏消息。 */
  hideModal() {
    this.el.classList.remove('show-modal')
  }

  /**
   * 销毁对象。
   * @param remove 如果为 true，则从 DOM 中删除元素。
   */
  destroy(remove?: Boolean) {
    if (remove) {
      const { el } = this
      const { parentElement } = el
      if (parentElement) {
        parentElement.removeChild(el)
      }
    }
  }
}
