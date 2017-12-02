(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
(function () {
'use strict';

function __$styleInject(css, returnValue) {
  if (typeof document === 'undefined') {
    return returnValue;
  }
  css = css || '';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  head.appendChild(style);
  
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  return returnValue;
}

/*!
 * tinyemitter.js v1.0.1
 * https://github.com/lmk123/tinyemitter
 * Released under the MIT License.
 */
var TinyEmitter = /** @class */ (function () {
    function TinyEmitter() {
        this.e = {};
    }
    TinyEmitter.prototype.on = function (name, handle) {
        var e = this.e;
        (e[name] || (e[name] = [])).push(handle);
    };
    TinyEmitter.prototype.off = function (name, handle) {
        var e = this.e;
        if (!handle) {
            delete e[name];
            return;
        }
        var events = e[name];
        if (!events)
            return;
        var i = events.indexOf(handle);
        if (i >= 0) {
            if (events.length === 1) {
                delete e[name];
            }
            else {
                // 使用新数组替代原本的数组，
                // 这是为了避免在回调函数内调用 off 方法时改变了数组导致前面的回调函数被跳过
                e[name] = events.filter(function (h) { return h !== handle; });
            }
        }
    };
    TinyEmitter.prototype.emit = function (name) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var events = this.e[name];
        if (!events)
            return;
        events.forEach(function (handle) {
            handle.apply(null, args);
        });
    };
    return TinyEmitter;
}());

var template = "<table>\n  <thead></thead>\n  <tbody></tbody>\n</table>\n";

__$styleInject(".datagrid table {\n    min-width: 100%;\n  }\n\n",undefined);

function defaultThRenderer(column) {
    return column.key;
}
function defaultTdRenderer(column, row) {
    return row[column.key];
}
const fragment = document.createDocumentFragment();
class DataGrid extends TinyEmitter {
    constructor(options = {}) {
        super();
        // 执行插件代码
        createdFns.forEach(created => created(this));
        this.options = Object.assign(options, {
            td: defaultTdRenderer,
            th: defaultThRenderer
        });
        const el = (this.el = document.createElement('div'));
        el.className = 'datagrid';
        el.innerHTML = template;
        this.ui = {
            thead: el.getElementsByTagName('thead')[0],
            tbody: el.getElementsByTagName('tbody')[0]
        };
    }
    setData(data) {
        const { columns, rows } = data;
        const { thead, tbody } = this.ui;
        // 首先重新渲染表头
        columns.forEach(column => {
            const th = document.createElement('th');
            th.innerHTML = this.options.th(column);
            fragment.appendChild(th);
        });
        thead.innerHTML = '';
        thead.appendChild(fragment);
        // 然后渲染表格
        rows.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(column => {
                const td = document.createElement('td');
                td.innerHTML = this.options.td(column, row);
                tr.appendChild(td);
            });
            fragment.appendChild(tr);
        });
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
    }
}
const createdFns = [];
/**
 * 应用一个插件
 * @param plugin
 */

function createGrid(options) {
    return new DataGrid(options);
}

var grid = createGrid();
document.body.appendChild(grid.el);
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
    });
}, 2000);
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
    });
}, 4000);

}());
