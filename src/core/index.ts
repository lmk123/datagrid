import TinyEmitter from 'tinyemitter'
import template from './template.html'
import './style.css'

export interface Column {
  key: string
}

export interface Row {
  [prop: string]: any
}

export interface DataGridOptions {
  th?: (column: Column) => string
  td?: (column: Column, row: Row) => string
}

export interface InnerDataGridOptions extends DataGridOptions {
  [prop: string]: any
}

export interface TableData {
  columns: Column[]
  rows: Row[]
}

function defaultThRenderer(column: Column) {
  return column.key
}

function defaultTdRenderer(column: Column, row: Row) {
  return row[column.key]
}

const fragment = document.createDocumentFragment()

export class DataGrid extends TinyEmitter {
  options: InnerDataGridOptions
  el: HTMLDivElement
  ui: { [prop: string]: HTMLElement }

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
      tbody: el.getElementsByTagName('tbody')[0]
    }
  }

  setData(data: TableData) {
    const { columns, rows } = data
    const { thead, tbody } = this.ui
    // 首先重新渲染表头
    columns.forEach(column => {
      const th = document.createElement('th')
      th.innerHTML = this.options.th!(column)
      fragment.appendChild(th)
    })
    thead.innerHTML = ''
    thead.appendChild(fragment)

    // 然后渲染表格
    rows.forEach(row => {
      const tr = document.createElement('tr')
      columns.forEach(column => {
        const td = document.createElement('td')
        td.innerHTML = this.options.td!(column, row)
        tr.appendChild(td)
      })
      fragment.appendChild(tr)
    })
    tbody.innerHTML = ''
    tbody.appendChild(fragment)
  }
}

export interface Plugin {
  install?: (Constructor: typeof DataGrid) => void
  created?: (grid: DataGrid) => void
}

const createdFns: Plugin['created'][] = []

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
