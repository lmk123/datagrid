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
