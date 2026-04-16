import { IReservaRepository, IFilaDeEsperaRepository } from '../../../domain/repositories/IRepositories';
import { Reserva, FilaDeEspera, StatusReserva } from '../../../domain/entities/Reserva';
import { prisma } from '../prismaClient';

// ─── Reserva ──────────────────────────────────────────────────────────────────

export class PrismaReservaRepository implements IReservaRepository {
  private toEntity(raw: any): Reserva {
    return new Reserva(
      raw.id,
      raw.membroId,
      raw.aulaAgendadaId,
      raw.status as StatusReserva,
      raw.criadaEm,
      raw.canceladaEm,
    );
  }

  async create(data: { membroId: string; aulaAgendadaId: string }): Promise<Reserva> {
    const created = await prisma.reserva.create({ data });
    return this.toEntity(created);
  }

  async findById(id: string): Promise<Reserva | null> {
    const r = await prisma.reserva.findUnique({ where: { id } });
    return r ? this.toEntity(r) : null;
  }

  async findByMembroEAula(membroId: string, aulaAgendadaId: string): Promise<Reserva | null> {
    const r = await prisma.reserva.findUnique({
      where: { membroId_aulaAgendadaId: { membroId, aulaAgendadaId } },
    });
    return r ? this.toEntity(r) : null;
  }

  async findByMembro(membroId: string): Promise<Reserva[]> {
    const list = await prisma.reserva.findMany({
      where: { membroId },
      include: { aulaAgendada: { include: { tipoAula: true } } },
      orderBy: { criadaEm: 'desc' },
    });
    return list.map((r) => this.toEntity(r));
  }

  async findByAula(aulaAgendadaId: string): Promise<Reserva[]> {
    const list = await prisma.reserva.findMany({
      where: { aulaAgendadaId },
      include: { membro: true },
      orderBy: { criadaEm: 'asc' },
    });
    return list.map((r) => this.toEntity(r));
  }

  async cancelar(id: string): Promise<Reserva> {
    const updated = await prisma.reserva.update({
      where: { id },
      data: { status: 'CANCELADA', canceladaEm: new Date() },
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.reserva.delete({ where: { id } });
  }
}

// ─── Fila de Espera ───────────────────────────────────────────────────────────

export class PrismaFilaDeEsperaRepository implements IFilaDeEsperaRepository {
  private toEntity(raw: any): FilaDeEspera {
    return new FilaDeEspera(
      raw.id,
      raw.membroId,
      raw.aulaAgendadaId,
      raw.posicao,
      raw.criadaEm,
      raw.notificado,
    );
  }

  async adicionar(data: { membroId: string; aulaAgendadaId: string }): Promise<FilaDeEspera> {
    // Calcula a próxima posição na fila para esta aula
    const ultima = await prisma.filaDeEspera.findFirst({
      where: { aulaAgendadaId: data.aulaAgendadaId },
      orderBy: { posicao: 'desc' },
    });
    const posicao = ultima ? ultima.posicao + 1 : 1;

    const created = await prisma.filaDeEspera.create({
      data: { ...data, posicao },
    });
    return this.toEntity(created);
  }

  async findProximo(aulaAgendadaId: string): Promise<FilaDeEspera | null> {
    const next = await prisma.filaDeEspera.findFirst({
      where: { aulaAgendadaId, notificado: false },
      orderBy: { posicao: 'asc' },
    });
    return next ? this.toEntity(next) : null;
  }

  async findByMembroEAula(membroId: string, aulaAgendadaId: string): Promise<FilaDeEspera | null> {
    const f = await prisma.filaDeEspera.findUnique({
      where: { membroId_aulaAgendadaId: { membroId, aulaAgendadaId } },
    });
    return f ? this.toEntity(f) : null;
  }

  async findByAula(aulaAgendadaId: string): Promise<FilaDeEspera[]> {
    const list = await prisma.filaDeEspera.findMany({
      where: { aulaAgendadaId },
      include: { membro: true },
      orderBy: { posicao: 'asc' },
    });
    return list.map((f) => this.toEntity(f));
  }

  async remover(id: string): Promise<void> {
    await prisma.filaDeEspera.delete({ where: { id } });
  }

  async marcarComoNotificado(id: string): Promise<FilaDeEspera> {
    const updated = await prisma.filaDeEspera.update({
      where: { id },
      data: { notificado: true },
    });
    return this.toEntity(updated);
  }
}