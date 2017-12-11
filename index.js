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

__$styleInject(".datagrid{position:relative}.datagrid .modal{display:none;-webkit-box-pack:center;-ms-flex-pack:center;justify-content:center;-webkit-box-align:center;-ms-flex-align:center;align-items:center;position:absolute;top:0;left:0;right:0;bottom:0;background-color:#fff}.datagrid.show-modal .modal{display:-webkit-box;display:-ms-flexbox;display:flex}.datagrid .scroll-container{height:100%;overflow:scroll}.datagrid table{min-width:100%;border-collapse:collapse;border-spacing:0}.datagrid td{word-wrap:break-word;word-break:break-all}",undefined);

/**
 * @fileOverview 输出一个最基本的、仅包含核心功能的表格类。
 */
function defaultThRenderer(column) {
    return column.key;
}
function defaultTdRenderer(column, row) {
    return row[column.key];
}
/**
 * 根据内容的类型选择不同的方式填充节点。
 * @param node 需要填充的节点。
 * @param content 内容可以是字符串或者一个节点。如果有多个节点，可以传入一个 Fragment 对象。
 */
function fillNode(node, content) {
    if (typeof content === 'string') {
        node.innerHTML = content;
    }
    else {
        node.appendChild(content);
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
        /* protected */ this.ui = {};
        this.options = Object.assign({
            td: defaultTdRenderer,
            th: defaultThRenderer
        }, options);
        this.parent = options && options.parent;
        var ref = this;
        var el = ref.el;
        el.className = 'datagrid';
        el.innerHTML = template;
        var thead = el.getElementsByTagName('thead')[0];
        Object.assign(this.ui, {
            scrollContainer: el.getElementsByClassName('scroll-container')[0],
            table: el.getElementsByTagName('table')[0],
            thead: thead,
            theadRow: thead.firstElementChild,
            tbody: el.getElementsByTagName('tbody')[0],
            modal: el.getElementsByClassName('modal-content')[0]
        });
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
            columns: columns,
            rows: rows
        };
        var ref = this.ui;
        var theadRow = ref.theadRow;
        var tbody = ref.tbody;
        // 首先重新渲染表头
        if (columns.length) {
            columns.forEach(function (column, index) {
                if (typeof column === 'string') {
                    column = {
                        key: column
                    };
                }
                var th = document.createElement('th');
                fillNode(th, this$1.options.th(column, index));
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
                            key: column
                        };
                    }
                    var td = document.createElement('td');
                    fillNode(td, this$1.options.td(column, row, columnIndex, rowIndex));
                    this$1.emit('after td render', td, column, row, rowIndex, columnIndex);
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

// https://caniuse.com/#feat=requestanimationframe
var raf = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    // @ts-ignore
    window.mozRequestAnimationFrame ||
    function (cb) {
        setTimeout(cb, 1000 / 60);
    };
/**
 * 返回一个基于 requestAnimationFrame 的节流函数。
 * @param cb 要执行的函数
 * @see https://css-tricks.com/debouncing-throttling-explained-examples/#article-header-id-7
 */
var rafThrottle = function (cb) {
    var running = false;
    return function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        if (!running) {
            running = true;
            raf(function () {
                cb.apply(null, args);
                running = false;
            });
        }
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

__$styleInject(".datagrid .fixed-header{position:absolute;top:0;left:0;right:0;background-color:#fff;overflow:hidden}",undefined);

var fixedHeader = function (Base) {
    return (function (Base) {
        function anonymous() {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            Base.apply(this, args);
            this.fixedTHead = document.createElement('thead');
            this.fixedTheadRow = document.createElement('tr');
            this.fixedHeaderTable = document.createElement('table');
            this.colGroup = document.createElement('colgroup');
            this.unbindEvents = [];
            var ref = this;
            var el = ref.el;
            var ui = ref.ui;
            ui.thead.style.visibility = 'hidden';
            // 创建一个包含表头的 div，通过 CSS 固定在滚动区域上方
            var fixedHeaderWrapper = document.createElement('div');
            fixedHeaderWrapper.className = 'fixed-header';
            // 创建一个仅包含 thead 的表格作为固定表头
            // 使用 colgroup 保持原本的表格与固定表头的单元格宽度一致
            var ref$1 = this;
            var fixedHeaderTable = ref$1.fixedHeaderTable;
            var colGroup = ref$1.colGroup;
            var fixedTHead = ref$1.fixedTHead;
            var fixedTheadRow = ref$1.fixedTheadRow;
            ui.fixedThead = fixedTHead;
            ui.fixedTheadRow = fixedTheadRow;
            fixedHeaderTable.appendChild(colGroup);
            fixedTHead.appendChild(fixedTheadRow);
            fixedHeaderTable.appendChild(fixedTHead);
            fixedHeaderWrapper.appendChild(fixedHeaderTable);
            el.appendChild(fixedHeaderWrapper);
            if (!this.parent) {
                var scrollContainer = ui.scrollContainer;
                this.unbindEvents.push(
                // 窗口大小变化后重新同步表格的宽度
                // TODO: 窗口大小变化后表格的宽度似乎没有变化？
                // addEvent(
                //   window,
                //   'resize',
                //   rafThrottle(() => {
                //     this.syncFixedHeader()
                //   })
                // ),
                // 表格滚动时，使用 transform 移动固定表头的位置以获得更平滑的效果
                addEvent(scrollContainer, 'scroll', rafThrottle(function () {
                    // 使用 transform 会比同步 scrollLeft 流畅很多
                    fixedHeaderTable.style[
                    // @ts-ignore
                    getCSSProperty('transform')] = "translate3d(-" + (scrollContainer.scrollLeft) + "px,0,0)";
                })));
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
                return (result += "<col width=\"" + (th.offsetWidth) + "\">");
            }, '');
            this.fixedHeaderTable.style.width = table.offsetWidth + 'px';
            // 同步表头的高度
            this.fixedTheadRow.style.height = theadRow.offsetHeight + 'px';
        };
        /** 重载 setData 方法，在渲染完表格后同步表头的内容。 */
        anonymous.prototype.setData = function setData (data) {
            var this$1 = this;

            Base.prototype.setData.call(this, data);
            this.fixedTheadRow.innerHTML = this.ui.theadRow.innerHTML;
            // 需要等到 fixedTable 中的 syncFixedWidth 更新完之后再同步宽度，
            // 不然会出现 header 宽度不一致的问题
            raf(function () {
                this$1.syncFixedHeader();
            });
        };
        anonymous.prototype.destroy = function destroy () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            this.unbindEvents.forEach(function (unbind) { return unbind(); });
            Base.prototype.destroy.apply(this, args);
        };

        return anonymous;
    }(Base));
};

var prototype = Element.prototype;
// https://caniuse.com/#feat=matchesselector
var matches = prototype.matches ||
    prototype.webkitMatchesSelector ||
    prototype.msMatchesSelector;
// https://caniuse.com/#feat=element-closest
var closest = prototype.closest ||
    function (s) {
        var el = this;
        do {
            if (matches.call(el, s))
                { return el; }
            el = el.parentElement;
        } while (el);
        return null;
    };

__$styleInject(".fixed-grid{position:absolute;top:0;background:#fff}.fixed-grid .scroll-container{overflow:hidden}.fixed-grid-left{left:0}.fixed-grid-right{right:0}",undefined);

var ref$1 = Array.prototype;
var some = ref$1.some;
var forEach = ref$1.forEach;
var indexOf = ref$1.indexOf;
var fixedTable = function (Base) {
    return (function (Base) {
        function anonymous() {
            var this$1 = this;
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            Base.apply(this, args);
            this.fixedTableEvents = [];
            var ref = this.ui;
            var scrollContainer = ref.scrollContainer;
            if (!this.parent) {
                this.fixedTableEvents.push(
                // 同步表格的滚动条位置
                addEvent(scrollContainer, 'scroll', rafThrottle(function () {
                    var ref = this$1;
                    var fixedTables = ref.fixedTables;
                    if (!fixedTables)
                        { return; }
                    for (var place in fixedTables) {
                        fixedTables[place].ui.table.style[
                        // @ts-ignore
                        getCSSProperty('transform')] = "translate3d(0,-" + (scrollContainer.scrollTop) + "px,0)";
                    }
                })), 
                // 同步表格的 hover 状态
                addEvent(this.el, 'mouseover', function (e) {
                    var tr = closest.call(e.target, '.datagrid tbody tr');
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
                }));
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
            fixedTable.setData({
                columns: place === 'left'
                    ? curData.columns.slice(0, count)
                    : curData.columns.slice(-count),
                rows: curData.rows
            });
            fixedTable.el.style.display = '';
            this.syncFixedWidth(place);
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
            // 同步表头的高度
            fixedTable.ui.theadRow.style.height = this.ui.theadRow.offsetHeight + 'px';
            // 同步 tr 的高度
            var trs = fixedTable.ui.tbody.children;
            forEach.call(this.ui.tbody.children, function (tr, index) {
                
                trs[index].style.height =
                    tr.offsetHeight + 'px';
            });
        };
        /**
         * 创建固定在两侧的表格实例的方法。
         * @param place 表格的位置
         */
        anonymous.prototype.createFixedGrid = function createFixedGrid (place) {
            var innerTable = new this.constructor(Object.assign({
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
// const DESC = -1, // 降序
//   ASC = 1, // 升序
//   NONE = 0 // 不排序
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
        Object.assign(span, element);
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
                if (index === this$1.sortColumnIndex && this$1.sortOrderIndex) {
                    th.classList.add('sort-by-' + this$1.sortOrderIndex);
                }
                // TODO: 后期增加只针对某些 column 开启排序的功能
                th.classList.add('sortable');
                appendSortBlock(th);
            });
            if (!this.parent) {
                addEvent(this.el, 'click', function (e) {
                    var th = closest.call(e.target, '.datagrid th');
                    if (!th)
                        { return; }
                    var ths = th.parentElement.children;
                    var thIndex = indexOf$1.call(ths, th);
                    var newSortColumnIndex;
                    var isRightFixed = closest.call(th, '.fixed-grid-right');
                    if (isRightFixed) {
                        newSortColumnIndex =
                            this$1.curData.columns.length -
                                (this$1.fixedTables.right.fixedColumns - thIndex);
                    }
                    else {
                        newSortColumnIndex = thIndex;
                    }
                    var newOrderIndex;
                    var oldOrderIndex = this$1.sortOrderIndex;
                    var oldSortColumnIndex = this$1.sortColumnIndex;
                    if (oldSortColumnIndex !== newSortColumnIndex) {
                        this$1.sortColumnIndex = newSortColumnIndex;
                        newOrderIndex = 1;
                    }
                    else {
                        newOrderIndex = this$1.sortOrderIndex + 1;
                        if (newOrderIndex >= orderLength) {
                            newOrderIndex -= orderLength;
                        }
                    }
                    this$1.sortOrderIndex = newOrderIndex;
                    var setSort = function (grid) {
                        var columnIndex2trIndex = function (columnIndex) {
                            return grid.fixedPlace === 'right'
                                ? grid.fixedColumns -
                                    (this$1.curData.columns.length - columnIndex)
                                : columnIndex;
                        };
                        var ths = (grid.ui.fixedTheadRow || grid.ui.theadRow).children;
                        if (oldOrderIndex) {
                            var oldTh = ths[columnIndex2trIndex(oldSortColumnIndex)];
                            if (oldTh) {
                                oldTh.classList.remove('sort-by-' + oldOrderIndex);
                            }
                        }
                        if (newOrderIndex) {
                            var newTh = ths[columnIndex2trIndex(newSortColumnIndex)];
                            console.log(grid.fixedPlace === 'right'
                                ? grid.fixedColumns -
                                    (this$1.curData.columns.length - newSortColumnIndex)
                                : newSortColumnIndex);
                            if (newTh) {
                                newTh.classList.add('sort-by-' + newOrderIndex);
                            }
                        }
                    };
                    setSort(this$1);
                    var ref = this$1;
                    var children = ref.children;
                    if (children) {
                        children.forEach(setSort);
                    }
                    this$1.emit('sort', thIndex, newOrderIndex);
                });
            }
        }

        if ( Base ) anonymous.__proto__ = Base;
        anonymous.prototype = Object.create( Base && Base.prototype );
        anonymous.prototype.constructor = anonymous;

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
                addEvent(this.el, 'click', function (e) {
                    var tr = closest.call(e.target, '.datagrid tbody tr');
                    if (!tr)
                        { return; }
                    var trs = tr.parentElement.children;
                    var trIndex = indexOf$2.call(trs, tr);
                    var oldSelectionIndex = this$1.selectionIndex;
                    if (oldSelectionIndex !== trIndex) {
                        this$1.selectionIndex = trIndex;
                        this$1.emit('select', trIndex);
                        var updateSelected = function (grid) {
                            var ref = grid.ui.tbody;
                            var children = ref.children;
                            var lastSelectedRow = children[oldSelectionIndex];
                            if (lastSelectedRow) {
                                lastSelectedRow.classList.remove('selected-row');
                            }
                            children[trIndex].classList.add('selected-row');
                        };
                        updateSelected(this$1);
                        var ref = this$1;
                        var children = ref.children;
                        if (children) {
                            children.forEach(updateSelected);
                        }
                    }
                });
            }
        }

        if ( Base ) anonymous.__proto__ = Base;
        anonymous.prototype = Object.create( Base && Base.prototype );
        anonymous.prototype.constructor = anonymous;

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

var data = {
    columns: [
        '日期',
        '总计',
        '催单(用户)',
        '退单(用户)',
        '订单变更(用户)',
        '钱款问题(用户)',
        '订单投诉(用户)',
        '软件、账户、会员卡(用户)',
        '账户与资金(商家)',
        '手淘及支付宝店铺(商家)',
        '物流配送(商家)',
        '商家客户端(商家)',
        '开店与合作(商家)',
        '订单查询(商家)',
        '加入蜂鸟(蜂鸟)',
        '账户管理(蜂鸟)',
        '骑手申诉(蜂鸟)',
        '投诉及撤销(蜂鸟)',
        '其他咨询(蜂鸟)'
    ],
    rows: [
        {
            日期: '总计',
            总计: '289,235',
            '催单(用户)': '39,047',
            '退单(用户)': '21,112',
            '订单变更(用户)': '2,444',
            '钱款问题(用户)': '24,016',
            '订单投诉(用户)': '51,501',
            '软件、账户、会员卡(用户)': 'longlonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglonglong',
            '账户与资金(商家)': '23,791',
            '手淘及支付宝店铺(商家)': '7,062',
            '物流配送(商家)': '11,338',
            '商家客户端(商家)': '23,856',
            '开店与合作(商家)': '11,486',
            '订单查询(商家)': '8,521',
            '加入蜂鸟(蜂鸟)': '3,219',
            '账户管理(蜂鸟)': '6,384',
            '骑手申诉(蜂鸟)': '11,876',
            '投诉及撤销(蜂鸟)': '2',
            '其他咨询(蜂鸟)': '29,581'
        },
        {
            日期: '占比',
            总计: '100.00%',
            '催单(用户)': '13.50%',
            '退单(用户)': '7.30%',
            '订单变更(用户)': '0.84%',
            '钱款问题(用户)': '8.30%',
            '订单投诉(用户)': '17.81%',
            '软件、账户、会员卡(用户)': '4.84%',
            '账户与资金(商家)': '8.23%',
            '手淘及支付宝店铺(商家)': '2.44%',
            '物流配送(商家)': '3.92%',
            '商家客户端(商家)': '8.25%',
            '开店与合作(商家)': '3.97%',
            '订单查询(商家)': '2.95%',
            '加入蜂鸟(蜂鸟)': '1.11%',
            '账户管理(蜂鸟)': '2.21%',
            '骑手申诉(蜂鸟)': '4.11%',
            '投诉及撤销(蜂鸟)': '0.00%',
            '其他咨询(蜂鸟)': '10.23%'
        },
        {
            日期: '2016-08-08',
            总计: '20,927',
            '催单(用户)': '2,440',
            '退单(用户)': '1,304',
            '订单变更(用户)': '197',
            '钱款问题(用户)': '1,961',
            '订单投诉(用户)': '3,398',
            '软件、账户、会员卡(用户)': '913',
            '账户与资金(商家)': '1,418',
            '手淘及支付宝店铺(商家)': '459',
            '物流配送(商家)': '746',
            '商家客户端(商家)': '1,462',
            '开店与合作(商家)': '807',
            '订单查询(商家)': '656',
            '加入蜂鸟(蜂鸟)': '265',
            '账户管理(蜂鸟)': '1,098',
            '骑手申诉(蜂鸟)': '1,071',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '2,732'
        },
        {
            日期: '2016-08-09',
            总计: '20,076',
            '催单(用户)': '3,542',
            '退单(用户)': '2,130',
            '订单变更(用户)': '189',
            '钱款问题(用户)': '1,526',
            '订单投诉(用户)': '4,535',
            '软件、账户、会员卡(用户)': '796',
            '账户与资金(商家)': '966',
            '手淘及支付宝店铺(商家)': '412',
            '物流配送(商家)': '647',
            '商家客户端(商家)': '958',
            '开店与合作(商家)': '634',
            '订单查询(商家)': '524',
            '加入蜂鸟(蜂鸟)': '193',
            '账户管理(蜂鸟)': '457',
            '骑手申诉(蜂鸟)': '846',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '1,721'
        },
        {
            日期: '2016-08-10',
            总计: '23,161',
            '催单(用户)': '3,059',
            '退单(用户)': '1,734',
            '订单变更(用户)': '182',
            '钱款问题(用户)': '1,849',
            '订单投诉(用户)': '4,289',
            '软件、账户、会员卡(用户)': '1,137',
            '账户与资金(商家)': '1,910',
            '手淘及支付宝店铺(商家)': '519',
            '物流配送(商家)': '883',
            '商家客户端(商家)': '1,930',
            '开店与合作(商家)': '874',
            '订单查询(商家)': '615',
            '加入蜂鸟(蜂鸟)': '299',
            '账户管理(蜂鸟)': '477',
            '骑手申诉(蜂鸟)': '995',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '2,409'
        },
        {
            日期: '2016-08-11',
            总计: '22,103',
            '催单(用户)': '2,904',
            '退单(用户)': '1,588',
            '订单变更(用户)': '182',
            '钱款问题(用户)': '1,941',
            '订单投诉(用户)': '3,962',
            '软件、账户、会员卡(用户)': '1,070',
            '账户与资金(商家)': '1,734',
            '手淘及支付宝店铺(商家)': '470',
            '物流配送(商家)': '806',
            '商家客户端(商家)': '1,800',
            '开店与合作(商家)': '886',
            '订单查询(商家)': '643',
            '加入蜂鸟(蜂鸟)': '257',
            '账户管理(蜂鸟)': '514',
            '骑手申诉(蜂鸟)': '929',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '2,417'
        },
        {
            日期: '2016-08-12',
            总计: '22,491',
            '催单(用户)': '3,451',
            '退单(用户)': '1,931',
            '订单变更(用户)': '177',
            '钱款问题(用户)': '1,556',
            '订单投诉(用户)': '3,925',
            '软件、账户、会员卡(用户)': '1,009',
            '账户与资金(商家)': '1,728',
            '手淘及支付宝店铺(商家)': '453',
            '物流配送(商家)': '932',
            '商家客户端(商家)': '1,796',
            '开店与合作(商家)': '907',
            '订单查询(商家)': '698',
            '加入蜂鸟(蜂鸟)': '227',
            '账户管理(蜂鸟)': '425',
            '骑手申诉(蜂鸟)': '953',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '2,323'
        },
        {
            日期: '2016-08-13',
            总计: '20,882',
            '催单(用户)': '2,362',
            '退单(用户)': '1,307',
            '订单变更(用户)': '176',
            '钱款问题(用户)': '1,741',
            '订单投诉(用户)': '3,647',
            '软件、账户、会员卡(用户)': '1,238',
            '账户与资金(商家)': '2,189',
            '手淘及支付宝店铺(商家)': '450',
            '物流配送(商家)': '920',
            '商家客户端(商家)': '1,850',
            '开店与合作(商家)': '738',
            '订单查询(商家)': '727',
            '加入蜂鸟(蜂鸟)': '216',
            '账户管理(蜂鸟)': '388',
            '骑手申诉(蜂鸟)': '794',
            '投诉及撤销(蜂鸟)': '1',
            '其他咨询(蜂鸟)': '2,138'
        },
        {
            日期: '2016-08-14',
            总计: '18,677',
            '催单(用户)': '2,270',
            '退单(用户)': '1,168',
            '订单变更(用户)': '163',
            '钱款问题(用户)': '1,708',
            '订单投诉(用户)': '3,456',
            '软件、账户、会员卡(用户)': '1,188',
            '账户与资金(商家)': '1,292',
            '手淘及支付宝店铺(商家)': '330',
            '物流配送(商家)': '823',
            '商家客户端(商家)': '1,465',
            '开店与合作(商家)': '610',
            '订单查询(商家)': '626',
            '加入蜂鸟(蜂鸟)': '252',
            '账户管理(蜂鸟)': '430',
            '骑手申诉(蜂鸟)': '740',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '2,156'
        },
        {
            日期: '2016-08-15',
            总计: '20,384',
            '催单(用户)': '2,524',
            '退单(用户)': '1,338',
            '订单变更(用户)': '144',
            '钱款问题(用户)': '1,916',
            '订单投诉(用户)': '3,579',
            '软件、账户、会员卡(用户)': '1,016',
            '账户与资金(商家)': '1,733',
            '手淘及支付宝店铺(商家)': '494',
            '物流配送(商家)': '732',
            '商家客户端(商家)': '1,718',
            '开店与合作(商家)': '876',
            '订单查询(商家)': '609',
            '加入蜂鸟(蜂鸟)': '280',
            '账户管理(蜂鸟)': '499',
            '骑手申诉(蜂鸟)': '833',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '2,093'
        },
        {
            日期: '2016-08-16',
            总计: '21,628',
            '催单(用户)': '2,776',
            '退单(用户)': '1,451',
            '订单变更(用户)': '191',
            '钱款问题(用户)': '2,209',
            '订单投诉(用户)': '3,826',
            '软件、账户、会员卡(用户)': '909',
            '账户与资金(商家)': '1,830',
            '手淘及支付宝店铺(商家)': '990',
            '物流配送(商家)': '769',
            '商家客户端(商家)': '1,847',
            '开店与合作(商家)': '913',
            '订单查询(商家)': '566',
            '加入蜂鸟(蜂鸟)': '210',
            '账户管理(蜂鸟)': '309',
            '骑手申诉(蜂鸟)': '918',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '1,914'
        },
        {
            日期: '2016-08-17',
            总计: '20,350',
            '催单(用户)': '2,870',
            '退单(用户)': '1,398',
            '订单变更(用户)': '158',
            '钱款问题(用户)': '1,583',
            '订单投诉(用户)': '3,458',
            '软件、账户、会员卡(用户)': '961',
            '账户与资金(商家)': '1,851',
            '手淘及支付宝店铺(商家)': '559',
            '物流配送(商家)': '761',
            '商家客户端(商家)': '1,875',
            '开店与合作(商家)': '987',
            '订单查询(商家)': '637',
            '加入蜂鸟(蜂鸟)': '202',
            '账户管理(蜂鸟)': '360',
            '骑手申诉(蜂鸟)': '816',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '1,874'
        },
        {
            日期: '2016-08-18',
            总计: '22,437',
            '催单(用户)': '3,721',
            '退单(用户)': '2,053',
            '订单变更(用户)': '175',
            '钱款问题(用户)': '1,404',
            '订单投诉(用户)': '4,041',
            '软件、账户、会员卡(用户)': '885',
            '账户与资金(商家)': '1,815',
            '手淘及支付宝店铺(商家)': '496',
            '物流配送(商家)': '959',
            '商家客户端(商家)': '1,886',
            '开店与合作(商家)': '907',
            '订单查询(商家)': '598',
            '加入蜂鸟(蜂鸟)': '196',
            '账户管理(蜂鸟)': '431',
            '骑手申诉(蜂鸟)': '829',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '2,041'
        },
        {
            日期: '2016-08-19',
            总计: '20,058',
            '催单(用户)': '2,756',
            '退单(用户)': '1,346',
            '订单变更(用户)': '175',
            '钱款问题(用户)': '1,577',
            '订单投诉(用户)': '3,132',
            '软件、账户、会员卡(用户)': '867',
            '账户与资金(商家)': '1,875',
            '手淘及支付宝店铺(商家)': '519',
            '物流配送(商家)': '788',
            '商家客户端(商家)': '1,939',
            '开店与合作(商家)': '903',
            '订单查询(商家)': '556',
            '加入蜂鸟(蜂鸟)': '230',
            '账户管理(蜂鸟)': '369',
            '骑手申诉(蜂鸟)': '829',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '2,197'
        },
        {
            日期: '2016-08-20',
            总计: '19,138',
            '催单(用户)': '2,271',
            '退单(用户)': '1,184',
            '订单变更(用户)': '170',
            '钱款问题(用户)': '1,556',
            '订单投诉(用户)': '3,264',
            '软件、账户、会员卡(用户)': '1,042',
            '账户与资金(商家)': '1,930',
            '手淘及支付宝店铺(商家)': '503',
            '物流配送(商家)': '793',
            '商家客户端(商家)': '1,802',
            '开店与合作(商家)': '752',
            '订单查询(商家)': '555',
            '加入蜂鸟(蜂鸟)': '201',
            '账户管理(蜂鸟)': '345',
            '骑手申诉(蜂鸟)': '761',
            '投诉及撤销(蜂鸟)': '0',
            '其他咨询(蜂鸟)': '2,009'
        },
        {
            日期: '2016-08-21',
            总计: '16,923',
            '催单(用户)': '2,101',
            '退单(用户)': '1,180',
            '订单变更(用户)': '165',
            '钱款问题(用户)': '1,489',
            '订单投诉(用户)': '2,989',
            '软件、账户、会员卡(用户)': '968',
            '账户与资金(商家)': '1,520',
            '手淘及支付宝店铺(商家)': '408',
            '物流配送(商家)': '779',
            '商家客户端(商家)': '1,528',
            '开店与合作(商家)': '692',
            '订单查询(商家)': '511',
            '加入蜂鸟(蜂鸟)': '191',
            '账户管理(蜂鸟)': '282',
            '骑手申诉(蜂鸟)': '562',
            '投诉及撤销(蜂鸟)': '1',
            '其他咨询(蜂鸟)': '1,557'
        }
    ]
};

__$styleInject(".datagrid{height:400px;border:1px solid #eee;color:#666;font-size:12px}.fixed-grid{border:none}.fixed-grid-left{border-right:1px solid #eee}.fixed-grid-right{border-left:1px solid #eee}.datagrid td,.datagrid th{padding:8px 15px;white-space:nowrap}.datagrid th{position:relative;border-right:1px solid #eee;border-bottom:1px solid #eee;background:#f8f8f8}.datagrid th:last-child{border-right:none}.datagrid td{text-align:center}.datagrid tbody tr:nth-child(2n){background:#f9f9f9}.datagrid tbody tr.hover-row{background:#f3f3f3}.datagrid tbody tr.selected-row{background:#19d4ae;color:#fff}.datagrid .asc,.datagrid .desc{position:absolute;right:0}",undefined);

var grid = new DataGrid();
document.body.appendChild(grid.el);
grid.setData({ rows: [], columns: [] });
setTimeout(function () {
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
setTimeout(function () {
    grid.setData(data);
    grid.setFixed(3);
    grid.setFixed(1, 'right');
}, 4000);

}());
