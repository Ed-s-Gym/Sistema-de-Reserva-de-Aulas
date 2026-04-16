import { IAulaAgendadaRepository, ITipoAulaRepository } from '../../domain/repositories/IRepositories';
import { StatusAula } from '../../domain/entities/AulaAgendada';

// ─── Create (RF-01) ───────────────────────────────────────────────────────────

export interface CreateAulaAgendadaDTO {
  tipoAulaId: string;
  dataHoraInicio: Date;
  dataHoraFim: Date;
  limiteVagas: number;
  local?: string;
  instrutor?: string;
}

export class CreateAulaAgendadaUseCase {
  constructor(
    private aulaRepo: IAulaAgendadaRepository,
    private tipoAulaRepo: ITipoAulaRepository,
  ) {}

  async execute(dto: CreateAulaAgendadaDTO) {
    const tipoAula = await this.tipoAulaRepo.findById(dto.tipoAulaId);
    if (!tipoAula) throw new Error('Tipo de aula não encontrado.');

    if (dto.limiteVagas < 1) throw new Error('Limite de vagas deve ser pelo menos 1.');
    if (dto.dataHoraFim <= dto.dataHoraInicio) throw new Error('Horário de fim deve ser após o início.');

    return this.aulaRepo.create({
      tipoAulaId: dto.tipoAulaId,
      dataHoraInicio: dto.dataHoraInicio,
      dataHoraFim: dto.dataHoraFim,
      limiteVagas: dto.limiteVagas,
      vagasDisponiveis: dto.limiteVagas,
      local: dto.local ?? null,
      instrutor: dto.instrutor ?? null,
      status: 'AGENDADA',
      version: 0,
    });
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export class GetAllAulasAgendadasUseCase {
  constructor(private repo: IAulaAgendadaRepository) {}
  async execute(filters?: { tipoAulaId?: string; status?: string }) {
    return this.repo.findAll(filters);
  }
}

export class GetAulaAgendadaByIdUseCase {
  constructor(private repo: IAulaAgendadaRepository) {}
  async execute(id: string) {
    const a = await this.repo.findById(id);
    if (!a) throw new Error('Aula não encontrada.');
    return a;
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export class UpdateAulaAgendadaUseCase {
  constructor(private repo: IAulaAgendadaRepository) {}
  async execute(id: string, dto: Partial<CreateAulaAgendadaDTO> & { status?: StatusAula }) {
    const aula = await this.repo.findById(id);
    if (!aula) throw new Error('Aula não encontrada.');
    return this.repo.update(id, dto);
  }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export class DeleteAulaAgendadaUseCase {
  constructor(private repo: IAulaAgendadaRepository) {}
  async execute(id: string) {
    const a = await this.repo.findById(id);
    if (!a) throw new Error('Aula não encontrada.');
    await this.repo.delete(id);
  }
}