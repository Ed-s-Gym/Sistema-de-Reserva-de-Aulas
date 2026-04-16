const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(err.error || `Erro ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Login ─────────────────────────────────────────────────────────────

export const authApi = {
  login: (email, senha) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),
};

// ── Tipos de Aula ─────────────────────────────────────────────────────────────
export const tiposAulaApi = {
  getAll: () => request('/tipos-aula'),
  getById: (id) => request(`/tipos-aula/${id}`),
  create: (data) => request('/tipos-aula', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/tipos-aula/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/tipos-aula/${id}`, { method: 'DELETE' }),
};

// ── Aulas Agendadas ───────────────────────────────────────────────────────────
export const aulasApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/aulas-agendadas${params ? '?' + params : ''}`);
  },
  getById: (id) => request(`/aulas-agendadas/${id}`),
  create: (data) => request('/aulas-agendadas', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/aulas-agendadas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/aulas-agendadas/${id}`, { method: 'DELETE' }),
};

// ── Usuários ──────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: () => request('/users'),
  getById: (id) => request(`/users/${id}`),
  create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

// ── Reservas ──────────────────────────────────────────────────────────────────
export const reservasApi = {
  getByMembro: (membroId) => request(`/reservas/membro/${membroId}`),
  getByAula: (aulaId) => request(`/reservas/aula/${aulaId}`),
  criar: (membroId, aulaAgendadaId) =>
    request('/reservas', { method: 'POST', body: JSON.stringify({ membroId, aulaAgendadaId }) }),
  cancelar: (id, solicitanteId) =>
    request(`/reservas/${id}/cancelar`, { method: 'DELETE', body: JSON.stringify({ solicitanteId }) }),
};

// ── Fila de Espera ────────────────────────────────────────────────────────────
export const filaApi = {
  getByAula: (aulaId) => request(`/fila-espera/aula/${aulaId}`),
};