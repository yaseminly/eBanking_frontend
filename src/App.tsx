import "./App.css";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";


function App() {
  return (
    <div className="app">
      <Navbar />
      <Dashboard />
      <main className="main-content">
        <h1>Bienvenue sur eBanking</h1>
        <p>Gérez vos comptes et transactions en toute sécurité</p>
      </main>
    </div>
  );
}

export default App;