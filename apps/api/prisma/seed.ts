import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@devboard.local';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const hash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email,
      passwordHash: hash,
      boards: {
        create: {
          title: 'My First Board',
          columns: {
            create: [
              {
                title: 'Todo',
                order: 0,
                cards: {
                  create: [
                    {
                      title: 'Set up project',
                      description: 'Initialize repo',
                      order: 0,
                      priority: 'HIGH',
                    },
                  ],
                },
              },
              {
                title: 'In Progress',
                order: 1,
              },
              {
                title: 'Done',
                order: 2,
              },
            ],
          },
        },
      },
    },
  });
  console.log('Seeded demo user', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
