/**
 * @fileOverview 输出一个最基本的、仅包含核心功能的表格类。
 */

import TinyEmitter from 'tinyemitter'
import template from './template.html'
import './style.css'
import { GridPlace } from '../plugins/fixed-table/index'

export type DataGridConstructor = new (...args: any[]) => BaseGrid

export interface ColumnObj {
  key: string
}

export type Column = string | ColumnObj

export interface Row {
  [prop: string]: any
}

export interface DataGridOptions {
  th?: (column: ColumnObj, index: number) => string | Node
  td?: (
    column: ColumnObj,
    row: Row,
    columnIndex: number,
    rowIndex: number
  ) => string | Node
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

/**
 * 根据内容的类型选择不同的方式填充节点。
 * @param node 需要填充的节点。
 * @param content 内容可以是字符串或者一个节点。如果有多个节点，可以传入一个 Fragment 对象。
 */
function fillNode(node: HTMLElement, content: string | Node) {
  if (typeof content === 'string') {
    node.innerHTML = content
  } else {
    node.appendChild(content)
  }
}

const fragment = document.createDocumentFragment()

export default class BaseGrid extends TinyEmitter {
  protected options: InnerDataGridOptions
  readonly el = document.createElement('div')
  readonly ui: { [prop: string]: HTMLElement } = {}
  protected curData: TableData
  /** 如果当前实例用了 fixedTable 插件，则会有这个属性 */
  protected children?: BaseGrid[]
  // 下面的这些属性都只在由 fixedTable 插件内部创建的表格实例上存在
  /** 如果当前实例是 fixedTable 创建的内部表格则会有这个属性 */
  parent?: BaseGrid
  /** 这个固定表格当前固定的列的个数 */
  fixedColumns?: number
  /** 这个固定表格的位置 */
  fixedPlace?: GridPlace

  constructor(options: DataGridOptions = {}) {
    super()
    const realOptions = (this.options = Object.assign(
      {
        td: defaultTdRenderer,
        th: defaultThRenderer
      },
      options
    ))
    const { el } = this
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
      columns.forEach((column, index) => {
        if (typeof column === 'string') {
          column = {
            key: column
          }
        }
        const th = document.createElement('th')
        fillNode(th, this.options.th!(column, index))
        this.emit('after th render', th, column, index)
        fragment.appendChild(th)
      })
      thead.textContent = ''
      thead.appendChild(fragment)
    } else {
      thead.textContent = ''
    }

    // 然后渲染表格
    if (rows.length) {
      rows.forEach((row, rowIndex) => {
        const tr = document.createElement('tr')
        columns.forEach((column, columnIndex) => {
          if (typeof column === 'string') {
            column = {
              key: column
            }
          }
          const td = document.createElement('td')
          fillNode(td, this.options.td!(column, row, columnIndex, rowIndex))
          this.emit('after td render', td, column, row, rowIndex, columnIndex)
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
