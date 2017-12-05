/** 默认情况下使用 join 将参数转换成一个字符串作为唯一的缓存键 */
function generate(args: any[]) {
  return args.join()
}

interface FnCaches {
  [cacheKey: string]: any
}

/**
 * 返回一个能记住函数返回值的函数，避免重复计算
 * @param fn 执行计算的函数
 * @param generateKey 根据函数参数计算唯一的缓存键的函数
 */
export default function<T, U>(
  fn: ((...args: T[]) => U),
  generateKey = generate
) {
  const caches: FnCaches = {}
  return function(...args: T[]): U {
    const cacheKey = generateKey(args)
    return caches[cacheKey] || (caches[cacheKey] = fn.apply(null, args))
  }
}
