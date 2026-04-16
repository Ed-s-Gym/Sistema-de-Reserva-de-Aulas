import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  await prisma.filaDeEspera.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.aulaAgendada.deleteMany();
  await prisma.tipoAula.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Banco limpo.');

  // ── Tipos de Aula ─────────────────────────────────────────────────────────
  const spinning = await prisma.tipoAula.create({ data: { nome: 'Spinning', descricao: 'Ciclismo indoor de alta intensidade' } });
  const yoga     = await prisma.tipoAula.create({ data: { nome: 'Yoga', descricao: 'Prática de equilíbrio entre corpo e mente' } });
  const crossfit = await prisma.tipoAula.create({ data: { nome: 'CrossFit', descricao: 'Treinamento funcional de alta intensidade' } });
  const pilates  = await prisma.tipoAula.create({ data: { nome: 'Pilates', descricao: 'Fortalecimento e flexibilidade do core' } });
  const muay     = await prisma.tipoAula.create({ data: { nome: 'Muay Thai', descricao: 'Arte marcial tailandesa' } });
  console.log('🏷️ Tipos de aula criados.');

  // ── Datas ─────────────────────────────────────────────────────────────────
  const d = (diasOffset: number, hora: number, min: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + diasOffset);
    date.setHours(hora, min, 0, 0);
    return date;
  };

  // ── Aulas Agendadas (todas com vagas cheias — nenhuma reserva) ────────────
  await prisma.aulaAgendada.createMany({
    data: [
      { tipoAulaId: spinning.id, dataHoraInicio: d(1, 18), dataHoraFim: d(1, 19), limiteVagas: 20, vagasDisponiveis: 20, local: 'Sala de Spinning', instrutor: 'Prof. Ricardo' },
      { tipoAulaId: yoga.id,     dataHoraInicio: d(2,  7), dataHoraFim: d(2,  8), limiteVagas: 15, vagasDisponiveis: 15, local: 'Sala de Yoga',     instrutor: 'Prof. Ana' },
      { tipoAulaId: crossfit.id, dataHoraInicio: d(3,  6), dataHoraFim: d(3,  7), limiteVagas: 15, vagasDisponiveis: 15, local: 'Área CrossFit',    instrutor: 'Prof. Bruno' },
      { tipoAulaId: pilates.id,  dataHoraInicio: d(4,  9), dataHoraFim: d(4, 10), limiteVagas: 10, vagasDisponiveis: 10, local: 'Sala de Pilates',  instrutor: 'Prof. Carla' },
      { tipoAulaId: muay.id,     dataHoraInicio: d(5, 20), dataHoraFim: d(5, 21), limiteVagas: 12, vagasDisponiveis: 12, local: 'Sala de Artes Marciais', instrutor: 'Prof. Marcos' },
    ],
  });
  console.log('📅 Aulas agendadas criadas.');

  // ── Admin padrão ──────────────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash('senha123', 10);
  await prisma.user.create({ data: { nome: 'Ed Silva', email: 'ed@edsgym.com', senha: senhaHash, role: 'ADMIN_ACADEMIA' } });
  console.log('👤 Admin criado: ed@edsgym.com / senha123');

  console.log('\n✅ Seed concluído! Banco pronto para demonstração.');
}

main()
  .catch((e) => { console.error('❌ Erro:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });