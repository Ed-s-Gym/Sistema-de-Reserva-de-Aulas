# 🏋️ Ed's Gym — Sistema de Reserva de Aulas

## 🎥 Vídeo de Demonstração

[![Assistir](https://img.shields.io/badge/▶_Assistir-YouTube-red?style=for-the-badge&logo=youtube)](https://youtu.be/SSzcPf8K7l8)

> **Entrega P3 - Recuperação Final | Tag: `v3.0.0-rec`**  
> Disciplina: Desenvolvimento Web — Prof. Ronaldo Amaral  
> Curso: Engenharia de Computação — IFF Campos Centro

---

## 📋 Sobre o Projeto

Sistema fullstack de reserva de aulas para a academia **Ed's Gym**.  
Administradores cadastram aulas e gerenciam reservas. Membros reservam vagas e entram em fila de espera automaticamente quando a aula está lotada.

---

## 🚀 Tecnologias

| Camada | Tecnologias |
|---|---|
| Backend | Node.js, Express, TypeScript, Prisma ORM, SQLite |
| Frontend | React, Vite |
| Arquitetura | Clean Architecture (Domain, Application, Infrastructure, Interface) |

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- npm

### 1. Clone o repositório
```bash
git clone https://github.com/Edvander0764/Sistema-de-Reserva-de-Aulas.git
cd Sistema-de-Reserva-de-Aulas
```

### 2. Backend
```bash
cd apps/backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```
Servidor disponível em **http://localhost:3001**

### 3. Frontend
```bash
cd apps/frontend
npm install
npm run dev
```
Interface disponível em **http://localhost:5173**

---

## 🔑 Acesso ao Sistema

| Perfil | E-mail | Senha |
|---|---|---|
| Admin Academia | ed@edsgym.com | senha123 |

---

## 🗺️ Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Autenticação |
| GET/POST | `/api/tipos-aula` | Listar e criar tipos de aula |
| GET/PUT/DELETE | `/api/tipos-aula/:id` | Editar e excluir tipo de aula |
| GET/POST | `/api/aulas-agendadas` | Listar e criar aulas |
| GET/PUT/DELETE | `/api/aulas-agendadas/:id` | Editar e excluir aula |
| GET/POST | `/api/users` | Listar e criar usuários |
| GET/PUT/DELETE | `/api/users/:id` | Editar e excluir usuário |
| POST | `/api/reservas` | Criar reserva (RF-02) |
| DELETE | `/api/reservas/:id/cancelar` | Cancelar reserva (RF-04) |
| GET | `/api/reservas/membro/:id` | Reservas de um membro |
| GET | `/api/reservas/aula/:id` | Reservas de uma aula |
| GET | `/api/fila-espera/aula/:id` | Ver fila de espera (RF-03) |

---

## ✅ Requisitos Implementados

### Funcionais
- **RF-01** — Admin cadastra Aulas Agendadas com limite de vagas
- **RF-02** — Membro reserva lugar com validação de vagas disponíveis
- **RF-03** — Aula lotada entra automaticamente na Fila de Espera
- **RF-04** — Cancelamento de reserva devolve a vaga
- **RF-05** — Cancelamento promove automaticamente o próximo da fila

### Não Funcionais
- **RNF-01** — Optimistic Locking no contador de vagas (campo `version`)
- **RNF-02** — Fila de espera processada de forma assíncrona via `setImmediate`

---

## 📦 O que foi implementado nesta versão (v3.0.0-rec)

- ✅ Persistência real via Prisma ORM + SQLite (zero dados em memória)
- ✅ CRUD completo para todas as entidades refletindo no banco
- ✅ Lógica transacional de reservas com controle de concorrência
- ✅ Fila de espera com promoção automática e notificação simulada por e-mail
- ✅ Interface React consumindo dados reais da API
- ✅ Tela de login com autenticação via banco de dados
- ✅ Dashboard com estatísticas em tempo real
- ✅ Navegação fluida entre listagem e formulários de cadastro/edição
