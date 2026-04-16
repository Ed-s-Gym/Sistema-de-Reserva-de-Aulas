import { IAulaAgendadaRepository } from '../../../domain/repositories/IRepositories';
import { AulaAgendada, StatusAula } from '../../../domain/entities/AulaAgendada';
import { prisma } from '../prismaClient';

export class PrismaAulaAgendadaRepository implements IAulaAgendadaRepository {
  private toEntity(raw: any): AulaAgendada {
    return new AulaAgendada(
      raw.id,
      raw.tipoAulaId,
      raw.dataHoraInicio,
      raw.dataHoraFim,
      raw.limiteVagas,
      raw.vagasDisponiveis,
      raw.local,
      raw.instrutor,
      raw.status as StatusAula,
      raw.version,
      raw.createdAt,
    );
  }

  async create(data: Omit<AulaAgendada, 'id' | 'createdAt' | 'temVagasDisponiveis' | 'decrementarVaga' | 'incrementarVaga' | 'estaAtiva'>): Promise<AulaAgendada> {
    const created = await prisma.aulaAgendada.create({
      data: {
        tipoAulaId: data.tipoAulaId,
        dataHoraInicio: data.dataHoraInicio,
        dataHoraFim: data.dataHoraFim,
        limiteVagas: data.limiteVagas,
        vagasDisponiveis: data.limiteVagas, // começa com todas as vagas disponíveis
        local: data.local,
        instrutor: data.instrutor,
        status: data.status,
      },
    });
    return this.toEntity(created);
  }

  async findById(id: string): Promise<AulaAgendada | null> {
    const a = await prisma.aulaAgendada.findUnique({
      where: { id },
      include: { tipoAula: true },
    });
    return a ? this.toEntity(a) : null;
  }

  async findAll(filters?: { tipoAulaId?: string; status?: string }): Promise<AulaAgendada[]> {
    const all = await prisma.aulaAgendada.findMany({
      where: {
        ...(filters?.tipoAulaId && { tipoAulaId: filters.tipoAulaId }),
        ...(filters?.status && { status: filters.status as StatusAula }),
      },
      include: { tipoAula: true },
      orderBy: { dataHoraInicio: 'asc' },
    });
    return all.map((a) => this.toEntity(a));
  }

  /**
   * Implementação do Optimistic Locking (RNF-01 / Desafio C2).
   * Só atualiza se a `version` no banco ainda bate com `versionAtual`.
   * Retorna null se houve conflito de concorrência.
   */
  async updateComVersionamento(
    id: string,
    versionAtual: number,
    data: { vagasDisponiveis?: number; status?: string; version: number },
  ): Promise<AulaAgendada | null> {
    try {
      const updated = await prisma.aulaAgendada.updateMany({
        where: { id, version: versionAtual },
        data: {
          ...(data.vagasDisponiveis !== undefined && { vagasDisponiveis: data.vagasDisponiveis }),
          ...(data.status && { status: data.status as StatusAula }),
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        return null; // Conflito de concorrência detectado!
      }

      return this.findById(id);
    } catch (error) {
      return null;
    }
  }

  async update(id: string, data: Partial<AulaAgendada>): Promise<AulaAgendada> {
    const updated = await prisma.aulaAgendada.update({
      where: { id },
      data: {
        ...(data.tipoAulaId && { tipoAulaId: data.tipoAulaId }),
        ...(data.dataHoraInicio && { dataHoraInicio: data.dataHoraInicio }),
        ...(data.dataHoraFim && { dataHoraFim: data.dataHoraFim }),
        ...(data.limiteVagas !== undefined && { limiteVagas: data.limiteVagas }),
        ...(data.local !== undefined && { local: data.local }),
        ...(data.instrutor !== undefined && { instrutor: data.instrutor }),
        ...(data.status && { status: data.status }),
      },
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.aulaAgendada.delete({ where: { id } });
  }
}