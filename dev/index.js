var grid = Datagrid.createGrid()
document.body.appendChild(grid.el)

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
  grid.setData({
    columns: [
      {
        key: '我看'
      }
    ],
    rows: [
      {
        '我看': '去吧'
      }
    ]
  })
}, 4000)
