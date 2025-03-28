
/**
 * Generates a payment link for a contributor
 * @param poolId The ID of the pool
 * @param contributorName Optional name of the contributor to include in URL parameters
 * @param baseUrl The base URL of the application, defaults to window.location.origin
 * @returns The complete payment URL
 */
export const generatePaymentLink = (
  poolId: string = "demo",
  contributorName?: string,
  baseUrl: string = window.location.origin
): string => {
  const url = `${baseUrl}/app/pay/${poolId}`;
  return contributorName ? `${url}?name=${encodeURIComponent(contributorName)}` : url;
};

/**
 * Generates a test collector link for a business
 * @param amount The amount to be collected
 * @param baseUrl The base URL of the application, defaults to window.location.origin
 * @returns The complete collector URL with a randomly generated ID
 */
export const generateTestCollectorLink = (
  amount: number,
  baseUrl: string = window.location.origin
): string => {
  const testPoolId = generateUniqueId();
  return generateCollectorLink(testPoolId, amount, baseUrl);
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
  const url = `${baseUrl}/app/collect/${poolId}`;
  return amount ? `${url}?amount=${amount}` : url;
};

/**
 * Generate a unique ID string
 * @returns Random string ID
 */
export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

/**
 * Calculate remaining amount after contributors' allocations
 * @param contributors List of contributors
 * @param totalAmount Total pool amount
 * @returns Remaining unallocated amount
 */
export const calculateRemainingAmount = (contributors: any[], totalAmount: number): number => {
  const allocated = contributors.reduce((sum, contributor) => sum + (contributor.amount || 0), 0);
  return parseFloat((totalAmount - allocated).toFixed(2));
};

/**
 * Distributes amount evenly among contributors
 * @param contributors List of contributors
 * @param totalAmount Total pool amount
 * @returns Updated contributors with evenly distributed amounts
 */
export const distributeAmountEvenly = (contributors: any[], totalAmount: number): any[] => {
  if (contributors.length === 0) return [];
  
  const evenAmount = totalAmount / contributors.length;
  return contributors.map(c => ({
    ...c,
    amount: parseFloat(evenAmount.toFixed(2))
  }));
};
