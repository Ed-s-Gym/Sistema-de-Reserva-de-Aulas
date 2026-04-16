import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';

const ROLE_LABELS = {
  ADMIN_SISTEMA: { label: 'Admin Sistema', cls: 'badge-red' },
  ADMIN_ACADEMIA: { label: 'Admin Academia', cls: 'badge-yellow' },
  MEMBRO: { label: 'Membro', cls: 'badge-green' },
};

export default function Membros({ toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', role: 'MEMBRO' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    try { setUsers(await usersApi.getAll()); }
    catch (e) { toast.error('Erro ao carregar usuários.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setForm({ nome: '', email: '', senha: '', role: 'MEMBRO' });
    setError(''); setModal('create');
  }

  function openEdit(user) {
    setForm({ nome: user.nome, email: user.email, senha: '', role: user.role });
    setError(''); setModal(user);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim()) return setError('Nome e e-mail são obrigatórios.');
    if (modal === 'create' && !form.senha.trim()) return setError('Senha é obrigatória.');
    setSaving(true); setError('');
    try {
      if (modal === 'create') {
        await usersApi.create(form);
        toast.success('Usuário criado!');
      } else {
        const data = { nome: form.nome, email: form.email, role: form.role };
        await usersApi.update(modal.id, data);
        toast.success('Usuário atualizado!');
      }
      setModal(null); load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, nome) {
    if (!confirm(`Excluir "${nome}"?`)) return;
    try { await usersApi.delete(id); toast.success('Usuário excluído.'); load(); }
    catch (e) { toast.error(e.message); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">MEMBROS</h1>
          <p className="page-subtitle">{users.length} usuários cadastrados</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            placeholder="🔍 Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 240 }}
          />
          <button className="btn btn-primary" onClick={openCreate}>+ Novo Membro</button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Cadastrado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const r = ROLE_LABELS[u.role] || { label: u.role, cls: 'badge-gray' };
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--accent-dim)', color: 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {u.nome.charAt(0).toUpperCase()}
                        </div>
                        {u.nome}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                    <td><span className={`badge ${r.cls}`}>{r.label}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.nome)}>🗑️</button>
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
              <h2>{modal === 'create' ? 'NOVO MEMBRO' : 'EDITAR MEMBRO'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              {error && <div className="form-error">{error}</div>}
              <div className="form-group">
                <label className="form-label">Nome completo *</label>
                <input placeholder="Nome do membro..." value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail *</label>
                <input type="email" placeholder="email@exemplo.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              {modal === 'create' && (
                <div className="form-group">
                  <label className="form-label">Senha *</label>
                  <input type="password" placeholder="Mínimo 6 caracteres..." value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Perfil</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="MEMBRO">Membro</option>
                  <option value="ADMIN_ACADEMIA">Admin Academia</option>
                  <option value="ADMIN_SISTEMA">Admin Sistema</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : modal === 'create' ? 'Criar Membro' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}