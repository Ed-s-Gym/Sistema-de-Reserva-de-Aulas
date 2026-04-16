import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TiposAula from './pages/TiposAula';
import AulasAgendadas from './pages/AulasAgendadas';
import Membros from './pages/Membros';
import Reservas from './pages/Reservas';
import { useToast, ToastContainer } from './hooks/useToast.jsx';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: '⚡', section: null },
  { key: 'aulas', label: 'Aulas Agendadas', icon: '📅', section: 'GESTÃO' },
  { key: 'tipos', label: 'Tipos de Aula', icon: '🏷️', section: null },
  { key: 'reservas', label: 'Reservas', icon: '🎫', section: null },
  { key: 'membros', label: 'Membros', icon: '👥', section: 'USUÁRIOS' },
];

const PAGES = {
  dashboard: Dashboard,
  tipos: TiposAula,
  aulas: AulasAgendadas,
  membros: Membros,
  reservas: Reservas,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const toast = useToast();
  const Page = PAGES[page] || Dashboard;

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>ED'S GYM</h1>
          <span>Sistema de Reservas</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((item) => (
            <div key={item.key}>
              {item.section && <div className="nav-section">{item.section}</div>}
              <button
                className={`nav-item ${page === item.key ? 'active' : ''}`}
                onClick={() => setPage(item.key)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </button>
            </div>
          ))}
        </nav>

        {/* Usuário logado + botão sair */}
        <div style={{ padding: '0 16px 0' }}>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4 }}>Logado como</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>{user.nome}</div>
            <button
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
              onClick={() => { setUser(null); setPage('dashboard'); }}
            >
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Page toast={toast} />
      </main>

      <ToastContainer toasts={toast.toasts} />
    </div>
  );
}