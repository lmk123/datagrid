export default function(func: Function, wait = 250) {
  let timeout: number
  return function(this: any, ...args: any[]) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}
