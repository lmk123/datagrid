import DataGrid from '../src/index'
import data from './data'

const grid = new DataGrid()

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
}, 2000)

setTimeout(() => {
  grid.setData(data)
  grid.setFixed(3)
  grid.setFixed(1, 'right')
}, 4000)
