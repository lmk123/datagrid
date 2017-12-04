import TinyEmitter from 'tinyemitter'
import template from './template.html'
import './style.css'

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

const createdFns: Plugin['created'][] = []

export class DataGrid extends TinyEmitter {
  options: InnerDataGridOptions
  el: HTMLDivElement
  ui: { [prop: string]: Element }

  constructor(options: DataGridOptions = {}) {
    super()
    // 执行插件代码
    createdFns.forEach(created => created!(this))

    this.options = Object.assign(options, {
      td: defaultTdRenderer,
      th: defaultThRenderer
    })
    const el = (this.el = document.createElement('div'))
    el.className = 'datagrid'
    el.innerHTML = template
    this.ui = {
      thead: el.getElementsByTagName('thead')[0],
      tbody: el.getElementsByTagName('tbody')[0],
      modal: el.getElementsByClassName('modal-content')[0]
    }
  }

  setData(data: TableData) {
    const { columns = [], rows = [] } = data
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
      thead.innerHTML = ''
      thead.appendChild(fragment)
    } else {
      thead.innerHTML = ''
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
      tbody.innerHTML = ''
      tbody.appendChild(fragment)
      this.hideModal()
    } else {
      tbody.innerHTML = ''
      this.showModal()
    }
  }

  showModal(html = '暂无数据') {
    this.ui.modal.innerHTML = html
    this.el.classList.add('show-modal')
  }

  hideModal() {
    this.el.classList.remove('show-modal')
  }
}

export interface Plugin {
  install?: (Constructor: typeof DataGrid) => void
  created?: (grid: DataGrid) => void
}

/**
 * 应用一个插件
 * @param plugin
 */
export function use(plugin: Plugin) {
  if (plugin.install) {
    plugin.install(DataGrid)
  }

  if (plugin.created) {
    createdFns.push(plugin.created)
  }
}
