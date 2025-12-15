// src/types/types.ts

// Compte
export interface Account {
  id: number;
  titulaire: string;
  devise: string;
  solde: number;
}

// Transaction
export interface Transaction {
  id: number;
  sourceAccountId: number;
  destinationAccountId: number;
  amount: number;
  date: string;
}

// Exchange Rate
export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  date: string;
  id?: number; 
}
