# DataGrid [![NPM Version](https://img.shields.io/npm/v/datagrid.svg?style=flat-square)](https://www.npmjs.com/package/datagrid)

插件式表格组件。[查看在线示例](https://lmk123.github.io/datagrid/)

## 安装

使用 NPM 安装：

```
npm install datagrid
```

然后在项目中导入：

```js
// ES6 模块语法
import DataGrid, {
  BaseGrid,
  fixedHeader,
  fixedTable,
  sort,
  selection
} from 'datagrid'

// CommonJS 模块语法
const {
  default: DataGrid,
  BaseGrid,
  fixedHeader,
  fixedTable,
  sort,
  selection
} = require('datagrid')
```

也可以直接下载 [datagrid.js](https://unpkg.com/datagrid) 并在 HTML 文件中导入：

```html
<script src="path/to/datagrid.js"></script>
<script>
const {
  default: DataGrid,
  BaseGrid,
  fixedHeader,
  fixedTable,
  sort,
  selection
} = datagrid
</script>
```

### 选择插件

默认导出的 DataGrid 应用了全部内置插件，但你也可以选择用的到的插件自行构造：

```js
import {
  BaseGrid, // 最基础的表格，没有使用任何插件
  fixedHeader, // 固定表头
  fixedTable, // 生成固定在两侧的表格，不随左右滚动而移动
  sort, // 点击表头排序
  selection // 选择表格中的行
} from 'datagrid'

// 生成一个包含固定表头和排序的表格构造函数，插件的顺序没有要求
const MyGrid = sort(fixedHeader(BaseGrid))
```

默认导出的 `DataGrid` 等同于 `selection(sort(fixedHeader(fixedTable(BaseGrid))))`。

### 样式主题

DataGrid 和它的插件将必要的样式使用 `<style>` 元素插入到了 DOM 中，所以使用 DataGrid 时无需引入额外的样式文件，你可以自定义表格的样式。

同时，DataGrid 内置了一个样式主题，你可以下载 [theme.css](https://unpkg.com/datagrid/theme.css) 到你的项目中使用。如果你使用了模块打包工具，则可以直接在项目中引用：

```js
import 'datagrid/theme.css'
```

## API

### BaseGrid

BaseGrid 是最基础的表格，可以这样使用：

```js
import { BaseGrid } from 'datagrid'

const grid = new BaseGrid(options)
```

其中 `options` 及它的所有设置项都是可选的，它接收如下两个设置：

* `th`：表格中的 `<th>` 元素的渲染函数。第一个参数是一个 `Column` 对象(详细介绍见下文)，第二个参数是这个 Column 对象的索引号。可以返回一段 HTML 字符串，或者一个 `Node`，也可以返回一个包含多个元素的 `DocumentFragment`。第三个参数是当前渲染的 `<th>` 元素，方便直接操作此元素的 `title` 等属性，当然你也可以通过这个元素直接设置内容。默认返回 `Column` 对象中的 `key` 属性的值。
* `td`：表格中的 `<td>`元素的渲染函数。第一个参数是一个 `Column` 对象(详细介绍见下文)，第二个参数是一个 `Row` 对象，第三个参数是当前渲染的 `<td>` 元素，方便直接操作此元素的 `title` 等属性，当然你也可以通过这个元素直接设置内容。第四个是 `Column` 对象的索引号，第五个是 `Row` 对象的索引号。可以返回一段 HTML 字符串，或者一个 `Node`，也可以返回一个包含多个元素的 `DocumentFragment`。默认返回 `Row` 对象中对应 `Column.key` 的值。

内置插件可能会添加其他一些设置项，后面介绍内置插件时会详细说明。

BaseGrid 有且仅有一个公开属性：`el`，一个 div 元素，表示表格的根元素。

BaseGrid 有这些方法：

#### setData({ columns: string[] | Column[], rows: Row[] })

使用数据渲染表格。参数是可选的，如果不传任何参数，则表格会显示“暂无数据”的提示。

`Column` 目前只有一个属性：`name`，它是表头的内容，同时也是 `Row` 中用于读取对应数据的字段名。如果传入的是字符串，则会在内部被转换为一个 `name` 属性为字符串值的对象。

示例：

```js
grid.setData({
  // 也可以写成 columns: ['年龄']
  columns: [
    {
      name: '年龄'
    }
  ],
  rows: [
    {
      年龄: 24
    }
  ]
})
```

#### showModal(msg: string = '暂无数据')

显示一段消息，默认会显示“暂无数据”，消息中可以包含 HTML 标签。

#### hideModal()

隐藏消息。

#### destroy(remove: Boolean)

销毁实例。如果传入 `true` 作为参数，还会从 DOM 中删除表格元素。

### fixedTable 插件

fixedTable 插件提供了在主表格左右两侧生成固定表格的功能，这些表格不会随着主表格左右滚动，但会随着表格上下滚动。

fixedTable 没有给 BaseGrid 添加任何设置和属性。

fixedTable 给 BaseGrid 添加了两个方法：

#### setFixed(count: number, place = 'left')

第一个参数表示要从表格中同步多少列数据。第二个参数指定固定表格的位置，默认为左侧，也可以传 `right` 在右侧生成。

#### syncFixedWidth(place: 'left' | 'right')

同步左侧或右侧表格的数据、宽度等。调用 `setFixed` 方法时会自动运行这个方法，但如果你在其他情况下改变了主表格的宽度、高度等状态，可以手动调用此方法重新定位固定表格。

### fixedHeader 插件

fixedHeader 插件将表格的表头固定在了最顶部，不随着表格上下滚动而隐藏。

fixedHeader 没有给 BaseGrid 添加任何设置和属性。

fixedHeader 给 BaseGrid 添加了一个方法：

#### syncFixedHeader()

从主表格同步表头的宽度、高度等状态。调用 `setData` 方法后会自动运行这个方法，但如果在其他情况下修改了主表格的状态，可以手动调用此方法同步到固定表头。

### selection 插件

让表格行可以被单选。

selection 插件没有给 BaseGrid 添加任何设置、属性。

selection 插件给 BaseGrid 添加了一个方法：

#### setSelected(row?: object)

将指定行设为选中状态，如果要取消选中状态则不要传参数。注意：调用这一方法不会触发下面的 `select` 事件。

当用户选中了一行数据时，会触发 BaseGrid 的 `select` 事件，参数是选中行的 `Row` 对象。

示例：

```js
import { BaseGrid, selection } from 'datagrid'

const MyGrid = selection(BaseGrid)
const grid = new MyGrid()
grid.on('select', row => {
  console.log(`用户选中了这个对象：`, row)
})
```

### sort 插件

sort 插件会在用户点击表头时触发事件，并在表头右侧显示正确方向的箭头。

sort 插件给 BaseGrid 添加了一个可选的设置：`sortBlock`，可以使用这个属性替代默认的上下箭头。这个属性可以设置成一段 HTML 字符串，或者是返回 `Node` 或 `DocumentFragment` 的**函数**。在用户点击表头后，sort 插件会触发事件。

完整示例：

```js
import { BaseGrid, sort } from 'datagrid'

const MyGrid = sort(BaseGrid)
const grid = new MyGrid({
  // 使用 asc 或者 desc 标注排序时要显示的元素
  sortBlock: '<span class="asc">上</span><span class="desc">下</span>'
})
const orderMap = {
  0: '无方向',
  1: '朝上',
  2: '朝下'
}
grid.on('sort', (column, order) => {
  console.log('用户点击了这个列', column)
  console.log('当前排序方向：', orderMap[order])
})
```

sort 插件给 BaseGrid 添加了一个方法：

#### setSort([column: Column, order: number])

设置当前表格的选中状态指示标志。如果要清空指示标志不需要传入任何参数。

#### 关于 sort 插件的一点说明

sort 插件在内部保存了当前正处于排序状态的 Column 对象本身，所以即使你改变了 columns 的顺序，箭头仍然会跟随那个 Column 对象显示，举例来说：

```js
import DataGrid from 'datagrid'
let columns = [{ name: '你好' }, { name: '世界' }]
const rows = [{ 你好: '测试', 世界: '一下' }]
const grid = new DataGrid()
grid.setData({ columns, rows })
// 使用「你好」这一列排序
grid.setSort(columns[0], 1)
// 将「你好」与「世界」这两列的位置调换
columns = [columns[1], columns[0]]
// 重新设置数据
grid.setData({ columns, rows })
```

现在你会发现指示的箭头仍然是显示在「你好」这一列（此时它是表格中的第二列）。

这样当然很好，但是当你使用**字符串**形式的 `columns` 时，DataGrid 在内部给你转换成了一个对象，而**对象之间并不相等**，所以上面的代码如果将 `columns` 写成字符串形式就不起作用了：

```js
grid.setData({
  columns: ['你好', '世界']
})
grid.setData({
  columns: ['世界', '你好']
})
// 现在排序箭头并没有显示在「你好」这一列上，这是因为前后两次调用 setData 方法时内部生成的 Column 对象并不相等
```

同样的情况也会出现在你使用新的对象调用 `setData` 时：

```js
grid.setData({
  columns: [{ name: '你好' }, { name: '世界' }]
})
grid.setData({
  columns: [{ name: '世界' }, { name: '你好' }]
})
```

你可能会希望排序箭头能跟随「你好」这一列，但是前后两次调用 setData 方法时，`columns` 中的对象**并不相等**，所以导致第二次生成的表格中没有排序箭头显示。

## 许可

MIT
