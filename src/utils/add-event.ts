/**
 * 在事件目标上注册一个事件，并返回取消事件的函数。
 * @param target 事件目标
 * @param event 事件名称
 * @param handler 事件处理函数
 */
export default function<T extends EventTarget>(
  target: T,
  event: string,
  handler: EventListenerOrEventListenerObject
) {
  target.addEventListener(event, handler)
  return () => {
    target.removeEventListener(event, handler)
  }
}
