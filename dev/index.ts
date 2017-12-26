import DataGrid from '../src/index'
import data from './data'
import '../theme.css'

const grid = new DataGrid()

grid.on('select', (row: any) => {
  console.log('用户选中了一行：', row)
})
const orderMap = {
  0: '无方向',
  1: '朝上',
  2: '朝下'
}
grid.on('sort', (column: any, order: 0 | 1 | 2) => {
  console.log('当前排序列：', column)
  console.log('当前排序方向：', orderMap[order])
})

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
