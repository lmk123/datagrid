export function insertStyle(css: string) {
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
}
