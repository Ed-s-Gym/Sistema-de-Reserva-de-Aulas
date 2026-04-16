export type StatusAula = 'AGENDADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';

export class AulaAgendada {
  constructor(
    public readonly id: string,
    public tipoAulaId: string,
    public dataHoraInicio: Date,
    public dataHoraFim: Date,
    public limiteVagas: number,
    public vagasDisponiveis: number,
    public local: string | null,
    public instrutor: string | null,
    public status: StatusAula,
    public version: number, // Para optimistic locking (RNF-01)
    public readonly createdAt: Date,
  ) {}

  temVagasDisponiveis(): boolean {
    return this.vagasDisponiveis > 0;
  }

  decrementarVaga(): void {
    if (!this.temVagasDisponiveis()) {
      throw new Error('Não há vagas disponíveis para esta aula.');
    }
    this.vagasDisponiveis -= 1;
  }

  incrementarVaga(): void {
    if (this.vagasDisponiveis < this.limiteVagas) {
      this.vagasDisponiveis += 1;
    }
  }

  estaAtiva(): boolean {
    return this.status === 'AGENDADA' || this.status === 'EM_ANDAMENTO';
  }
}