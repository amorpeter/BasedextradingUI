/**
 * Safe number formatting - prevents "Cannot read properties of null (reading 'toFixed')".
 * Use these helpers anywhere a value might be null/undefined from API or state.
 */

/**
 * @param {number|null|undefined} value
 * @param {number} digits
 * @returns {string}
 */
export const toFixedSafe = (value, digits = 2) => {
  const num = Number(value)
  if (value == null || value === '' || Number.isNaN(num)) return (0).toFixed(digits)
  return num.toFixed(digits)
}

/**
 * Format price with appropriate decimals (no null/undefined crash).
 */
export const formatPriceSafe = (price) => {
  const num = Number(price)
  if (price == null || price === '' || Number.isNaN(num)) return '0.00'
  if (num === 0) return '0.00'
  if (num < 0.01) return num.toFixed(6)
  if (num < 1) return num.toFixed(4)
  return num.toFixed(2)
}

/**
 * Format percentage (no null/undefined crash). Returns string e.g. "+1.25%" or "-0.50%".
 */
export const formatPercentSafe = (value) => {
  const num = Number(value)
  if (value == null || value === '' || Number.isNaN(num)) return '0.00%'
  const sign = num >= 0 ? '+' : ''
  return `${sign}${num.toFixed(2)}%`
}
