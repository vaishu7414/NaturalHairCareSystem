export function formatRupees(value) {
  return `₹${Number(value || 0).toFixed(2)}`
}
