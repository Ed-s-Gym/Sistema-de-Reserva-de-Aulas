-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBRO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tipos_aula" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "aulas_agendadas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoAulaId" TEXT NOT NULL,
    "dataHoraInicio" DATETIME NOT NULL,
    "dataHoraFim" DATETIME NOT NULL,
    "limiteVagas" INTEGER NOT NULL,
    "vagasDisponiveis" INTEGER NOT NULL,
    "local" TEXT,
    "instrutor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AGENDADA',
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "aulas_agendadas_tipoAulaId_fkey" FOREIGN KEY ("tipoAulaId") REFERENCES "tipos_aula" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membroId" TEXT NOT NULL,
    "aulaAgendadaId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMADA',
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canceladaEm" DATETIME,
    CONSTRAINT "reservas_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservas_aulaAgendadaId_fkey" FOREIGN KEY ("aulaAgendadaId") REFERENCES "aulas_agendadas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "fila_de_espera" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "membroId" TEXT NOT NULL,
    "aulaAgendadaId" TEXT NOT NULL,
    "posicao" INTEGER NOT NULL,
    "criadaEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "fila_de_espera_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fila_de_espera_aulaAgendadaId_fkey" FOREIGN KEY ("aulaAgendadaId") REFERENCES "aulas_agendadas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_aula_nome_key" ON "tipos_aula"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "reservas_membroId_aulaAgendadaId_key" ON "reservas"("membroId", "aulaAgendadaId");

-- CreateIndex
CREATE UNIQUE INDEX "fila_de_espera_membroId_aulaAgendadaId_key" ON "fila_de_espera"("membroId", "aulaAgendadaId");
