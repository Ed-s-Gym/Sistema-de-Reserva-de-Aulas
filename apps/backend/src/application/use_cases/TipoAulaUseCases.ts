import { ITipoAulaRepository } from '../../domain/repositories/IRepositories';

// ─── Create ───────────────────────────────────────────────────────────────────

export class CreateTipoAulaUseCase {
  constructor(private repo: ITipoAulaRepository) {}

  async execute(dto: { nome: string; descricao?: string }) {
    const existing = (await this.repo.findAll()).find(
      (t) => t.nome.toLowerCase() === dto.nome.toLowerCase(),
    );
    if (existing) throw new Error('Já existe um tipo de aula com este nome.');

    return this.repo.create(dto);
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export class GetAllTiposAulaUseCase {
  constructor(private repo: ITipoAulaRepository) {}
  async execute() {
    return this.repo.findAll();
  }
}

export class GetTipoAulaByIdUseCase {
  constructor(private repo: ITipoAulaRepository) {}
  async execute(id: string) {
    const t = await this.repo.findById(id);
    if (!t) throw new Error('Tipo de aula não encontrado.');
    return t;
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export class UpdateTipoAulaUseCase {
  constructor(private repo: ITipoAulaRepository) {}
  async execute(id: string, dto: { nome?: string; descricao?: string }) {
    const t = await this.repo.findById(id);
    if (!t) throw new Error('Tipo de aula não encontrado.');
    return this.repo.update(id, dto);
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export class DeleteTipoAulaUseCase {
  constructor(private repo: ITipoAulaRepository) {}
  async execute(id: string) {
    const t = await this.repo.findById(id);
    if (!t) throw new Error('Tipo de aula não encontrado.');
    await this.repo.delete(id);
  }
}