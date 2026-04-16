import { IUserRepository } from '../../domain/repositories/IRepositories';
import { User } from '../../domain/entities/User';
import * as bcrypt from 'bcryptjs';

export interface CreateUserInputDTO {
  nome: string;
  email: string;
  senha: string;
  role?: 'ADMIN_ACADEMIA' | 'MEMBRO';
}

export interface CreateUserOutputDTO {
  id: string;
  nome: string;
  email: string;
  role: string;
  createdAt: Date;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserInputDTO): Promise<CreateUserOutputDTO> {
    // Verifica se email já existe
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error('E-mail já cadastrado.');
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const user = await this.userRepository.create({
      nome: dto.nome,
      email: dto.email,
      senha: senhaHash,
      role: dto.role ?? 'MEMBRO',
    });

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}