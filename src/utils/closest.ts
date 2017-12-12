const { prototype } = Element

// https://caniuse.com/#feat=matchesselector
const matches =
  prototype.matches ||
  prototype.webkitMatchesSelector ||
  // @ts-ignore
  prototype.mozMatchesSelector ||
  prototype.msMatchesSelector

export interface ClosestFn {
  (target: Element, selector: string, end: Element): HTMLElement | null
}

// https://caniuse.com/#feat=element-closest
export default (prototype.closest
  ? function(target, selector) {
      return target.closest(selector)
    }
  : // 使用 polyfill 方法时加个终点参数避免多余的查找
    function(target, selector, end) {
      let el: Element | null = target
      do {
        if (matches.call(el, selector)) return el
        el = el.parentElement
      } while (el && el !== end)
      return null
    }) as ClosestFn
