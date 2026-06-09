export function formatFixed(value, digits = 1) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(digits) : "-"
}
