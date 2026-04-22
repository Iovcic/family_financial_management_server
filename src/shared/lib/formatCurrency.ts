export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('ro-MD', {
    style: 'currency',
    currency: 'MDL',
    minimumFractionDigits: 2,
  }).format(num)
}
