import { Router } from 'express';
import { loginUser } from './MainController';
import {
  // Users
  createUser, getAllUsers, getUserById, updateUser, deleteUser,
  // Tipos de Aula
  createTipoAula, getAllTiposAula, getTipoAulaById, updateTipoAula, deleteTipoAula,
  // Aulas Agendadas
  createAulaAgendada, getAllAulasAgendadas, getAulaAgendadaById, updateAulaAgendada, deleteAulaAgendada,
  // Reservas
  criarReserva, cancelarReserva, getReservasByMembro, getReservasByAula,
  // Fila de Espera
  getFilaByAula, removerDaFila,
} from './MainController';

const router = Router();

router.post('/auth/login', loginUser);

// ── Health Check ─────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ── Usuários ─────────────────────────────────────────────────────────────────
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ── Tipos de Aula (Admin) ─────────────────────────────────────────────────────
router.post('/tipos-aula', createTipoAula);
router.get('/tipos-aula', getAllTiposAula);
router.get('/tipos-aula/:id', getTipoAulaById);
router.put('/tipos-aula/:id', updateTipoAula);
router.delete('/tipos-aula/:id', deleteTipoAula);

// ── Aulas Agendadas (Admin cria/edita; Membro visualiza) ──────────────────────
// GET /aulas-agendadas?tipoAulaId=xxx&status=AGENDADA
router.post('/aulas-agendadas', createAulaAgendada);
router.get('/aulas-agendadas', getAllAulasAgendadas);
router.get('/aulas-agendadas/:id', getAulaAgendadaById);
router.put('/aulas-agendadas/:id', updateAulaAgendada);
router.delete('/aulas-agendadas/:id', deleteAulaAgendada);

// ── Reservas ──────────────────────────────────────────────────────────────────
router.post('/reservas', criarReserva);                              // RF-02
router.delete('/reservas/:id/cancelar', cancelarReserva);           // RF-04
router.get('/reservas/membro/:membroId', getReservasByMembro);
router.get('/reservas/aula/:aulaId', getReservasByAula);

// ── Fila de Espera ────────────────────────────────────────────────────────────
router.get('/fila-espera/aula/:aulaId', getFilaByAula);             // RF-03
router.delete('/fila-espera/:id', removerDaFila);

export default router;