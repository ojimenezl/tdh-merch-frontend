// Formato de moneda (USD, moneda de Ecuador).
const formateadorUSD = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
})

export function formatearPrecio(valor: number): string {
  return formateadorUSD.format(valor)
}

// Formato de fecha legible en español.
export function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}
