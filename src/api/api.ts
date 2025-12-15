import axios from "axios";
import type { Account, Transaction, ExchangeRate } from "../types/types";

const API_URL = "http://localhost:8888";

// Comptes
export const getAccounts = async (): Promise<Account[]> => {
  const res = await axios.get(`${API_URL}/compte-service/comptes`);
  // HAL format: récupérer le tableau de comptes
  return res.data._embedded?.comptes || [];
};


export const createAccount = async (titulaire: string, devise: string, solde: number): Promise<Account> => {
  const res = await axios.post(`${API_URL}/compte-service/comptes`, { titulaire, devise, solde });
  return res.data;
};

// Transactions
export const getTransactions = async (): Promise<Transaction[]> => {
  const res = await axios.get(`${API_URL}/transaction-service/api/transactions`);
  return res.data;
};

// Virement
export const transferMoney = async (fromId: number, toId: number, amount: number): Promise<Transaction> => {
  const res = await axios.post(`${API_URL}/transaction-service/api/transactions/transfer?sourceId=${fromId}&destinationId=${toId}&amount=${amount}`);
  return res.data;
};

// Taux de change
export const getExchangeRate = async (from: string, to: string): Promise<ExchangeRate> => {
  const res = await axios.get(`${API_URL}/reporting-service/api/reporting/rate?from=${from}&to=${to}`);
  return res.data;
};
