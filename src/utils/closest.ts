const { prototype } = Element

// https://caniuse.com/#feat=matchesselector
const matches =
  prototype.matches ||
  prototype.webkitMatchesSelector ||
  prototype.msMatchesSelector

// https://caniuse.com/#feat=element-closest
export default prototype.closest ||
  function(this: Element, s: string) {
    let el: Element | null = this
    do {
      if (matches.call(el, s)) return el
      el = el.parentElement
    } while (el)
    return null
  }
