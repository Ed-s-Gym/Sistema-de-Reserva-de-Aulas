import {
  IReservaRepository,
  IAulaAgendadaRepository,
  IFilaDeEsperaRepository,
  IUserRepository,
} from '../../domain/repositories/IRepositories';
import { prisma } from '../../infrastructure/database/prismaClient';
import { processarFilaDeEspera } from './ProcessarFilaDeEsperaJob';

// ─── Criar Reserva (RF-02 + RNF-01) ──────────────────────────────────────────

export class CriarReservaUseCase {
  constructor(
    private reservaRepo: IReservaRepository,
    private aulaRepo: IAulaAgendadaRepository,
    private filaRepo: IFilaDeEsperaRepository,
    private userRepo: IUserRepository,
  ) {}

  async execute(membroId: string, aulaAgendadaId: string) {
    // Verifica se membro existe
    const membro = await this.userRepo.findById(membroId);
    if (!membro) throw new Error('Membro não encontrado.');
    if (!membro.isMembro()) throw new Error('Apenas membros podem fazer reservas.');

    // Verifica se a aula existe
    const aula = await this.aulaRepo.findById(aulaAgendadaId);
    if (!aula) throw new Error('Aula não encontrada.');
    if (!aula.estaAtiva()) throw new Error('Esta aula não está disponível para reserva.');

    // Verifica se o membro já tem reserva ou está na fila
    const reservaExistente = await this.reservaRepo.findByMembroEAula(membroId, aulaAgendadaId);
    if (reservaExistente && reservaExistente.estaAtiva()) {
      throw new Error('Você já possui uma reserva para esta aula.');
    }

    const naFila = await this.filaRepo.findByMembroEAula(membroId, aulaAgendadaId);
    if (naFila) throw new Error('Você já está na fila de espera desta aula.');

    // ── Optimistic Locking (RNF-01 / Desafio C2) ──────────────────────────
    // Tenta decrementar a vaga com verificação de versão
    // Se outro request mudou a aula antes, updateComVersionamento retorna null
    const MAX_RETRIES = 3;
    let tentativa = 0;

    while (tentativa < MAX_RETRIES) {
      const aulaAtual = await this.aulaRepo.findById(aulaAgendadaId);
      if (!aulaAtual) throw new Error('Aula não encontrada.');

      if (!aulaAtual.temVagasDisponiveis()) {
        // RF-03: Sem vagas → Fila de Espera
        const entrada = await this.filaRepo.adicionar({ membroId, aulaAgendadaId });
        return {
          tipo: 'FILA_ESPERA' as const,
          posicao: entrada.posicao,
          mensagem: `Aula lotada. Você foi adicionado à fila de espera na posição ${entrada.posicao}.`,
        };
      }

      // Tenta atualizar usando optimistic locking
      const atualizado = await this.aulaRepo.updateComVersionamento(
        aulaAgendadaId,
        aulaAtual.version,
        { vagasDisponiveis: aulaAtual.vagasDisponiveis - 1, version: aulaAtual.version + 1 },
      );

      if (atualizado) {
        // Sucesso! Cria a reserva
        const reserva = await this.reservaRepo.create({ membroId, aulaAgendadaId });
        return {
          tipo: 'CONFIRMADA' as const,
          reservaId: reserva.id,
          mensagem: 'Reserva confirmada com sucesso!',
        };
      }

      // Conflito de versão: outra transação ganhou a corrida. Tenta novamente.
      tentativa++;
    }

    throw new Error('Sistema ocupado. Tente novamente em instantes.');
  }
}

// ─── Cancelar Reserva (RF-04) ─────────────────────────────────────────────────

export class CancelarReservaUseCase {
  constructor(
    private reservaRepo: IReservaRepository,
    private aulaRepo: IAulaAgendadaRepository,
    private filaRepo: IFilaDeEsperaRepository,
    private userRepo: IUserRepository,
  ) {}

  async execute(reservaId: string, solicitanteId: string) {
    const reserva = await this.reservaRepo.findById(reservaId);
    if (!reserva) throw new Error('Reserva não encontrada.');
    if (!reserva.estaAtiva()) throw new Error('Esta reserva já está cancelada.');

    // Apenas o próprio membro ou admin pode cancelar
    const solicitante = await this.userRepo.findById(solicitanteId);
    if (!solicitante) throw new Error('Usuário não encontrado.');
    if (reserva.membroId !== solicitanteId && !solicitante.isAdmin()) {
      throw new Error('Sem permissão para cancelar esta reserva.');
    }

    // Cancela a reserva e devolve a vaga
    await this.reservaRepo.cancelar(reservaId);

    const aula = await this.aulaRepo.findById(reserva.aulaAgendadaId);
    if (aula) {
      await this.aulaRepo.updateComVersionamento(
        aula.id,
        aula.version,
        { vagasDisponiveis: aula.vagasDisponiveis + 1, version: aula.version + 1 },
      );
    }

    // RF-05 (RNF-02): Dispara processamento assíncrono da fila de espera
    // O job é executado de forma assíncrona (não bloqueia a resposta)
    setImmediate(() => {
      processarFilaDeEspera(
        reserva.aulaAgendadaId,
        {
          reservaRepo: this.reservaRepo,
          aulaRepo: this.aulaRepo,
          filaRepo: this.filaRepo,
          userRepo: this.userRepo,
        },
      ).catch(console.error);
    });

    return { mensagem: 'Reserva cancelada. Verificando fila de espera...' };
  }
}

// ─── Listar Reservas ──────────────────────────────────────────────────────────

export class GetReservasByMembroUseCase {
  constructor(private reservaRepo: IReservaRepository) {}
  async execute(membroId: string) {
    return this.reservaRepo.findByMembro(membroId);
  }
}

export class GetReservasByAulaUseCase {
  constructor(private reservaRepo: IReservaRepository) {}
  async execute(aulaAgendadaId: string) {
    return this.reservaRepo.findByAula(aulaAgendadaId);
  }
}