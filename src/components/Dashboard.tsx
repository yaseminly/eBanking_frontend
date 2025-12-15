// src/components/Dashboard.tsx
import { useState, useEffect } from "react";
import "./Dashboard.css";
import type { Account, Transaction, ExchangeRate } from "../types/types";
import { getAccounts, getTransactions, getExchangeRate, transferMoney, createAccount } from "../api/api";

interface TransferForm {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
}

interface NewAccountForm {
  titulaire: string;
  devise: string;
  solde: string;
}

function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState({
    accounts: true,
    transactions: true,
    rate: false,
  });

  const [transferForm, setTransferForm] = useState<TransferForm>({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
  });

  const [newAccountForm, setNewAccountForm] = useState<NewAccountForm>({
    titulaire: "",
    devise: "MAD",
    solde: "",
  });

  const [currencyFrom, setCurrencyFrom] = useState("MAD");
  const [currencyTo, setCurrencyTo] = useState("EUR");

  // 🔹 Fetch comptes
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccounts();
        const comptesArray = (data as any)._embedded?.comptes ?? data;
        const comptesWithId: Account[] = comptesArray.map((c: any) => ({
          id: parseInt(c._links.self.href.split("/").pop()!),
          titulaire: c.titulaire,
          devise: c.devise,
          solde: c.solde,
        }));
        setAccounts(comptesWithId);
      } catch (error) {
        console.error("Erreur comptes:", error);
      } finally {
        setLoading(prev => ({ ...prev, accounts: false }));
      }
    };
    fetchAccounts();
  }, []);

  // 🔹 Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erreur transactions:", error);
      } finally {
        setLoading(prev => ({ ...prev, transactions: false }));
      }
    };
    fetchTransactions();
  }, []);

  // 🔹 Fetch taux de change automatiquement
  useEffect(() => {
    const fetchRate = async () => {
      if (!currencyFrom || !currencyTo) return;
      setLoading(prev => ({ ...prev, rate: true }));
      try {
        const rate = await getExchangeRate(currencyFrom, currencyTo);
        setExchangeRate(rate);
      } catch (error) {
        console.error("Erreur taux de change:", error);
        setExchangeRate(null);
      } finally {
        setLoading(prev => ({ ...prev, rate: false }));
      }
    };
    fetchRate();
  }, [currencyFrom, currencyTo]);

  const formatAmount = (amount: number, currency: string = "MAD") =>
    `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

  // 🔹 Gestion virement
  const handleTransfer = async () => {
    if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }
    const fromId = parseInt(transferForm.fromAccountId);
    const toId = parseInt(transferForm.toAccountId);
    const amount = parseFloat(transferForm.amount);

    if (isNaN(amount) || amount <= 0 || isNaN(fromId) || isNaN(toId)) {
      alert("Informations de virement invalides");
      return;
    }

    try {
      const newTransaction = await transferMoney(fromId, toId, amount);
      if (!newTransaction) throw new Error("Transaction invalide");

      setTransactions(prev => [{ 
        id: newTransaction.id ?? Date.now(),
        date: newTransaction.date ?? new Date().toISOString(),
        amount: newTransaction.amount ?? amount,
        sourceAccountId: newTransaction.sourceAccountId ?? fromId,
        destinationAccountId: newTransaction.destinationAccountId ?? toId
      }, ...prev]);

      setAccounts(prev =>
        prev.map(acc => {
          if (acc.id === fromId) return { ...acc, solde: acc.solde - amount };
          if (acc.id === toId) return { ...acc, solde: acc.solde + amount };
          return acc;
        })
      );

      setTransferForm({ fromAccountId: "", toAccountId: "", amount: "" });
      alert("Virement effectué avec succès !");
    } catch (error) {
      console.error("Erreur lors du transfert:", error);
      alert("Erreur lors du transfert");
    }
  };

  // 🔹 Gestion ajout compte
  const handleAddAccount = async () => {
    if (!newAccountForm.titulaire || !newAccountForm.devise || !newAccountForm.solde) {
      alert("Veuillez remplir tous les champs du nouveau compte");
      return;
    }
    try {
      const newAcc = await createAccount(
        newAccountForm.titulaire,
        newAccountForm.devise,
        parseFloat(newAccountForm.solde)
      );
      setAccounts(prev => [...prev, newAcc]);
      setNewAccountForm({ titulaire: "", devise: "MAD", solde: "" });
      alert("Compte ajouté avec succès !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création du compte");
    }
  };

  return (
    <div className="dashboard">

      {/* Stats Header */}
      <div className="dashboard-header">
        <div className="stat-card">
          <h3>Total comptes</h3>
          <div className="count">{accounts.length}</div>
        </div>
        <div className="stat-card">
          <h3>Total transactions</h3>
          <div className="count">{transactions.length}</div>
        </div>
        <div className="stat-card">
          <h3>Solde total</h3>
          <div className="amount">
            {Array.isArray(accounts)
              ? formatAmount(accounts.reduce((sum, acc) => sum + acc.solde, 0))
              : "--"}
          </div>
        </div>
        <div className="stat-card">
          <h3>Taux {currencyFrom} → {currencyTo}</h3>
          <div className="amount">
            {loading.rate ? "Chargement..." : exchangeRate ? exchangeRate.rate : "--"}
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="section">
        <h2>Comptes</h2>
        {loading.accounts ? <div className="loading">Chargement comptes...</div> :
          <div className="accounts-grid">
            {accounts.map(acc => (
              <div key={acc.id} className="account-card">
                <div className="account-header">
                  <h3>{acc.titulaire}</h3>
                  <span className="account-type">{acc.devise}</span>
                </div>
                <div className="account-balance">{formatAmount(acc.solde, acc.devise)}</div>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Transactions Section */}
      <div className="section">
        <h2>Transactions</h2>
        {loading.transactions ? <div className="loading">Chargement transactions...</div> :
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Source</th>
                  <th>Destination</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.date).toLocaleString()}</td>
                    <td className={tx.amount >= 0 ? "credit" : "debit"}>{formatAmount(tx.amount)}</td>
                    <td>{tx.sourceAccountId}</td>
                    <td>{tx.destinationAccountId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>

      {/* Transfer Form */}
      <div className="section">
        <h2>Effectuer un virement</h2>
        <div className="transfer-form">
          <div className="form-group">
            <label>Compte source</label>
            <select value={transferForm.fromAccountId} onChange={e => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}>
              <option value="">Sélectionner</option>
              {accounts.map(acc => <option key={`from-${acc.id}`} value={acc.id}>{acc.titulaire}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Compte destination</label>
            <select value={transferForm.toAccountId} onChange={e => setTransferForm({ ...transferForm, toAccountId: e.target.value })}>
              <option value="">Sélectionner</option>
              {accounts.map(acc => <option key={`to-${acc.id}`} value={acc.id}>{acc.titulaire}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Montant</label>
            <input type="number" placeholder="Montant" value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} />
          </div>
          <button className="action-btn primary" onClick={handleTransfer}>Effectuer le virement</button>
        </div>
      </div>

      {/* New Account Section */}
      <div className="section">
        <h2>Ajouter un compte</h2>
        <div className="transfer-form">
          <div className="form-group">
            <label>Titulaire</label>
            <input type="text" value={newAccountForm.titulaire} onChange={e => setNewAccountForm({ ...newAccountForm, titulaire: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Devise</label>
            <select value={newAccountForm.devise} onChange={e => setNewAccountForm({ ...newAccountForm, devise: e.target.value })}>
              <option value="MAD">MAD</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="form-group">
            <label>Solde initial</label>
            <input type="number" value={newAccountForm.solde} onChange={e => setNewAccountForm({ ...newAccountForm, solde: e.target.value })} />
          </div>
          <button className="action-btn primary" onClick={handleAddAccount}>Ajouter le compte</button>
        </div>
      </div>

      {/* Exchange Rate Section */}
      <div className="section">
        <h2>Taux de change</h2>
        <div className="transfer-form">
          <div className="form-group">
            <label>From</label>
            <input type="text" value={currencyFrom} onChange={e => setCurrencyFrom(e.target.value.toUpperCase())} />
          </div>
          <div className="form-group">
            <label>To</label>
            <input type="text" value={currencyTo} onChange={e => setCurrencyTo(e.target.value.toUpperCase())} />
          </div>
          <div style={{ marginTop: "10px" }}>
            {loading.rate ? "Chargement..." : exchangeRate ? `1 ${exchangeRate.from} = ${exchangeRate.rate} ${exchangeRate.to}` : "--"}
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
