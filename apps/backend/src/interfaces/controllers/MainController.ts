import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import { CreateUserUseCase } from '../../application/use_cases/CreateUser';
import {
  CreateTipoAulaUseCase,
  GetAllTiposAulaUseCase,
  GetTipoAulaByIdUseCase,
  UpdateTipoAulaUseCase,
  DeleteTipoAulaUseCase,
} from '../../application/use_cases/TipoAulaUseCases';
import {
  CreateAulaAgendadaUseCase,
  GetAllAulasAgendadasUseCase,
  GetAulaAgendadaByIdUseCase,
  UpdateAulaAgendadaUseCase,
  DeleteAulaAgendadaUseCase,
} from '../../application/use_cases/AulaAgendadaUseCases';
import {
  CriarReservaUseCase,
  CancelarReservaUseCase,
  GetReservasByMembroUseCase,
  GetReservasByAulaUseCase,
} from '../../application/use_cases/ReservaUseCases';

import { PrismaUserRepository } from '../../infrastructure/database/repositories/PrismaUserRepository';
import { PrismaTipoAulaRepository } from '../../infrastructure/database/repositories/PrismaTipoAulaRepository';
import { PrismaAulaAgendadaRepository } from '../../infrastructure/database/repositories/PrismaAulaAgendadaRepository';
import {
  PrismaReservaRepository,
  PrismaFilaDeEsperaRepository,
} from '../../infrastructure/database/repositories/PrismaReservaRepository';

// ── Instâncias dos repositórios ──────────────────────────────────────────────
const userRepo = new PrismaUserRepository();
const tipoAulaRepo = new PrismaTipoAulaRepository();
const aulaRepo = new PrismaAulaAgendadaRepository();
const reservaRepo = new PrismaReservaRepository();
const filaRepo = new PrismaFilaDeEsperaRepository();

// ── Helper para respostas de erro ────────────────────────────────────────────
const handleError = (res: Response, err: unknown, statusCode = 400) => {
  const message = err instanceof Error ? err.message : 'Erro interno.';
  return res.status(statusCode).json({ error: message });
};

// ════════════════════════════════════════════════════════════════════════════
// USER CONTROLLER
// ════════════════════════════════════════════════════════════════════════════

export const createUser = async (req: Request, res: Response) => {
  try {
    const useCase = new CreateUserUseCase(userRepo);
    const result = await useCase.execute(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userRepo.findAll();
    // Nunca retorna senhas
    const safe = users.map(({ id, nome, email, role, createdAt }) => ({
      id, nome, email, role, createdAt,
    }));
    return res.json(safe);
  } catch (err) {
    return handleError(res, err, 500);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await userRepo.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    const { senha, ...safe } = user as any;
    return res.json(safe);
  } catch (err) {
    return handleError(res, err, 500);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const updated = await userRepo.update(req.params.id, req.body);
    return res.json(updated);
  } catch (err) {
    return handleError(res, err);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await userRepo.delete(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return handleError(res, err);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// TIPO AULA CONTROLLER
// ════════════════════════════════════════════════════════════════════════════

export const createTipoAula = async (req: Request, res: Response) => {
  try {
    const result = await new CreateTipoAulaUseCase(tipoAulaRepo).execute(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const getAllTiposAula = async (_req: Request, res: Response) => {
  try {
    const result = await new GetAllTiposAulaUseCase(tipoAulaRepo).execute();
    return res.json(result);
  } catch (err) {
    return handleError(res, err, 500);
  }
};

export const getTipoAulaById = async (req: Request, res: Response) => {
  try {
    const result = await new GetTipoAulaByIdUseCase(tipoAulaRepo).execute(req.params.id);
    return res.json(result);
  } catch (err) {
    return handleError(res, err, 404);
  }
};

export const updateTipoAula = async (req: Request, res: Response) => {
  try {
    const result = await new UpdateTipoAulaUseCase(tipoAulaRepo).execute(req.params.id, req.body);
    return res.json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const deleteTipoAula = async (req: Request, res: Response) => {
  try {
    await new DeleteTipoAulaUseCase(tipoAulaRepo).execute(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return handleError(res, err);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// AULA AGENDADA CONTROLLER
// ════════════════════════════════════════════════════════════════════════════

export const createAulaAgendada = async (req: Request, res: Response) => {
  try {
    const dto = {
      ...req.body,
      dataHoraInicio: new Date(req.body.dataHoraInicio),
      dataHoraFim: new Date(req.body.dataHoraFim),
    };
    const result = await new CreateAulaAgendadaUseCase(aulaRepo, tipoAulaRepo).execute(dto);
    return res.status(201).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const getAllAulasAgendadas = async (req: Request, res: Response) => {
  try {
    const filters = {
      tipoAulaId: req.query.tipoAulaId as string | undefined,
      status: req.query.status as string | undefined,
    };
    const result = await new GetAllAulasAgendadasUseCase(aulaRepo).execute(filters);
    return res.json(result);
  } catch (err) {
    return handleError(res, err, 500);
  }
};

export const getAulaAgendadaById = async (req: Request, res: Response) => {
  try {
    const result = await new GetAulaAgendadaByIdUseCase(aulaRepo).execute(req.params.id);
    return res.json(result);
  } catch (err) {
    return handleError(res, err, 404);
  }
};

export const updateAulaAgendada = async (req: Request, res: Response) => {
  try {
    const dto = {
      ...req.body,
      ...(req.body.dataHoraInicio && { dataHoraInicio: new Date(req.body.dataHoraInicio) }),
      ...(req.body.dataHoraFim && { dataHoraFim: new Date(req.body.dataHoraFim) }),
    };
    const result = await new UpdateAulaAgendadaUseCase(aulaRepo).execute(req.params.id, dto);
    return res.json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const deleteAulaAgendada = async (req: Request, res: Response) => {
  try {
    await new DeleteAulaAgendadaUseCase(aulaRepo).execute(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return handleError(res, err);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// RESERVA CONTROLLER
// ════════════════════════════════════════════════════════════════════════════

export const criarReserva = async (req: Request, res: Response) => {
  try {
    const { membroId, aulaAgendadaId } = req.body;
    const result = await new CriarReservaUseCase(
      reservaRepo, aulaRepo, filaRepo, userRepo,
    ).execute(membroId, aulaAgendadaId);

    const status = result.tipo === 'CONFIRMADA' ? 201 : 200;
    return res.status(status).json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const cancelarReserva = async (req: Request, res: Response) => {
  try {
    // Em produção, solicitanteId viria do JWT. Aqui aceita no body/query.
    const solicitanteId = req.body.solicitanteId || req.query.solicitanteId as string;
    if (!solicitanteId) return res.status(400).json({ error: 'solicitanteId é obrigatório.' });

    const result = await new CancelarReservaUseCase(
      reservaRepo, aulaRepo, filaRepo, userRepo,
    ).execute(req.params.id, solicitanteId);

    return res.json(result);
  } catch (err) {
    return handleError(res, err);
  }
};

export const getReservasByMembro = async (req: Request, res: Response) => {
  try {
    const result = await new GetReservasByMembroUseCase(reservaRepo).execute(req.params.membroId);
    return res.json(result);
  } catch (err) {
    return handleError(res, err, 500);
  }
};

export const getReservasByAula = async (req: Request, res: Response) => {
  try {
    const result = await new GetReservasByAulaUseCase(reservaRepo).execute(req.params.aulaId);
    return res.json(result);
  } catch (err) {
    return handleError(res, err, 500);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// FILA DE ESPERA CONTROLLER
// ════════════════════════════════════════════════════════════════════════════

export const getFilaByAula = async (req: Request, res: Response) => {
  try {
    const fila = await filaRepo.findByAula(req.params.aulaId);
    return res.json(fila);
  } catch (err) {
    return handleError(res, err, 500);
  }
};

// ════════════════════════════════════════════════════════════════════════════
// Login
// ════════════════════════════════════════════════════════════════════════════


export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });

    const user = await userRepo.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });

    return res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return handleError(res, err, 500);
  }
};

export const removerDaFila = async (req: Request, res: Response) => {
  try {
    await filaRepo.remover(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return handleError(res, err);
  }
};