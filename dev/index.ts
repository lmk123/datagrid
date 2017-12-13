import DataGrid from '../src/index'
import data from './data'
import '../theme.css'

const grid = new DataGrid()

// @ts-ignore
window._grid = grid

document.body.appendChild(grid.el)
grid.setData({ rows: [], columns: [] })

setTimeout(() => {
  grid.setData({
    columns: [
      {
        key: '测试'
      }
    ],
    rows: [
      {
        测试: '你好'
      }
    ]
  })
}, 500)

setTimeout(() => {
  grid.setData(data)
  grid.setFixed(3)
  grid.setFixed(1, 'right')
}, 1000)
