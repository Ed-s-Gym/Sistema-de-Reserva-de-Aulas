import { useState, useEffect } from 'react';
import { tiposAulaApi } from '../services/api';

export default function TiposAula({ toast }) {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | objeto para editar
  const [form, setForm] = useState({ nome: '', descricao: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      setTipos(await tiposAulaApi.getAll());
    } catch (e) {
      toast.error('Erro ao carregar tipos de aula.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm({ nome: '', descricao: '' });
    setError('');
    setModal('create');
  }

  function openEdit(tipo) {
    setForm({ nome: tipo.nome, descricao: tipo.descricao || '' });
    setError('');
    setModal(tipo);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim()) return setError('Nome é obrigatório.');
    setSaving(true); setError('');
    try {
      if (modal === 'create') {
        await tiposAulaApi.create(form);
        toast.success('Tipo de aula criado!');
      } else {
        await tiposAulaApi.update(modal.id, form);
        toast.success('Tipo de aula atualizado!');
      }
      setModal(null);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, nome) {
    if (!confirm(`Excluir "${nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await tiposAulaApi.delete(id);
      toast.success('Tipo de aula excluído.');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">TIPOS DE AULA</h1>
          <p className="page-subtitle">{tipos.length} modalidades cadastradas</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nova Modalidade</button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Carregando...</div>
      ) : tipos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏷️</div>
          <p>Nenhum tipo de aula cadastrado ainda.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Modalidade</th>
                <th>Descrição</th>
                <th>Cadastrado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map(t => (
                <tr key={t.id}>
                  <td style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', letterSpacing: '0.5px' }}>{t.nome}</td>
                  <td>{t.descricao || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  <td>{new Date(t.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>✏️ Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id, t.nome)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{modal === 'create' ? 'NOVA MODALIDADE' : 'EDITAR MODALIDADE'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Nome da Modalidade *</label>
                <input
                  placeholder="Ex: Spinning, Yoga, CrossFit..."
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                  placeholder="Descreva brevemente a modalidade..."
                  value={form.descricao}
                  onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : modal === 'create' ? 'Criar Modalidade' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}