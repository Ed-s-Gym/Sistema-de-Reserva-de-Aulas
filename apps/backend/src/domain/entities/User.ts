export type UserRole = 'ADMIN_SISTEMA' | 'ADMIN_ACADEMIA' | 'MEMBRO';

export class User {
  constructor(
    public readonly id: string,
    public nome: string,
    public email: string,
    public senha: string,
    public role: UserRole,
    public readonly createdAt: Date,
  ) {}

  isAdmin(): boolean {
    return this.role === 'ADMIN_ACADEMIA' || this.role === 'ADMIN_SISTEMA';
  }

  isMembro(): boolean {
    return this.role === 'MEMBRO';
  }
}

/*
export class User {
    private id: string;
    public name: string;
    public email: string;

    constructor(id: string, name: string, email: string) {
        this.id = id || "new-id-" + Date.now();
        this.name = name;
        this.email = email;
    }

    public getId(): string {
        return this.id;
    }

    public getName(): string {
        return this.name;
    }

    public getEmail(): string {
        return this.email;
    }

    public isVipUser(): boolean {
        return this.email.endsWith('@vip.com');
    }
}
*/