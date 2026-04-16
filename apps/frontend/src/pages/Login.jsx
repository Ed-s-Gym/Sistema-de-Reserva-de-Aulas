import { useState } from 'react';
import { authApi } from '../services/api';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await authApi.login(form.email, form.senha);
      if (user.role === 'MEMBRO') {
        setError('Acesso restrito a administradores.');
        return;
      }
      onLogin(user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      {/* Fundo decorativo */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '-10%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,255,71,0.06) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '-10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,255,71,0.04) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '4rem',
            color: 'var(--accent)', letterSpacing: 4, lineHeight: 1,
          }}>ED'S GYM</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: 3, textTransform: 'uppercase', marginTop: 8 }}>
            Sistema de Reservas
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '32px',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.6rem',
            letterSpacing: 1, marginBottom: 24,
          }}>ACESSO ADMINISTRATIVO</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div className="form-error">{error}</div>
            )}
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.senha}
                onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8, fontSize: '1rem' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 24 }}>
          Ed's Gym © 2026 — Acesso restrito a administradores
        </p>
      </div>
    </div>
  );
}