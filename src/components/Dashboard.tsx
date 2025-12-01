import { useState, useEffect } from "react";
import "./Dashboard.css";

// Types pour TypeScript
interface Account {
  id: number;
  accountNumber: string;
  name: string;
  balance: number;
  type: "Courant" | "Épargne" | "Professionnel";
  currency: string;
  status: "ACTIVE" | "INACTIVE";
  clientId: number;
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  currency: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  fromAccount?: string;
  toAccount?: string;
}

interface ExchangeRate {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

interface TransferForm {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description: string;
}

function Dashboard() {
  // États
  const [accounts, setAccounts] = useState<Account[]>([
    { 
      id: 1, 
      accountNumber: "MA1001234567", 
      name: "Compte Courant", 
      balance: 28473.50, 
      type: "Courant",
      currency: "MAD",
      status: "ACTIVE",
      clientId: 101 
    },
    { 
      id: 2, 
      accountNumber: "MA1007654321", 
      name: "Compte Épargne", 
      balance: 152308.00, 
      type: "Épargne",
      currency: "MAD",
      status: "ACTIVE",
      clientId: 101 
    },
    { 
      id: 3, 
      accountNumber: "MA2009876543", 
      name: "Compte Professionnel", 
      balance: 84562.00, 
      type: "Professionnel",
      currency: "MAD",
      status: "ACTIVE",
      clientId: 101 
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { 
      id: 1, 
      date: "2025-12-01", 
      description: "Salaire Novembre", 
      amount: 28000, 
      type: "credit",
      currency: "MAD",
      status: "COMPLETED",
      toAccount: "MA1001234567"
    },
    { 
      id: 2, 
      date: "2025-11-30", 
      description: "Loyer", 
      amount: -8500, 
      type: "debit",
      currency: "MAD",
      status: "COMPLETED",
      fromAccount: "MA1001234567"
    },
    { 
      id: 3, 
      date: "2025-11-28", 
      description: "Supermarché Marjane", 
      amount: -874.50, 
      type: "debit",
      currency: "MAD",
      status: "COMPLETED",
      fromAccount: "MA1001234567"
    },
    { 
      id: 4, 
      date: "2025-12-01", 
      description: "Virement SamYas", 
      amount: 1500, 
      type: "credit",
      currency: "MAD",
      status: "COMPLETED",
      toAccount: "MA1001234567"
    },
    { 
      id: 5, 
      date: "2025-11-25", 
      description: "Electricité ONE", 
      amount: -1246.00, 
      type: "debit",
      currency: "MAD",
      status: "COMPLETED",
      fromAccount: "MA1001234567"
    }
  ]);

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState({
    rates: true
  });
  const [transferForm, setTransferForm] = useState<TransferForm>({
    fromAccountId: "",
    toAccountId: "",
    amount: "",
    description: ""
  });

  // Simuler l'appel à reporting-service pour les taux de change
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        // En production : const response = await fetch('http://localhost:8083/api/exchange-rates');
        // const data = await response.json();
        
        // Simulation des données
        setTimeout(() => {
          const mockRates: ExchangeRate = {
            base: "MAD",
            rates: {
              "USD": 0.10,
              "EUR": 0.092,
              "GBP": 0.078,
              "AED": 0.37
            },
            lastUpdated: "2025-12-01T15:30:00Z"
          };
          setExchangeRates(mockRates);
          setLoading(prev => ({ ...prev, rates: false }));
        }, 500);
      } catch (error) {
        console.error("Erreur lors de la récupération des taux de change:", error);
        setLoading(prev => ({ ...prev, rates: false }));
      }
    };

    fetchExchangeRates();
  }, []);

  // Calculs
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const monthlyTransactions = transactions.filter(t => 
    t.date.startsWith("2025-12") || t.date.startsWith("2025-11")
  ).length;

  // Fonction pour formatter les montants
  const formatAmount = (amount: number, currency: string = "MAD"): string => {
    const formatted = Math.abs(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return `${formatted} ${currency}`;
  };

  // Fonction pour formatter les montants avec signe
  const formatAmountWithSign = (amount: number, currency: string = "MAD"): string => {
    const formatted = formatAmount(amount, currency);
    return `${amount >= 0 ? '+' : '-'} ${formatted}`;
  };

  // Gestion du transfert (appel à transaction-service)
  const handleTransfer = async () => {
    if (!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    const amount = parseFloat(transferForm.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Montant invalide");
      return;
    }

    // En production : appel à transaction-service via FeignClient
    // const response = await fetch('http://localhost:8082/api/transfers', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     fromAccountId: transferForm.fromAccountId,
    //     toAccountId: transferForm.toAccountId,
    //     amount: amount,
    //     description: transferForm.description,
    //     currency: "MAD"
    //   })
    // });

    // Simulation d'une transaction réussie
    const newTransaction: Transaction = {
      id: transactions.length + 1,
      date: new Date().toISOString().split('T')[0],
      description: transferForm.description || "Virement interne",
      amount: -amount, // Débit du compte source
      type: "debit",
      currency: "MAD",
      status: "COMPLETED",
      fromAccount: transferForm.fromAccountId
    };

    // Mettre à jour la liste des transactions
    setTransactions(prev => [newTransaction, ...prev]);

    // Mettre à jour les soldes des comptes
    setAccounts(prev => prev.map(account => {
      if (account.accountNumber === transferForm.fromAccountId) {
        return { ...account, balance: account.balance - amount };
      }
      if (account.accountNumber === transferForm.toAccountId) {
        return { ...account, balance: account.balance + amount };
      }
      return account;
    }));

    // Réinitialiser le formulaire
    setTransferForm({
      fromAccountId: "",
      toAccountId: "",
      amount: "",
      description: ""
    });

    alert(`Virement de ${formatAmount(amount)} effectué avec succès!`);
  };

  // Générer un rapport (appel à reporting-service)
  const generateReport = (type: "monthly" | "annual" | "transactions") => {
    // En production : appel à reporting-service via WebClient
    // const response = await fetch(`http://localhost:8083/api/reports/${type}`);
    
    alert(`Rapport ${type} généré! (Simulation d'appel à reporting-service)`);
    console.log(`Appel à reporting-service pour rapport: ${type}`);
  };

  // Télécharger le RIB
  const downloadRIB = (accountNumber: string) => {
    const account = accounts.find(acc => acc.accountNumber === accountNumber);
    if (account) {
      alert(`RIB du compte ${account.name} téléchargé!`);
      console.log(`RIB pour ${accountNumber}: Banque XYZ, Agence 123`);
    }
  };

  return (
    <div className="dashboard">
      {/* Header Stats */}
      <div className="dashboard-header">
        <div className="stat-card">
          <h3>Solde Total</h3>
          <p className="amount">{formatAmount(totalBalance)}</p>
        </div>
        <div className="stat-card">
          <h3>Nombre de Comptes</h3>
          <p className="count">{accounts.length}</p>
        </div>
        <div className="stat-card">
          <h3>Transactions ce mois</h3>
          <p className="count">{monthlyTransactions}</p>
        </div>
        <div className="stat-card">
          <h3>Taux de Change</h3>
          {loading.rates ? (
            <p className="count">Chargement...</p>
          ) : exchangeRates ? (
            <div className="exchange-rates">
              <small>1 MAD = {exchangeRates.rates.USD} USD</small>
              <small>1 MAD = {exchangeRates.rates.EUR} EUR</small>
            </div>
          ) : (
            <p className="count">N/A</p>
          )}
        </div>
      </div>

      {/* Accounts Section - Données de compte-service */}
      <div className="section">
        <h2>Mes Comptes (compte-service)</h2>
        <div className="accounts-grid">
          {accounts.map(account => (
            <div key={account.id} className="account-card">
              <div className="account-header">
                <h3>{account.name}</h3>
                <span className="account-type">{account.type}</span>
              </div>
              <p className="account-number">{account.accountNumber}</p>
              <p className="account-balance">{formatAmount(account.balance)}</p>
              <div className="account-actions">
                <button 
                  className="view-btn"
                  onClick={() => generateReport("transactions")}
                >
                  Historique
                </button>
                <button 
                  className="rib-btn"
                  onClick={() => downloadRIB(account.accountNumber)}
                >
                  Télécharger RIB
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer Section - Utilise transaction-service */}
      <div className="section">
        <h2>Nouveau Virement (transaction-service)</h2>
        <div className="transfer-form">
          <div className="form-group">
            <label>Compte Source:</label>
            <select 
              value={transferForm.fromAccountId}
              onChange={(e) => setTransferForm({...transferForm, fromAccountId: e.target.value})}
            >
              <option value="">Sélectionner un compte</option>
              {accounts.map(account => (
                <option key={account.id} value={account.accountNumber}>
                  {account.name} ({formatAmount(account.balance)})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Compte Destination:</label>
            <input 
              type="text"
              placeholder="Numéro de compte (ex: MA100XXXXXXX)"
              value={transferForm.toAccountId}
              onChange={(e) => setTransferForm({...transferForm, toAccountId: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Montant (MAD):</label>
            <input 
              type="number"
              placeholder="0.00"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Description:</label>
            <input 
              type="text"
              placeholder="Motif du virement"
              value={transferForm.description}
              onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
            />
          </div>
          
          <button 
            className="action-btn primary"
            onClick={handleTransfer}
            disabled={!transferForm.fromAccountId || !transferForm.toAccountId || !transferForm.amount}
          >
            Effectuer le Virement
          </button>
        </div>
      </div>

      {/* Recent Transactions - Données de transaction-service */}
      <div className="section">
        <h2>Transactions Récentes (transaction-service)</h2>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Compte</th>
                <th>Montant</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>
                  <td>
                    {transaction.fromAccount ? `De: ${transaction.fromAccount}` : 
                     transaction.toAccount ? `Vers: ${transaction.toAccount}` : 'N/A'}
                  </td>
                  <td className={transaction.type}>
                    {formatAmountWithSign(transaction.amount)}
                  </td>
                  <td className={`status-${transaction.status.toLowerCase()}`}>
                    {transaction.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section">
        <h2>Actions Rapides</h2>
        <div className="quick-actions">
          <button 
            className="action-btn primary"
            onClick={() => generateReport("monthly")}
          >
            Rapport Mensuel
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => generateReport("annual")}
          >
            Rapport Annuel
          </button>
          <button className="action-btn secondary">Demander un Prêt</button>
          <button className="action-btn secondary">Contacter Conseiller</button>
        </div>
      </div>

      {/* Exchange Rates - Données de reporting-service */}
      {exchangeRates && !loading.rates && (
        <div className="section">
          <h2>Taux de Change (reporting-service)</h2>
          <div className="exchange-grid">
            {Object.entries(exchangeRates.rates).map(([currency, rate]) => (
              <div key={currency} className="exchange-card">
                <h4>1 {exchangeRates.base} = {rate.toFixed(4)} {currency}</h4>
                <small>Dernière mise à jour: {new Date(exchangeRates.lastUpdated).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;