export class TipoAula {
  constructor(
    public readonly id: string,
    public nome: string,
    public descricao: string | null,
    public readonly createdAt: Date,
  ) {}
}