/**
 * ProcessarFilaDeEsperaJob
 *
 * Responsável pelo RF-05 e RNF-02 (Desafio C1).
 * Quando um membro cancela, este job:
 * 1. Pega o próximo da fila de espera
 * 2. Tenta reservar a vaga para ele (com optimistic locking)
 * 3. "Envia" um e-mail de notificação (simulado via console)
 *
 * É executado de forma ASSÍNCRONA via setImmediate (não bloqueia a resposta HTTP).
 */

import {
  IReservaRepository,
  IAulaAgendadaRepository,
  IFilaDeEsperaRepository,
  IUserRepository,
} from '../../domain/repositories/IRepositories';

interface Repos {
  reservaRepo: IReservaRepository;
  aulaRepo: IAulaAgendadaRepository;
  filaRepo: IFilaDeEsperaRepository;
  userRepo: IUserRepository;
}

export async function processarFilaDeEspera(aulaAgendadaId: string, repos: Repos): Promise<void> {
  const { reservaRepo, aulaRepo, filaRepo, userRepo } = repos;

  console.log(`[JOB] Processando fila de espera para aula ${aulaAgendadaId}...`);

  // Busca o próximo da fila
  const proximo = await filaRepo.findProximo(aulaAgendadaId);
  if (!proximo) {
    console.log('[JOB] Fila de espera vazia. Nenhuma ação necessária.');
    return;
  }

  // Busca a aula novamente para ter a versão mais recente
  const aula = await aulaRepo.findById(aulaAgendadaId);
  if (!aula || !aula.temVagasDisponiveis()) {
    console.log('[JOB] Sem vagas disponíveis para promover da fila.');
    return;
  }

  // Tenta decrementar a vaga com optimistic locking
  const atualizado = await aulaRepo.updateComVersionamento(
    aulaAgendadaId,
    aula.version,
    { vagasDisponiveis: aula.vagasDisponiveis - 1, version: aula.version + 1 },
  );

  if (!atualizado) {
    // Conflito de concorrência: agenda nova tentativa
    console.log('[JOB] Conflito de versão. Tentando novamente em 500ms...');
    setTimeout(() => processarFilaDeEspera(aulaAgendadaId, repos).catch(console.error), 500);
    return;
  }

  // Cria a reserva para o membro da fila
  const novaReserva = await reservaRepo.create({
    membroId: proximo.membroId,
    aulaAgendadaId,
  });

  // Remove da fila
  await filaRepo.remover(proximo.id);

  // Simula envio de e-mail (RF-05 / Desafio C1)
  const membro = await userRepo.findById(proximo.membroId);
  if (membro) {
    await enviarEmailNotificacao(membro.email, membro.nome, aulaAgendadaId);
  }

  console.log(
    `[JOB] ✅ Reserva criada (${novaReserva.id}) para membro ${proximo.membroId} da fila de espera.`,
  );
}

/**
 * Simulação de envio de e-mail.
 * Em produção: integrar com nodemailer, SendGrid, AWS SES, etc.
 */
async function enviarEmailNotificacao(email: string, nome: string, aulaId: string): Promise<void> {
  // Simula delay de envio de e-mail
  await new Promise((resolve) => setTimeout(resolve, 100));

  console.log('─────────────────────────────────────────');
  console.log(`[EMAIL] Para: ${email}`);
  console.log(`[EMAIL] Assunto: 🎉 Vaga disponível na sua aula!`);
  console.log(`[EMAIL] Corpo:`);
  console.log(`  Olá, ${nome}!`);
  console.log(`  Uma vaga abriu na aula ${aulaId}.`);
  console.log(`  Sua reserva foi confirmada automaticamente.`);
  console.log('─────────────────────────────────────────');
}