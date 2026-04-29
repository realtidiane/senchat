import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@senchat.sn' },
    update: {},
    create: {
      email: 'alice@senchat.sn',
      password,
      displayName: 'Alice Diallo',
      bio: 'Développeuse à Dakar',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@senchat.sn' },
    update: {},
    create: {
      email: 'bob@senchat.sn',
      password,
      displayName: 'Bob Ndiaye',
      bio: 'Designer UI/UX',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@senchat.sn' },
    update: {},
    create: {
      email: 'charlie@senchat.sn',
      password,
      displayName: 'Charlie Sow',
      bio: 'Product Manager',
    },
  });

  const direct = await prisma.conversation.create({
    data: {
      type: 'DIRECT',
      members: {
        create: [
          { userId: alice.id, role: 'MEMBER' },
          { userId: bob.id, role: 'MEMBER' },
        ],
      },
    },
  });

  const group = await prisma.conversation.create({
    data: {
      type: 'GROUP',
      name: 'Equipe SenChat',
      members: {
        create: [
          { userId: alice.id, role: 'OWNER' },
          { userId: bob.id, role: 'ADMIN' },
          { userId: charlie.id, role: 'MEMBER' },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: direct.id,
        senderId: alice.id,
        type: 'TEXT',
        content: 'Salut Bob, comment ça va ?',
      },
      {
        conversationId: direct.id,
        senderId: bob.id,
        type: 'TEXT',
        content: 'Ça va bien ! Et toi ?',
      },
      {
        conversationId: group.id,
        senderId: alice.id,
        type: 'TEXT',
        content: 'Bienvenue dans le groupe SenChat !',
      },
      {
        conversationId: group.id,
        senderId: charlie.id,
        type: 'TEXT',
        content: 'Merci ! Content de rejoindre le projet.',
      },
    ],
  });

  console.log('Seed complete: 3 users, 2 conversations, 4 messages');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
