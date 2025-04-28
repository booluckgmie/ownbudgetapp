
export interface Commitment {
  id: string;
  name: string;
  value: number;
  paid: boolean;
}

export interface Quest {
  id: string;
  name: string;
  income: number;
  commitments: Commitment[];
  createdAt: number; // Timestamp for sorting or reference
}

export interface Settings {
  currency: string; // e.g., 'USD', 'EUR', 'GBP'
}

// Define a list of common currencies for selection
export const CURRENCIES = [
    { code: 'MYR', name: 'Malaysia Ringgit', symbol: 'RM' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

export const DEFAULT_CURRENCY = 'RM';
