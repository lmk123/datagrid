import memory from './memory'

const { style } = document.createElement('div')

const vendors = ['webkit', 'ms', 'moz', 'o']

export default memory((property: string) => {
  if (property in style) return property
  const camelCase = property[0].toUpperCase() + property.slice(1)
  let result: string | undefined
  vendors.some(vendor => {
    const vendorProperty = vendor + camelCase
    if (vendorProperty in style) {
      result = vendorProperty
      return true
    }
    return false
  })
  return result
})
