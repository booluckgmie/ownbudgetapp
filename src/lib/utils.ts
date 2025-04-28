
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CURRENCIES, DEFAULT_CURRENCY } from "@/types"; // Import currency definitions

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


/**
 * Formats a number as a currency string based on the provided currency code.
 * e.g., formatCurrency(1234.56, 'USD') => $1,234.56
 * e.g., formatCurrency(1234.56, 'EUR') => €1,234.56
 */
export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES.find(c => c.code === DEFAULT_CURRENCY);

  // Use Intl.NumberFormat for robust currency formatting
  try {
    return new Intl.NumberFormat('en-US', { // Use a locale that supports the desired format, 'en-US' is generally good
      style: 'currency',
      currency: currency?.code ?? DEFAULT_CURRENCY,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error(`Error formatting currency for code ${currencyCode}:`, error);
    // Fallback to simple formatting if Intl fails (e.g., invalid code)
    const symbol = currency?.symbol ?? '$';
    return `${symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Gets the currency symbol for a given currency code.
 */
export function getCurrencySymbol(currencyCode: string = DEFAULT_CURRENCY): string {
    const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES.find(c => c.code === DEFAULT_CURRENCY);
    return currency?.symbol ?? '$';
}
