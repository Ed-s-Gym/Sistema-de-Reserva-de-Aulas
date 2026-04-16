import { useState, useEffect } from 'react';
import { tiposAulaApi, aulasApi, usersApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [tiposMap, setTiposMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [tipos, aulasList, users] = await Promise.all([
          tiposAulaApi.getAll(),
          aulasApi.getAll(),
          usersApi.getAll(),
        ]);

        // Monta mapa id → nome
        const map = {};
        tipos.forEach(t => { map[t.id] = t.nome; });
        setTiposMap(map);

        setAulas(aulasList.slice(0, 3));

        const membros = users.filter(u => u.role === 'MEMBRO').length;
        const vagasTotal = aulasList.reduce((acc, a) => acc + a.limiteVagas, 0);
        const vagasOcupadas = aulasList.reduce((acc, a) => acc + (a.limiteVagas - a.vagasDisponiveis), 0);
        setStats({
          tipos: tipos.length,
          aulas: aulasList.length,
          membros,
          ocupacao: vagasTotal > 0 ? Math.round((vagasOcupadas / vagasTotal) * 100) : 0,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatDate(d) {
    return new Date(d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  function getVagaColor(disp, total) {
    const pct = disp / total;
    if (pct === 0) return 'var(--red)';
    if (pct < 0.3) return 'var(--orange)';
    return 'var(--green)';
  }

  if (loading) return <div className="loading"><div className="spinner" /> Carregando...</div>;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">DASHBOARD</h1>
          <p className="page-subtitle">Visão geral do sistema de reservas</p>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        {[
          { icon: '🏋️', value: stats.aulas, label: 'Aulas Agendadas' },
          { icon: '🎯', value: stats.tipos, label: 'Tipos de Aula' },
          { icon: '👥', value: stats.membros, label: 'Membros Ativos' },
          { icon: '📊', value: `${stats.ocupacao}%`, label: 'Taxa de Ocupação' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div>
              <div className="stat-value" style={{ color: i === 3 ? 'var(--accent)' : 'var(--text)' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Próximas Aulas */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', letterSpacing: '1px' }}>PRÓXIMAS AULAS</h2>
      </div>
      <div className="grid grid-3">
        {aulas.map(aula => (
          <div key={aula.id} className="aula-card">
            <div className="aula-card-header">
              <div className="aula-tipo">{tiposMap[aula.tipoAulaId] || aula.tipoAulaId}</div>
              <span className={`badge ${aula.vagasDisponiveis === 0 ? 'badge-red' : aula.vagasDisponiveis < 5 ? 'badge-yellow' : 'badge-green'}`}>
                {aula.vagasDisponiveis === 0 ? 'LOTADA' : `${aula.vagasDisponiveis} vagas`}
              </span>
            </div>
            <div className="aula-info">
              <div className="aula-info-row">📅 <span>{formatDate(aula.dataHoraInicio)}</span></div>
              {aula.instrutor && <div className="aula-info-row">👤 <span>{aula.instrutor}</span></div>}
              {aula.local && <div className="aula-info-row">📍 <span>{aula.local}</span></div>}
            </div>
            <div className="vagas-bar">
              <div className="vagas-track">
                <div className="vagas-fill" style={{
                  width: `${((aula.limiteVagas - aula.vagasDisponiveis) / aula.limiteVagas) * 100}%`,
                  background: getVagaColor(aula.vagasDisponiveis, aula.limiteVagas),
                }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {aula.limiteVagas - aula.vagasDisponiveis}/{aula.limiteVagas}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}