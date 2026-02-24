export const formatBRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export function formatBRLCompact(value: number | string) {
  const numberValue = typeof value === 'string' ? parseFloat(value) : value;

  if (numberValue < 1000) {
    return `R$ ${numberValue.toFixed(0)}`; 
  }

  return (
    'R$ ' +
    new Intl.NumberFormat('en-US', {
      style: 'decimal',
      notation: 'compact',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
      .format(numberValue)
      .replace('K', ' mil')
      .replace('M', ' mi')
      .replace('B', ' bi')
  );
}