export type StatusReserva = 'CONFIRMADA' | 'CANCELADA' | 'FILA_ESPERA';

export class Reserva {
  constructor(
    public readonly id: string,
    public membroId: string,
    public aulaAgendadaId: string,
    public status: StatusReserva,
    public readonly criadaEm: Date,
    public canceladaEm: Date | null,
  ) {}

  cancelar(): void {
    if (this.status === 'CANCELADA') {
      throw new Error('Reserva já está cancelada.');
    }
    this.status = 'CANCELADA';
    this.canceladaEm = new Date();
  }

  estaAtiva(): boolean {
    return this.status === 'CONFIRMADA';
  }
}

export class FilaDeEspera {
  constructor(
    public readonly id: string,
    public membroId: string,
    public aulaAgendadaId: string,
    public posicao: number,
    public readonly criadaEm: Date,
    public notificado: boolean,
  ) {}
}