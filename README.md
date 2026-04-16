# 🏋️ Ed's Gym — Sistema de Reserva de Aulas

## 🎥 Vídeo de Demonstração
[![Assistir Demonstração](https://img.shields.io/badge/▶_Assistir-YouTube-red?style=for-the-badge)](SEU_LINK_AQUI)

---

## 📋 Sobre o Projeto
Sistema fullstack de reserva de aulas para a academia Ed's Gym.
Permite que administradores cadastrem aulas e gerenciem reservas de membros.

## 🚀 Tecnologias
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, SQLite
- **Frontend:** React, Vite
- **Arquitetura:** Clean Architecture (Domain, Application, Infrastructure, Interface)

## ⚙️ Como Rodar

### Pré-requisitos
- Node.js 18+
- npm

### Backend
cd apps/backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
# Servidor em http://localhost:3001

### Frontend
cd apps/frontend
npm install
npm run dev
# Interface em http://localhost:5173

## 🔑 Acesso
| Usuário | E-mail | Senha |
|---|---|---|
| Admin Academia | ed@edsgym.com | senha123 |

## 🗺️ Rotas da API
| Método | Rota | Descrição |
|---|---|---|
| POST | /api/auth/login | Autenticação |
| GET/POST | /api/tipos-aula | CRUD Tipos de Aula |
| GET/POST | /api/aulas-agendadas | CRUD Aulas |
| GET/POST | /api/users | CRUD Usuários |
| POST | /api/reservas | Criar reserva (RF-02) |
| DELETE | /api/reservas/:id/cancelar | Cancelar reserva (RF-04) |
| GET | /api/fila-espera/aula/:id | Ver fila de espera (RF-03) |

## ✅ O que foi implementado nesta versão (v3.0.0-rec)

### Corrigido/Implementado em relação às entregas anteriores:
- ✅ Persistência real via Prisma ORM + SQLite (sem dados em memória)
- ✅ CRUD completo para todas as entidades
- ✅ Sistema de reservas com controle transacional de vagas
- ✅ Fila de espera automática quando aula está lotada (RF-03)
- ✅ Cancelamento com promoção automática da fila (RF-04/RF-05)
- ✅ Optimistic Locking no contador de vagas (RNF-01)
- ✅ Job assíncrono para processar fila de espera (RNF-02)
- ✅ Interface React consumindo dados reais da API
- ✅ Tela de login com autenticação via banco de dados
