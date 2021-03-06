import memory from './memory'

export type CSSProperty = keyof CSSStyleDeclaration

const { style } = document.createElement('div')

type Vendor = 'webkit' | 'ms' | 'moz' | 'o'
let vd: Vendor

/**
 * 获取一个 CSS 属性在当前浏览器中可用的名字。
 * @param property 属性的标准名称。
 */
export default memory((property: CSSProperty) => {
  if (property in style) return property
  const camelCase = property[0].toUpperCase() + property.slice(1)

  const getVendorProperty = (vendor: Vendor) => {
    const vendorProperty = (vendor + camelCase) as CSSProperty
    if (vendorProperty in style) {
      return vendorProperty
    }
  }

  if (vd) {
    return getVendorProperty(vd)
  }

  let result: CSSProperty | undefined
  ;(['webkit', 'ms', 'moz', 'o'] as Vendor[]).some(vendor => {
    const vendorProperty = getVendorProperty(vendor)
    if (vendorProperty) {
      result = vendorProperty
      vd = vendor
      return true
    }
    return false
  })
  return result
})
