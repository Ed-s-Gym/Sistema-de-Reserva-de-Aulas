import { User } from '../entities/User';
import { TipoAula } from '../entities/TipoAula';
import { AulaAgendada } from '../entities/AulaAgendada';
import { Reserva, FilaDeEspera } from '../entities/Reserva';

// ─── User Repository ─────────────────────────────────────────────────────────

export interface IUserRepository {
  create(data: Omit<User, 'id' | 'createdAt' | 'isAdmin' | 'isMembro'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: Partial<Pick<User, 'nome' | 'email' | 'role'>>): Promise<User>;
  delete(id: string): Promise<void>;
}

// ─── TipoAula Repository ──────────────────────────────────────────────────────

export interface ITipoAulaRepository {
  create(data: { nome: string; descricao?: string }): Promise<TipoAula>;
  findById(id: string): Promise<TipoAula | null>;
  findAll(): Promise<TipoAula[]>;
  update(id: string, data: { nome?: string; descricao?: string }): Promise<TipoAula>;
  delete(id: string): Promise<void>;
}

// ─── AulaAgendada Repository ──────────────────────────────────────────────────

export interface IAulaAgendadaRepository {
  create(data: Omit<AulaAgendada, 'id' | 'createdAt' | 'temVagasDisponiveis' | 'decrementarVaga' | 'incrementarVaga' | 'estaAtiva'>): Promise<AulaAgendada>;
  findById(id: string): Promise<AulaAgendada | null>;
  findAll(filters?: { tipoAulaId?: string; status?: string }): Promise<AulaAgendada[]>;
  updateComVersionamento(id: string, versionAtual: number, data: { vagasDisponiveis?: number; status?: string; version: number }): Promise<AulaAgendada | null>;
  update(id: string, data: Partial<AulaAgendada>): Promise<AulaAgendada>;
  delete(id: string): Promise<void>;
}

// ─── Reserva Repository ───────────────────────────────────────────────────────

export interface IReservaRepository {
  create(data: { membroId: string; aulaAgendadaId: string }): Promise<Reserva>;
  findById(id: string): Promise<Reserva | null>;
  findByMembroEAula(membroId: string, aulaAgendadaId: string): Promise<Reserva | null>;
  findByMembro(membroId: string): Promise<Reserva[]>;
  findByAula(aulaAgendadaId: string): Promise<Reserva[]>;
  cancelar(id: string): Promise<Reserva>;
  delete(id: string): Promise<void>;
}

// ─── FilaDeEspera Repository ──────────────────────────────────────────────────

export interface IFilaDeEsperaRepository {
  adicionar(data: { membroId: string; aulaAgendadaId: string }): Promise<FilaDeEspera>;
  findProximo(aulaAgendadaId: string): Promise<FilaDeEspera | null>;
  findByMembroEAula(membroId: string, aulaAgendadaId: string): Promise<FilaDeEspera | null>;
  findByAula(aulaAgendadaId: string): Promise<FilaDeEspera[]>;
  remover(id: string): Promise<void>;
  marcarComoNotificado(id: string): Promise<FilaDeEspera>;
}