type FormatQtyInput = {
  value: number
  decimals?: number
}

export const formatQty = ({ value, decimals = 5 }: FormatQtyInput): string =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false
  })
