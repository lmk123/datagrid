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
            { return; }
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
        var arguments$1 = arguments;

        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments$1[_i];
        }
        var events = this.e[name];
        if (!events)
            { return; }
        events.forEach(function (handle) {
            handle.apply(null, args);
        });
    };
    return TinyEmitter;
}());

var template = "<div class=scroll-container><table><thead><tr></tr></thead><tbody></tbody></table></div><div class=modal><div class=modal-content></div></div>";

__$styleInject(".datagrid{position:relative;overflow:hidden}.datagrid .modal{display:none;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;position:absolute;top:0;left:0;right:0;bottom:0;background-color:#fff}.datagrid.show-modal .modal{display:-webkit-box;display:-ms-flexbox;display:flex}.datagrid .scroll-container{height:100%;overflow:scroll}.datagrid table{min-width:100%;border-collapse:collapse;border-spacing:0}.datagrid td{word-wrap:break-word;word-break:break-all}",undefined);

var hasOwnProperty = Object.prototype.hasOwnProperty;
function forOwn(obj, cb) {
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
            cb(obj[key], key);
        }
    }
}
var assign = Object.assign ||
    function (target) {
        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

        args.forEach(function (arg) {
            forOwn(arg, function (val, key) {
                target[key] = val;
            });
        });
    };

/**
 * @fileOverview 输出一个最基本的、仅包含核心功能的表格类。
 */
function defaultThRenderer(column) {
    return column.name;
}
function defaultTdRenderer(column, row) {
    return row[column.name];
}
/**
 * 根据内容的类型选择不同的方式填充节点。
 * @param node 需要填充的节点。
 * @param content 内容可以是字符串或者一个节点。如果有多个节点，可以传入一个 Fragment 对象。
 */
function fillNode(node, content) {
    if (content === undefined)
        { return; }
    if (content instanceof Node) {
        node.appendChild(content);
    }
    else {
        node.innerHTML = content;
    }
}
var fragment = document.createDocumentFragment();
// 下面的一些 protected 关键字是因为一个 bug 才被注释掉的，
// @see https://github.com/Microsoft/TypeScript/issues/17744
var BaseGrid = (function (TinyEmitter$$1) {
    function BaseGrid(options) {
        if ( options === void 0 ) options = {};

        TinyEmitter$$1.call(this);
        /* tslint:disable:member-ordering */
        this.el = document.createElement('div');
        this.options = assign({
            td: defaultTdRenderer,
            th: defaultThRenderer
        }, options);
        this.parent = options && options.parent;
        var ref = this;
        var el = ref.el;
        el.className = 'datagrid';
        el.innerHTML = template;
        var thead = el.getElementsByTagName('thead')[0];
        this.ui = {
            scrollContainer: el.getElementsByClassName('scroll-container')[0],
            table: el.getElementsByTagName('table')[0],
            thead: thead,
            theadRow: thead.firstElementChild,
            tbody: el.getElementsByTagName('tbody')[0],
            modal: el.getElementsByClassName('modal-content')[0]
        };
    }

    if ( TinyEmitter$$1 ) BaseGrid.__proto__ = TinyEmitter$$1;
    BaseGrid.prototype = Object.create( TinyEmitter$$1 && TinyEmitter$$1.prototype );
    BaseGrid.prototype.constructor = BaseGrid;
    /** 根据数据生成表格内容。 */
    BaseGrid.prototype.setData = function setData (data) {
        var this$1 = this;

        var columns = data.columns; if ( columns === void 0 ) columns = [];
        var rows = data.rows; if ( rows === void 0 ) rows = [];
        this.curData = {
            columns: columns.slice(),
            rows: rows.slice()
        };
        var ref = this.ui;
        var theadRow = ref.theadRow;
        var tbody = ref.tbody;
        // 首先重新渲染表头
        if (columns.length) {
            columns.forEach(function (column, index) {
                if (typeof column === 'string') {
                    this$1.curData.columns[index] = column = {
                        name: column
                    };
                }
                var th = document.createElement('th');
                fillNode(th, this$1.options.th(column, index, th));
                this$1.emit('after th render', th, column, index);
                fragment.appendChild(th);
            });
            theadRow.textContent = '';
            theadRow.appendChild(fragment);
        }
        else {
            theadRow.textContent = '';
        }
        // 然后渲染表格
        if (rows.length) {
            rows.forEach(function (row, rowIndex) {
                var tr = document.createElement('tr');
                columns.forEach(function (column, columnIndex) {
                    if (typeof column === 'string') {
                        column = {
                            name: column
                        };
                    }
                    var td = document.createElement('td');
                    fillNode(td, this$1.options.td(column, row, td, columnIndex, rowIndex));
                    this$1.emit('after td render', td, column, row, td, rowIndex, columnIndex);
                    tr.appendChild(td);
                });
                fragment.appendChild(tr);
            });
            tbody.textContent = '';
            tbody.appendChild(fragment);
            this.hideModal();
        }
        else {
            tbody.textContent = '';
            this.showModal();
        }
    };
    /** 显示一段消息。默认会显示“暂无数据” */
    BaseGrid.prototype.showModal = function showModal (html) {
        if ( html === void 0 ) html = '暂无数据';

        this.ui.modal.innerHTML = html;
        this.el.classList.add('show-modal');
    };
    /** 隐藏消息。 */
    BaseGrid.prototype.hideModal = function hideModal () {
        this.el.classList.remove('show-modal');
    };
    /**
     * 销毁对象。
     * @param remove 如果为 true，则从 DOM 中删除元素。
     */
    BaseGrid.prototype.destroy = function destroy (remove) {
        if (remove) {
            var ref = this;
            var el = ref.el;
            var parentElement = el.parentElement;
            if (parentElement) {
                parentElement.removeChild(el);
            }
        }
    };

    return BaseGrid;
}(TinyEmitter));

/**
 * 在事件目标上注册一个事件，并返回取消事件的函数。
 * @param target 事件目标
 * @param event 事件名称
 * @param handler 事件处理函数
 */
var addEvent = function (target, event, handler) {
    target.addEventListener(event, handler);
    return function () {
        target.removeEventListener(event, handler);
    };
};

var debounce = function (func, wait) {
    if ( wait === void 0 ) wait = 250;

    var timeout;
    return function () {
        var this$1 = this;
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        clearTimeout(timeout);
        timeout = setTimeout(function () {
            func.apply(this$1, args);
        }, wait);
    };
};

/** 默认情况下使用 join 将参数转换成一个字符串作为唯一的缓存键 */
function generate(args) {
    return args.join();
}
/**
 * 返回一个能记住函数返回值的函数，避免重复计算
 * @param fn 执行计算的函数
 * @param generateKey 根据函数参数计算唯一的缓存键的函数
 */
var memory = function (fn, generateKey) {
    if ( generateKey === void 0 ) generateKey = generate;

    var caches = {};
    return function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var cacheKey = generateKey(args);
        return caches[cacheKey] || (caches[cacheKey] = fn.apply(null, args));
    };
};

var ref = document.createElement('div');
var style$1 = ref.style;
var vd;
/**
 * 获取一个 CSS 属性在当前浏览器中可用的名字。
 * @param property 属性的标准名称。
 */
var getCSSProperty = memory(function (property) {
    if (property in style$1)
        { return property; }
    var camelCase = property[0].toUpperCase() + property.slice(1);
    var getVendorProperty = function (vendor) {
        var vendorProperty = (vendor + camelCase);
        if (vendorProperty in style$1) {
            return vendorProperty;
        }
    };
    if (vd) {
        return getVendorProperty(vd);
    }
    var result;
    ['webkit', 'ms', 'moz', 'o'].some(function (vendor) {
        var vendorProperty = getVendorProperty(vendor);
        if (vendorProperty) {
            result = vendorProperty;
            vd = vendor;
            return true;
        }
        return false;
    });
    return result;
});

__$styleInject(".datagrid .fixed-header{position:absolute;top:0;left:0;background-color:#fff;overflow:hidden}.datagrid .fixed-header table{will-change:transform}",undefined);

var fixedHeader = function (Base) {
    return (function (Base) {
        function anonymous() {
            var this$1 = this;
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            Base.apply(this, args);
            this.fixedHeaderWrapper = document.createElement('div');
            this.fixedTHead = document.createElement('thead');
            this.fixedTheadRow = document.createElement('tr');
            this.fixedHeaderTable = document.createElement('table');
            this.colGroup = document.createElement('colgroup');
            var ref = this;
            var el = ref.el;
            var ui = ref.ui;
            ui.thead.style.visibility = 'hidden';
            // 创建一个仅包含 thead 的表格作为固定表头
            // 使用 colgroup 保持原本的表格与固定表头的单元格宽度一致
            var ref$1 = this;
            var fixedHeaderWrapper = ref$1.fixedHeaderWrapper;
            var fixedHeaderTable = ref$1.fixedHeaderTable;
            var colGroup = ref$1.colGroup;
            var fixedTHead = ref$1.fixedTHead;
            var fixedTheadRow = ref$1.fixedTheadRow;
            fixedHeaderWrapper.className = 'fixed-header';
            ui.fixedThead = fixedTHead;
            ui.fixedTheadRow = fixedTheadRow;
            fixedHeaderTable.appendChild(colGroup);
            fixedTHead.appendChild(fixedTheadRow);
            fixedHeaderTable.appendChild(fixedTHead);
            fixedHeaderWrapper.appendChild(fixedHeaderTable);
            el.appendChild(fixedHeaderWrapper);
            this.unbindEvents = [
                // 窗口大小变化后重新同步表格的宽度
                addEvent(window, 'resize', debounce(function () {
                    this$1.syncFixedHeader();
                }))
            ];
            if (!this.parent) {
                var scrollContainer = ui.scrollContainer;
                this.unbindEvents.push(
                // 表格滚动时，使用 transform 移动固定表头的位置以获得更平滑的效果
                addEvent(scrollContainer, 'scroll', function () {
                    // 使用 transform 会比同步 scrollLeft 流畅很多
                    fixedHeaderTable.style[
                    // @ts-ignore
                    getCSSProperty('transform')] = "translateX(-" + (scrollContainer.scrollLeft) + "px)";
                }));
            }
        }

        if ( Base ) anonymous.__proto__ = Base;
        anonymous.prototype = Object.create( Base && Base.prototype );
        anonymous.prototype.constructor = anonymous;
        /** 同步表头中单元格的宽度。 */
        anonymous.prototype.syncFixedHeader = function syncFixedHeader () {
            var ref = this.ui;
            var table = ref.table;
            var theadRow = ref.theadRow;
            this.colGroup.innerHTML = Array.prototype.reduce.call(theadRow.children, function (result, th) {
                // 这里不能用 clientWidth，偶尔会有 1px 的偏差
                return (result += "<col width=\"" + (th.offsetWidth) + "\">");
            }, '');
            this.fixedHeaderTable.style.width = table.offsetWidth + 'px';
            // 保证主表格的固定表头始终露出右侧的竖向滚动条
            if (!this.parent) {
                this.fixedHeaderWrapper.style.width =
                    this.ui.scrollContainer.clientWidth + 'px';
            }
            // 同步表头的高度
            this.fixedTheadRow.style.height = theadRow.offsetHeight + 'px';
        };
        /** 重载 setData 方法，在渲染完表格后同步表头的内容。 */
        anonymous.prototype.setData = function setData (data) {
            Base.prototype.setData.call(this, data);
            this.fixedTheadRow.innerHTML = this.ui.theadRow.innerHTML;
            this.syncFixedHeader();
        };
        anonymous.prototype.destroy = function destroy () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var ref = this;
            var unbindEvents = ref.unbindEvents;
            if (unbindEvents)
                { unbindEvents.forEach(function (unbind) { return unbind(); }); }
            Base.prototype.destroy.apply(this, args);
        };

        return anonymous;
    }(Base));
};

var prototype = Element.prototype;
// https://caniuse.com/#feat=matchesselector
var matches = prototype.matches ||
    prototype.webkitMatchesSelector ||
    // @ts-ignore
    prototype.mozMatchesSelector ||
    prototype.msMatchesSelector;
// https://caniuse.com/#feat=element-closest
var closest = (prototype.closest
    ? function (target, selector) {
        return target.closest(selector);
    }
    : // 使用 polyfill 方法时加个终点参数避免多余的查找
        function (target, selector, end) {
            var el = target;
            do {
                if (matches.call(el, selector))
                    { return el; }
                el = el.parentElement;
            } while (el && el !== end);
            return null;
        });

__$styleInject(".fixed-grid{position:absolute;top:0;background:#fff}.fixed-grid .scroll-container{overflow:hidden}.fixed-grid table{will-change:transform}.fixed-grid-left{left:0}.fixed-grid-right{right:0}",undefined);

var ref$1 = Array.prototype;
var some = ref$1.some;
var indexOf = ref$1.indexOf;
var fixedTable = function (Base) {
    return (function (Base) {
        function anonymous() {
            var this$1 = this;
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            Base.apply(this, args);
            var ref = this.ui;
            var scrollContainer = ref.scrollContainer;
            if (!this.parent) {
                var ref$1 = this;
                var el = ref$1.el;
                this.fixedTableEvents = [
                    // 窗口大小变化后重新同步表格的宽度
                    addEvent(window, 'resize', debounce(function () {
                        var ref = this$1;
                        var fixedTables = ref.fixedTables;
                        if (fixedTables) {
                            for (var place in fixedTables) {
                                this$1.syncFixedWidth(place);
                            }
                        }
                    })),
                    // 同步表格的滚动条位置
                    addEvent(scrollContainer, 'scroll', function () {
                        var ref = this$1;
                        var fixedTables = ref.fixedTables;
                        if (!fixedTables)
                            { return; }
                        for (var place in fixedTables) {
                            fixedTables[place].ui.table.style[
                            // @ts-ignore
                            getCSSProperty('transform')] = "translateY(-" + (scrollContainer.scrollTop) + "px)";
                        }
                    }),
                    // 同步表格的 hover 状态
                    addEvent(el, 'mouseover', function (e) {
                        var tr = closest(e.target, '.datagrid tbody tr', el);
                        if (!tr)
                            { return; }
                        var trs = tr.parentElement.children;
                        var ref = this$1;
                        var lastHoverIndex = ref.lastHoverIndex;
                        var index = indexOf.call(trs, tr);
                        if (lastHoverIndex === index)
                            { return; }
                        this$1.lastHoverIndex = index;
                        var setHover = function (grid) {
                            var trs = grid.ui.tbody.children;
                            var lastHoverTr = trs[lastHoverIndex];
                            if (lastHoverTr) {
                                lastHoverTr.classList.remove('hover-row');
                            }
                            trs[index].classList.add('hover-row');
                        };
                        setHover(this$1);
                        var ref$1 = this$1;
                        var children = ref$1.children;
                        if (children) {
                            children.forEach(setHover);
                        }
                    })
                ];
            }
        }

        if ( Base ) anonymous.__proto__ = Base;
        anonymous.prototype = Object.create( Base && Base.prototype );
        anonymous.prototype.constructor = anonymous;
        /**
         * 创建或更新固定在左侧或右侧的表格。
         * @param count 固定表格的列数。
         * @param place 固定表格的位置，默认为左侧。
         */
        anonymous.prototype.setFixed = function setFixed (count, place) {
            if ( place === void 0 ) place = 'left';

            var ref = this;
            var fixedTables = ref.fixedTables;
            var fixedTable = fixedTables && fixedTables[place];
            if (!count) {
                if (fixedTable) {
                    fixedTable.el.style.display = 'none';
                }
                return;
            }
            if (!fixedTable) {
                fixedTable = this.createFixedGrid(place);
            }
            var ref$1 = this;
            var curData = ref$1.curData;
            fixedTable.fixedColumns = count;
            this.syncFixedWidth(place);
            fixedTable.setData({
                columns: place === 'left'
                    ? curData.columns.slice(0, count)
                    : curData.columns.slice(-count),
                rows: curData.rows
            });
            fixedTable.el.style.display = '';
        };
        /**
         * 同步一个固定表格的宽度、高度等状态。
         * @param place 要同步宽度的表格的位置。
         */
        anonymous.prototype.syncFixedWidth = function syncFixedWidth (place) {
            var ref = this;
            var fixedTables = ref.fixedTables;
            var fixedTable = fixedTables && fixedTables[place];
            if (!fixedTable)
                { return; }
            var fixed = fixedTable.fixedColumns;
            // 同步 table 和 th 的宽度
            var colHtml = '';
            // let width = 0
            var ths = this.ui.theadRow.children;
            var thsLength = ths.length - 1;
            var getTh = place === 'left'
                ? function (index) { return ths[index]; }
                : function (index) { return ths[thsLength - index]; };
            some.call(ths, function (th, index) {
                if (index === fixed)
                    { return true; }
                var ref = getTh(index);
                var offsetWidth = ref.offsetWidth;
                colHtml += "<col width=\"" + offsetWidth + "\">";
                // width += offsetWidth
            });
            // 在使用默认主题（给 th 加了右 border）的情况下，
            // 给容器固定这个宽度可以让固定表格两侧的 border 不显示出来
            // fixedTable.el.style.width = `${width}px`
            fixedTable.ui.colgroup.innerHTML = colHtml;
            var ref$1 = this.ui;
            var scrollContainer = ref$1.scrollContainer;
            // 将固定表格的高度设为主表格的内容高度，这样做是为了露出主表格的横向滚动条
            fixedTable.el.style.height = scrollContainer.clientHeight + 'px';
            // 将右侧固定表格的右偏移值设为主表格的竖向滚动条的宽度以露出主表格的竖向滚动条
            if (place === 'right') {
                fixedTable.el.style.right =
                    scrollContainer.offsetWidth - scrollContainer.clientWidth + 'px';
            }
            // 目前的做法是根据表格内容平铺表格，不会导致换行，所以暂时注释掉同步高度的代码
            // 同步表头的高度
            // fixedTable.ui.theadRow.style.height = this.ui.theadRow.offsetHeight + 'px'
            // 同步 tr 的高度
            // const trs = fixedTable.ui.tbody.children
            // forEach.call(
            //   this.ui.tbody.children,
            //   (tr: HTMLTableRowElement, index: number) => {
            //     ;(trs[index] as HTMLTableRowElement).style.height =
            //       tr.offsetHeight + 'px'
            //   }
            // )
        };
        anonymous.prototype.destroy = function destroy () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var ref = this;
            var fixedTableEvents = ref.fixedTableEvents;
            if (fixedTableEvents)
                { fixedTableEvents.forEach(function (fn) { return fn(); }); }
            Base.prototype.destroy.apply(this, args);
        };
        /**
         * 创建固定在两侧的表格实例的方法。
         * @param place 表格的位置
         */
        anonymous.prototype.createFixedGrid = function createFixedGrid (place) {
            var innerTable = new this.constructor(assign({
                parent: this
            }, this.options));
            innerTable.fixedPlace = place;
            (this.children || (this.children = [])).push(innerTable);
            (this.fixedTables || (this.fixedTables = {}))[place] = innerTable;
            innerTable.el.classList.add('fixed-grid', 'fixed-grid-' + place);
            var ui = innerTable.ui;
            var colgroup = (ui.colgroup = document.createElement('colgroup'));
            ui.table.appendChild(colgroup);
            this.el.appendChild(innerTable.el);
            return innerTable;
        };

        return anonymous;
    }(Base));
};

__$styleInject(".datagrid th.sortable{cursor:pointer}.datagrid .asc,.datagrid .desc{display:none}.datagrid .sort-by-1 .asc,.datagrid .sort-by-2 .desc{display:inline-block}",undefined);

/* tslint:enable:no-unused-variable */
var orderLength = 3;
var ref$2 = Array.prototype;
var indexOf$1 = ref$2.indexOf;
function defaultSortBlock() {
    var fd = document.createDocumentFragment();
    [
        {
            className: 'asc',
            innerHTML: '&#8593;'
        },
        {
            className: 'desc',
            innerHTML: '&#8595;'
        }
    ].forEach(function (element) {
        var span = document.createElement('span');
        assign(span, element);
        fd.appendChild(span);
    });
    return fd;
}
var sort = function (Base) {
    return (function (Base) {
        function anonymous() {
            var this$1 = this;
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            Base.apply(this, args);
            this.sortOrderIndex = 0;
            var sortBlock = this.options.sortBlock || defaultSortBlock;
            var appendSortBlock = typeof sortBlock === 'string'
                ? function (th) {
                    th.innerHTML += sortBlock;
                }
                : function (th) {
                    th.appendChild(sortBlock());
                };
            this.on('after th render', function (th, column, index) {
                if (column === this$1.sortColumn && this$1.sortOrderIndex) {
                    th.classList.add('sort-by-' + this$1.sortOrderIndex);
                }
                // TODO: 后期增加只针对某些 column 开启排序的功能
                th.classList.add('sortable');
                appendSortBlock(th);
            });
            if (!this.parent) {
                var ref = this;
                var el = ref.el;
                this.clickEventHandler = addEvent(el, 'click', function (e) {
                    var th = closest(e.target, '.datagrid th', el);
                    if (!th)
                        { return; }
                    var ths = th.parentElement.children;
                    var thIndex = indexOf$1.call(ths, th);
                    // 开始计算被排序的列的索引
                    var newSortColumnIndex;
                    // 如果被点击的是右侧的固定表格，则索引号的计算方式要稍微复杂一些
                    var isRightFixed = closest(th, '.fixed-grid-right', el);
                    if (isRightFixed) {
                        newSortColumnIndex =
                            this$1.curData.columns.length -
                                (this$1.fixedTables.right.fixedColumns - thIndex);
                    }
                    else {
                        // 点击主表格本身或者左侧固定表格的索引号就是 th 元素的索引号
                        newSortColumnIndex = thIndex;
                    }
                    var sortColumn = this$1.curData.columns[newSortColumnIndex];
                    var newOrderIndex;
                    if (this$1.sortColumn !== sortColumn) {
                        newOrderIndex = 1;
                    }
                    else {
                        newOrderIndex = this$1.sortOrderIndex + 1;
                        if (newOrderIndex >= orderLength) {
                            newOrderIndex -= orderLength;
                        }
                    }
                    this$1.setSort(sortColumn, newOrderIndex);
                    this$1.emit('sort', sortColumn, newOrderIndex);
                });
            }
        }

        if ( Base ) anonymous.__proto__ = Base;
        anonymous.prototype = Object.create( Base && Base.prototype );
        anonymous.prototype.constructor = anonymous;
        anonymous.prototype.setSort = function setSort (sortColumn, newOrderIndex) {
            if ( sortColumn === void 0 ) sortColumn = null;
            if ( newOrderIndex === void 0 ) newOrderIndex = 0;

            var oldOrderIndex = this.sortOrderIndex;
            var setSort = function (grid) {
                var thRow = grid.ui.fixedTheadRow || grid.ui.theadRow;
                // 清除上一个排序指示箭头
                var oldSortClass = 'sort-by-' + oldOrderIndex;
                var lastSortTh = thRow.getElementsByClassName(oldSortClass);
                if (lastSortTh.length) {
                    lastSortTh[0].classList.remove('sort-by-' + oldOrderIndex);
                }
                // 给表格设置正确的排序状态以在重新调用 setData() 时保留排序指示箭头
                // @ts-ignore
                grid.sortOrderIndex = newOrderIndex;
                // @ts-ignore
                grid.sortColumn = sortColumn;
                // 有排序方向时才给表格设置新的指示箭头
                if (newOrderIndex) {
                    var gridThIndex = sortColumn
                        ? grid.curData.columns.indexOf(sortColumn)
                        : -1;
                    var newTh = thRow.children[gridThIndex];
                    if (newTh) {
                        newTh.classList.add('sort-by-' + newOrderIndex);
                    }
                }
            };
            setSort(this);
            var ref = this;
            var children = ref.children;
            if (children) {
                children.forEach(setSort);
            }
        };
        anonymous.prototype.destroy = function destroy () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var ref = this;
            var clickEventHandler = ref.clickEventHandler;
            if (clickEventHandler)
                { clickEventHandler(); }
            Base.prototype.destroy.apply(this, args);
        };

        return anonymous;
    }(Base));
};

var ref$3 = Array.prototype;
var indexOf$2 = ref$3.indexOf;
var selection = function (Base) {
    return (function (Base) {
        function anonymous() {
            var this$1 = this;
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            Base.apply(this, args);
            if (!this.parent) {
                var ref = this;
                var el = ref.el;
                this.ch = addEvent(el, 'click', function (e) {
                    var tr = closest(e.target, '.datagrid tbody tr', el);
                    if (!tr)
                        { return; }
                    var trs = tr.parentElement.children;
                    var trIndex = indexOf$2.call(trs, tr);
                    var selectedRow = this$1.curData.rows[trIndex];
                    if (this$1.setSelected(selectedRow)) {
                        this$1.emit('select', selectedRow);
                    }
                });
            }
        }

        if ( Base ) anonymous.__proto__ = Base;
        anonymous.prototype = Object.create( Base && Base.prototype );
        anonymous.prototype.constructor = anonymous;
        /**
         * 设置选中行。
         * @param row 当前被选中的行对象
         * @returns 如果选中的行没有变化，则返回 false，否则返回 true。
         */
        anonymous.prototype.setSelected = function setSelected (row) {
            if ( row === void 0 ) row = null;

            var oldSelectedRow = this.selectedRow;
            if (oldSelectedRow === row)
                { return false; }
            this.selectedRow = row;
            var newRowIndex = row ? this.curData.rows.indexOf(row) : -1;
            var updateSelected = function (grid) {
                var ref = grid.ui;
                var tbody = ref.tbody;
                var lastSelectedRow = tbody.getElementsByClassName('selected-row');
                if (lastSelectedRow.length) {
                    lastSelectedRow[0].classList.remove('selected-row');
                }
                var newSelectedRow = tbody.children[newRowIndex];
                if (newSelectedRow) {
                    newSelectedRow.classList.add('selected-row');
                }
            };
            updateSelected(this);
            var ref = this;
            var children = ref.children;
            if (children) {
                children.forEach(updateSelected);
            }
            return true;
        };
        anonymous.prototype.setData = function setData (data) {
            // 刷新表格前重置选中状态
            if (this.selectedRow) {
                this.selectedRow = null;
                this.emit('select', null);
            }
            Base.prototype.setData.call(this, data);
        };
        anonymous.prototype.destroy = function destroy () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            var ref = this;
            var ch = ref.ch;
            if (ch)
                { ch(); }
            Base.prototype.destroy.apply(this, args);
        };

        return anonymous;
    }(Base));
};

/* tslint:enable:no-unused-variable */
/* tslint:disable:no-duplicate-imports */
/* tslint:enable:no-duplicate-imports */
// 默认返回一个功能丰富的表格类。
// 这里的繁琐写法是为了让 TypeScript 能正确解析类型。
//
// 注意：由于同时使用了 `export` 和 `export default`，
// CommonJS 和浏览器端要使用 `default` 属性读取到这个输出。
//
// CommonJS: `const DataGrid = require('datagrid').default`
// 浏览器：`const Grid = DataGrid.default`
var DataGrid = selection(sort(fixedHeader(fixedTable(BaseGrid))));

__$styleInject(".datagrid{height:400px;border:1px solid #eee;color:#666;font-size:12px;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none}.fixed-grid{border:none}.fixed-grid-left{border-right:1px solid #eee}.fixed-grid-right{border-left:1px solid #eee}.datagrid td,.datagrid th{padding-left:15px;padding-right:15px;white-space:nowrap;overflow:hidden;max-width:150px;text-overflow:ellipsis;height:32px}.datagrid th{position:relative;border-right:1px solid #eee;background:#f8f8f8}.datagrid thead tr{border-bottom:1px solid #eee}.datagrid th:last-child{border-right:none}.datagrid td{text-align:center}.datagrid tbody tr:nth-child(2n){background:#f9f9f9}.datagrid tbody tr.hover-row{background:#f3f3f3}.datagrid tbody tr.selected-row{background:#19d4ae;color:#fff}.datagrid .asc,.datagrid .desc{position:absolute;right:0}",undefined);

var grid = new DataGrid();
grid.on('select', function (row) {
    console.log('用户选中了一行：', row);
});
var orderMap = {
    0: '无方向',
    1: '朝上',
    2: '朝下'
};
grid.on('sort', function (column, order) {
    console.log('当前排序列：', column);
    console.log('当前排序方向：', orderMap[order]);
});
// @ts-ignore
window.grid = grid;
document.body.appendChild(grid.el);
grid.setData({ rows: [], columns: [] });
setTimeout(function () {
    grid.setData({
        columns: ['测试', '一下'],
        rows: [
            {
                测试: '你好',
                一下: '世界'
            }
        ]
    });
}, 500);
// setTimeout(() => {
//   grid.setData(data)
//   grid.setFixed(3)
//   grid.setFixed(1, 'right')
// }, 1000)

}());