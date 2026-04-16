import { IUserRepository } from '../../../domain/repositories/IRepositories';
import { User, UserRole } from '../../../domain/entities/User';
import { prisma } from '../prismaClient'; 

export class PrismaUserRepository implements IUserRepository {
  private toEntity(raw: any): User {
    return new User(raw.id, raw.nome, raw.email, raw.senha, raw.role as UserRole, raw.createdAt);
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'isAdmin' | 'isMembro'>): Promise<User> {
    const created = await prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        role: data.role,
      },
    });
    return this.toEntity(created); 
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? this.toEntity(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map(this.toEntity);
  }

  async update(id: string, data: Partial<Pick<User, 'nome' | 'email' | 'role'>>): Promise<User> {
    const updated = await prisma.user.update({ where: { id }, data });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}