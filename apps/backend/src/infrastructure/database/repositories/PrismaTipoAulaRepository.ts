import { ITipoAulaRepository } from '../../../domain/repositories/IRepositories';
import { TipoAula } from '../../../domain/entities/TipoAula';
import { prisma } from '../prismaClient';

export class PrismaTipoAulaRepository implements ITipoAulaRepository {
  private toEntity(raw: any): TipoAula {
    return new TipoAula(raw.id, raw.nome, raw.descricao, raw.createdAt);
  }

  async create(data: { nome: string; descricao?: string }): Promise<TipoAula> {
    const created = await prisma.tipoAula.create({ data });
    return this.toEntity(created);
  }

  async findById(id: string): Promise<TipoAula | null> {
    const t = await prisma.tipoAula.findUnique({ where: { id } });
    return t ? this.toEntity(t) : null;
  }

  async findAll(): Promise<TipoAula[]> {
    const all = await prisma.tipoAula.findMany({ orderBy: { nome: 'asc' } });
    return all.map((t) => this.toEntity(t));
  }

  async update(id: string, data: { nome?: string; descricao?: string }): Promise<TipoAula> {
    const updated = await prisma.tipoAula.update({ where: { id }, data });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.tipoAula.delete({ where: { id } });
  }
}