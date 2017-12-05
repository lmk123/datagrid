import memory from './memory'

export type CSSProperty = keyof CSSStyleDeclaration

const { style } = document.createElement('div')

type Vendor = 'webkit' | 'ms' | 'moz' | 'o'
let vendors: Vendor[] = ['webkit', 'ms', 'moz', 'o']
let vd: Vendor

export default memory((property: CSSProperty) => {
  if (property in style) return property
  const camelCase = property[0].toUpperCase() + property.slice(1)

  function getVendorProperty(vendor: Vendor) {
    const vendorProperty = (vendor + camelCase) as CSSProperty
    if (vendorProperty in style) {
      return vendorProperty
    }
  }

  if (vd) {
    return getVendorProperty(vd)
  }

  let result: CSSProperty | undefined
  vendors.some(vendor => {
    const property = getVendorProperty(vendor)
    if (property) {
      result = property
      vd = vendor
      //@ts-ignore 释放内存
      vendors = null
      return true
    }
    return false
  })
  return result
})
