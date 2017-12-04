const raf =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  // @ts-ignore
  window.mozRequestAnimationFrame ||
  function(cb) {
    setTimeout(cb, 1000 / 60)
  }

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
