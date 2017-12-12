const hasOwnProperty = Object.prototype.hasOwnProperty

export function forIn(obj: any, cb: (val: any, key: string) => void) {
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) {
      cb(obj[key], key)
    }
  }
}

export default Object.assign ||
  function(target: any, ...args: any[]) {
    args.forEach(arg => {
      forIn(arg, (val, key) => {
        target[key] = val
      })
    })
  }
