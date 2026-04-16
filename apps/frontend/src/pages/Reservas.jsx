import { useState, useEffect } from 'react';
import { reservasApi, aulasApi, usersApi } from '../services/api';

export default function Reservas({ toast }) {
  const [aulas, setAulas] = useState([]);
  const [membros, setMembros] = useState([]);
  const [aulaSelected, setAulaSelected] = useState('');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ membroId: '', aulaAgendadaId: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([aulasApi.getAll({ status: 'AGENDADA' }), usersApi.getAll()]).then(([a, u]) => {
      setAulas(a);
      setMembros(u.filter(u => u.role === 'MEMBRO'));
    });
  }, []);

  async function loadReservas(aulaId) {
    if (!aulaId) return;
    setLoading(true);
    try {
      setReservas(await reservasApi.getByAula(aulaId));
    } catch (e) {
      toast.error('Erro ao carregar reservas.');
    } finally {
      setLoading(false);
    }
  }

  function handleAulaChange(id) {
    setAulaSelected(id);
    loadReservas(id);
  }

  async function handleCriar(e) {
    e.preventDefault();
    if (!form.membroId || !form.aulaAgendadaId) return setError('Selecione o membro e a aula.');
    setSaving(true); setError('');
    try {
      const result = await reservasApi.criar(form.membroId, form.aulaAgendadaId);
      if (result.tipo === 'FILA_ESPERA') {
        toast.info(result.mensagem);
      } else {
        toast.success(result.mensagem);
      }
      setModal(false);
      if (aulaSelected === form.aulaAgendadaId) loadReservas(aulaSelected);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelar(reservaId, membroId) {
    if (!confirm('Cancelar esta reserva?')) return;
    try {
      await reservasApi.cancelar(reservaId, membroId);
      toast.success('Reserva cancelada. Fila de espera sendo processada...');
      loadReservas(aulaSelected);
    } catch (e) {
      toast.error(e.message);
    }
  }

  function getMembro(id) {
    return membros.find(m => m.id === id);
  }

  function getAulaNome(id) {
    const a = aulas.find(a => a.id === id);
    return a ? `${a.tipoAulaId} — ${new Date(a.dataHoraInicio).toLocaleDateString('pt-BR')}` : id;
  }

  const STATUS_CLS = { CONFIRMADA: 'badge-green', CANCELADA: 'badge-red', FILA_ESPERA: 'badge-yellow' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">RESERVAS</h1>
          <p className="page-subtitle">Gerencie as reservas de vagas nas aulas</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ membroId: '', aulaAgendadaId: '' }); setError(''); setModal(true); }}>
          + Nova Reserva
        </button>
      </div>

      {/* Filtro por aula */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '1px' }}>Ver reservas da aula:</span>
          <select value={aulaSelected} onChange={e => handleAulaChange(e.target.value)}>
            <option value="">Selecione uma aula...</option>
            {aulas.map(a => (
              <option key={a.id} value={a.id}>
                {a.instrutor ? `${a.instrutor} — ` : ''}{new Date(a.dataHoraInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} ({a.vagasDisponiveis}/{a.limiteVagas} vagas)
              </option>
            ))}
          </select>
        </div>
      </div>

      {!aulaSelected ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <p>Selecione uma aula acima para ver suas reservas.</p>
        </div>
      ) : loading ? (
        <div className="loading"><div className="spinner" /> Carregando reservas...</div>
      ) : reservas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>Nenhuma reserva para esta aula ainda.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Membro</th>
                <th>E-mail</th>
                <th>Status</th>
                <th>Reservado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map(r => {
                const m = getMembro(r.membroId);
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                          {m?.nome?.charAt(0) || '?'}
                        </div>
                        {m?.nome || r.membroId}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{m?.email || '—'}</td>
                    <td><span className={`badge ${STATUS_CLS[r.status] || 'badge-gray'}`}>{r.status}</span></td>
                    <td>{new Date(r.criadaEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      {r.status === 'CONFIRMADA' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancelar(r.id, r.membroId)}>
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>NOVA RESERVA</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleCriar}>
              {error && <div className="form-error">{error}</div>}
              <div style={{ padding: '10px 14px', background: 'var(--accent-dim)', borderRadius: 'var(--radius)', fontSize: '0.82rem', color: 'var(--accent)', border: '1px solid rgba(232,255,71,0.2)' }}>
                💡 Se a aula estiver lotada, o membro será adicionado automaticamente à fila de espera.
              </div>
              <div className="form-group">
                <label className="form-label">Membro *</label>
                <select value={form.membroId} onChange={e => setForm(f => ({ ...f, membroId: e.target.value }))}>
                  <option value="">Selecione o membro...</option>
                  {membros.map(m => <option key={m.id} value={m.id}>{m.nome} ({m.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Aula *</label>
                <select value={form.aulaAgendadaId} onChange={e => setForm(f => ({ ...f, aulaAgendadaId: e.target.value }))}>
                  <option value="">Selecione a aula...</option>
                  {aulas.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.instrutor || 'Aula'} — {new Date(a.dataHoraInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} ({a.vagasDisponiveis} vagas)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Reservando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}