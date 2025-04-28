
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
