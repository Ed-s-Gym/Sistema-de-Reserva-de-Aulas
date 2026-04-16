import { useState, useEffect } from 'react';
import { aulasApi, tiposAulaApi } from '../services/api';

function toInputDatetime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().slice(0, 16);
}

const STATUS_LABELS = {
  AGENDADA: { label: 'Agendada', cls: 'badge-blue' },
  EM_ANDAMENTO: { label: 'Em Andamento', cls: 'badge-yellow' },
  CONCLUIDA: { label: 'Concluída', cls: 'badge-gray' },
  CANCELADA: { label: 'Cancelada', cls: 'badge-red' },
};

export default function AulasAgendadas({ toast }) {
  const [aulas, setAulas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ tipoAulaId: '', dataHoraInicio: '', dataHoraFim: '', limiteVagas: 20, local: '', instrutor: '', status: 'AGENDADA' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const [a, t] = await Promise.all([
        aulasApi.getAll(filtroStatus ? { status: filtroStatus } : {}),
        tiposAulaApi.getAll(),
      ]);
      setAulas(a);
      setTipos(t);
    } catch (e) {
      toast.error('Erro ao carregar aulas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filtroStatus]);

  function openCreate() {
    setForm({ tipoAulaId: tipos[0]?.id || '', dataHoraInicio: '', dataHoraFim: '', limiteVagas: 20, local: '', instrutor: '', status: 'AGENDADA' });
    setError(''); setModal('create');
  }

  function openEdit(aula) {
    setForm({
      tipoAulaId: aula.tipoAulaId,
      dataHoraInicio: toInputDatetime(aula.dataHoraInicio),
      dataHoraFim: toInputDatetime(aula.dataHoraFim),
      limiteVagas: aula.limiteVagas,
      local: aula.local || '',
      instrutor: aula.instrutor || '',
      status: aula.status,
    });
    setError(''); setModal(aula);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.tipoAulaId) return setError('Selecione o tipo de aula.');
    if (!form.dataHoraInicio || !form.dataHoraFim) return setError('Informe horário de início e fim.');
    setSaving(true); setError('');
    try {
      const payload = { ...form, limiteVagas: Number(form.limiteVagas) };
      if (modal === 'create') {
        await aulasApi.create(payload);
        toast.success('Aula agendada com sucesso!');
      } else {
        await aulasApi.update(modal.id, payload);
        toast.success('Aula atualizada!');
      }
      setModal(null); load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Excluir esta aula? Reservas existentes serão afetadas.')) return;
    try {
      await aulasApi.delete(id);
      toast.success('Aula removida.');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  function getTipoNome(id) {
    return tipos.find(t => t.id === id)?.nome || id;
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function getVagaColor(disp, total) {
    const pct = disp / total;
    if (pct === 0) return 'var(--red)';
    if (pct < 0.3) return 'var(--orange)';
    return 'var(--green)';
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AULAS AGENDADAS</h1>
          <p className="page-subtitle">{aulas.length} aulas encontradas</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={{ width: 'auto' }}>
            <option value="">Todos os status</option>
            <option value="AGENDADA">Agendadas</option>
            <option value="EM_ANDAMENTO">Em Andamento</option>
            <option value="CONCLUIDA">Concluídas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
          <button className="btn btn-primary" onClick={openCreate}>+ Nova Aula</button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Carregando...</div>
      ) : aulas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>Nenhuma aula encontrada com os filtros atuais.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Modalidade</th>
                <th>Início</th>
                <th>Fim</th>
                <th>Instrutor</th>
                <th>Local</th>
                <th>Vagas</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {aulas.map(a => {
                const s = STATUS_LABELS[a.status] || { label: a.status, cls: 'badge-gray' };
                const pct = ((a.limiteVagas - a.vagasDisponiveis) / a.limiteVagas) * 100;
                return (
                  <tr key={a.id}>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '0.5px' }}>{getTipoNome(a.tipoAulaId)}</td>
                    <td>{formatDate(a.dataHoraInicio)}</td>
                    <td>{formatDate(a.dataHoraFim)}</td>
                    <td>{a.instrutor || '—'}</td>
                    <td>{a.local || '—'}</td>
                    <td style={{ minWidth: 120 }}>
                      <div className="vagas-bar">
                        <div className="vagas-track" style={{ minWidth: 60 }}>
                          <div className="vagas-fill" style={{ width: `${pct}%`, background: getVagaColor(a.vagasDisponiveis, a.limiteVagas) }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {a.vagasDisponiveis}/{a.limiteVagas}
                        </span>
                      </div>
                    </td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{modal === 'create' ? 'NOVA AULA' : 'EDITAR AULA'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Modalidade *</label>
                <select value={form.tipoAulaId} onChange={e => setForm(f => ({ ...f, tipoAulaId: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {tipos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Início *</label>
                  <input type="datetime-local" value={form.dataHoraInicio} onChange={e => setForm(f => ({ ...f, dataHoraInicio: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Fim *</label>
                  <input type="datetime-local" value={form.dataHoraFim} onChange={e => setForm(f => ({ ...f, dataHoraFim: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Limite de Vagas *</label>
                  <input type="number" min={1} value={form.limiteVagas} onChange={e => setForm(f => ({ ...f, limiteVagas: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="AGENDADA">Agendada</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Instrutor</label>
                <input placeholder="Nome do instrutor..." value={form.instrutor} onChange={e => setForm(f => ({ ...f, instrutor: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Local</label>
                <input placeholder="Ex: Sala de Spinning..." value={form.local} onChange={e => setForm(f => ({ ...f, local: e.target.value }))} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : modal === 'create' ? 'Criar Aula' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}