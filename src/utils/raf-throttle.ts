export const raf =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  // @ts-ignore
  window.mozRequestAnimationFrame ||
  function(cb) {
    setTimeout(cb, 1000 / 60)
  }

/**
 * 返回一个基于 requestAnimationFrame 的节流函数。
 * @param cb 要执行的函数
 * @see https://css-tricks.com/debouncing-throttling-explained-examples/#article-header-id-7
 */
export default function<T>(cb: (...args: T[]) => any) {
  let running = false
  return function(...args: T[]) {
    if (!running) {
      running = true
      raf(() => {
        cb.apply(null, args)
        running = false
      })
    }
  }
}
