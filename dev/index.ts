import DataGrid, { fixedHeader } from '../src/index'
import data from './data'

const grid = new DataGrid({
  plugins: [fixedHeader]
})
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
}, 4000)
