import { useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [accounts] = useState([
    { id: 1, name: "Compte Courant", balance: 12500.50, type: "Courant" },
    { id: 2, name: "Compte Épargne", balance: 45000.00, type: "Épargne" },
    { id: 3, name: "Compte Entreprise", balance: 78320.75, type: "Professionnel" }
  ]);

  const [recentTransactions] = useState([
    { id: 1, date: "2024-01-15", description: "Salaire", amount: 3500, type: "credit" },
    { id: 2, date: "2024-01-14", description: "Loyer", amount: -850, type: "debit" },
    { id: 3, date: "2024-01-13", description: "Courses", amount: -120.50, type: "debit" },
    { id: 4, date: "2024-01-12", description: "Virement reçu", amount: 200, type: "credit" },
    { id: 5, date: "2024-01-11", description: "Restaurant", amount: -65.30, type: "debit" }
  ]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="dashboard">
      {/* Header Stats */}
      <div className="dashboard-header">
        <div className="stat-card">
          <h3>Solde Total</h3>
          <p className="amount">{totalBalance.toFixed(2)} €</p>
        </div>
        <div className="stat-card">
          <h3>Nombre de Comptes</h3>
          <p className="count">{accounts.length}</p>
        </div>
        <div className="stat-card">
          <h3>Transactions ce mois</h3>
          <p className="count">28</p>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="section">
        <h2>Mes Comptes</h2>
        <div className="accounts-grid">
          {accounts.map(account => (
            <div key={account.id} className="account-card">
              <div className="account-header">
                <h3>{account.name}</h3>
                <span className="account-type">{account.type}</span>
              </div>
              <p className="account-balance">{account.balance.toFixed(2)} €</p>
              <button className="view-btn">Voir détails</button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="section">
        <h2>Transactions Récentes</h2>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Montant</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.date}</td>
                  <td>{transaction.description}</td>
                  <td className={transaction.type}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} €
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
          <button className="action-btn primary">Nouveau Virement</button>
          <button className="action-btn secondary">Demander un Prêt</button>
          <button className="action-btn secondary">Télécharger RIB</button>
          <button className="action-btn secondary">Contacter Conseiller</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;