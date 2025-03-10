
/**
 * Generates a payment link for a pool
 * @param poolId The ID of the pool
 * @param baseUrl The base URL of the application, defaults to window.location.origin
 * @returns The complete payment URL
 */
export const generatePaymentLink = (
  poolId: string = "demo",
  baseUrl: string = window.location.origin
): string => {
  return `${baseUrl}/pay/${poolId}`;
};

/**
 * Generates a collector link for a pool
 * @param poolId The ID of the pool
 * @param amount Optional amount to include in URL parameters
 * @param baseUrl The base URL of the application, defaults to window.location.origin
 * @returns The complete collector URL
 */
export const generateCollectorLink = (
  poolId: string = "demo",
  amount?: number,
  baseUrl: string = window.location.origin
): string => {
  const url = `${baseUrl}/collect/${poolId}`;
  return amount ? `${url}?amount=${amount}` : url;
};
