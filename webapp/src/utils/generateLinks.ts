
import { Contributor } from "@/components/ui/ContributorCard";

export const generatePaymentLink = (
  poolId = "demo",
  baseUrl = window.location.origin
): string => {
  return `${baseUrl}/pay/${poolId}`;
};

export const generateCollectorLink = (
  poolId = "demo",
  totalAmount: number,
  baseUrl = window.location.origin
): string => {
  return `${baseUrl}/collect/${poolId}?amount=${totalAmount}`;
};

export const generateUniqueId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

// Function to evenly distribute amount among contributors
export const distributeAmountEvenly = (
  contributors: Contributor[],
  totalAmount: number
): Contributor[] => {
  if (contributors.length === 0) return [];
  
  const amountPerPerson = totalAmount / contributors.length;
  
  return contributors.map(contributor => ({
    ...contributor,
    amount: parseFloat(amountPerPerson.toFixed(2))
  }));
};

// Function to calculate the remaining amount to be distributed
export const calculateRemainingAmount = (
  contributors: Contributor[],
  totalAmount: number
): number => {
  const totalAssigned = contributors.reduce(
    (sum, contributor) => sum + contributor.amount,
    0
  );
  
  return parseFloat((totalAmount - totalAssigned).toFixed(2));
};
