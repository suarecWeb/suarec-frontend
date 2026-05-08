/**
 * Utilidades canónicas de precios SUAREC (frontend)
 *
 * MODELO FINANCIERO:
 *   - El proveedor define su precio NETO (lo que quiere recibir)
 *   - SUAREC cobra 12% sobre ese neto
 *   - Wompi cobra 4.82% sobre el total que paga el cliente
 *   - Orden de cobro: Wompi primero, SUAREC después
 *   - Fórmula: customer_total = (provider_net × 1.12) / (1 - 0.0482)
 *   - Precio mínimo de publicación: $50.000 COP
 */

export const SUAREC_FEE_RATE = 0.12;
export const WOMPI_FEE_RATE = 0.0482;
export const MIN_PUBLICATION_PRICE = 50_000;

export interface PricingBreakdown {
  provider_net_amount: number; // Lo que recibe el proveedor
  suarec_fee_amount: number; // Comisión SUAREC (12% del neto)
  payment_processing_fee: number; // Fee Wompi (4.82% del total cliente)
  customer_total_amount: number; // Lo que paga el cliente
}

/**
 * Función canónica de cálculo de precios.
 * Entrada: precio neto que quiere recibir el proveedor.
 * Salida: los 4 valores del modelo financiero SUAREC.
 */
export function calculatePricing(providerNetAmount: number): PricingBreakdown {
  const suarecFee = Math.round(providerNetAmount * SUAREC_FEE_RATE);
  const subtotal = providerNetAmount + suarecFee;
  const customerTotal = Math.round(subtotal / (1 - WOMPI_FEE_RATE));
  const wompiFee = customerTotal - subtotal;

  return {
    provider_net_amount: providerNetAmount,
    suarec_fee_amount: suarecFee,
    payment_processing_fee: wompiFee,
    customer_total_amount: customerTotal,
  };
}
