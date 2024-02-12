import type { User } from '@prisma/client';
import { db } from '../src/server/db';
import { addDays, startOfMonth } from 'date-fns';

async function main() {
  console.log({ email: process.env.EMAIL });
  const user = await db.user.findUnique({ where: { email: process.env.EMAIL } });
  if (!user) throw new Error('User not found');

  const dates: Date[] = [];
  for (let i = 0; i < 20; i++) {
    const start = startOfMonth(new Date());
    if (i < 2) {
      dates.push(addDays(start, i));
      continue;
    }

    if (i < 5) {
      dates.push(addDays(start, 3));
      continue;
    }

    if (i < 10) {
      dates.push(addDays(start, 5));
      continue;
    }

    if (i < 15) {
      dates.push(addDays(start, 10));
      continue;
    }

    dates.push(addDays(start, i));
  }

  const expenses = [
    {
      tags: ['food', 'restaurant'],
      amount: 30,
      date: dates[0],
      description: 'Lunch',
    },
    {
      tags: ['sports', 'padel'],
      amount: 15,
      date: dates[1],
      description: 'Padel',
    },
    {
      tags: ['sports', 'gym'],
      amount: 30,
      date: dates[2],
      description: 'Gym',
    },
    {
      tags: ['food', 'ordering'],
      amount: 20,
      date: dates[3],
      description: 'Dinner',
    },
    {
      tags: ['food', 'groceries', 'shared'],
      amount: 15,
      date: dates[4],
      description: 'Lunch',
    },
    {
      tags: ['dentist', 'health'],
      amount: 30,
      date: dates[5],
      description: 'Dentist cleaning',
    },
    {
      tags: ['household', 'shared'],
      amount: 70,
      date: dates[6],
      description: 'Internet',
    },
    {
      tags: ['household', 'shared'],
      amount: 180,
      date: dates[7],
      description: 'Electricity',
    },
    {
      tags: ['sports', 'padel'],
      amount: 15,
      date: dates[9],
      description: 'Padel',
    },
    {
      tags: ['phone'],
      amount: 30,
      date: dates[10],
      description: 'Phone subscription',
    },
    {
      tags: ['leisure', 'shared'],
      amount: 12,
      date: dates[11],
      description: 'Netflix',
    },
    {
      tags: ['leisure', 'shared'],
      amount: 4,
      date: dates[12],
      description: 'HBO Max',
    },
    {
      tags: ['food', 'restaurant', 'shared'],
      amount: 50,
      date: dates[13],
      description: 'Dinner',
    },
    {
      tags: ['leisure', 'shared', 'cinema'],
      amount: 50,
      date: dates[14],
      description: 'Oppenheimer',
    },
    {
      tags: ['sports', 'padel'],
      amount: 15,
      date: dates[15],
      description: 'Padel',
    },
    {
      tags: ['sports', 'bouldering'],
      amount: 120,
      date: dates[16],
      description: 'Bouldering x10 pass',
    },
    {
      tags: ['health'],
      amount: 140,
      date: dates[17],
      description: 'Health insurance',
    },
    {
      tags: ['groceires', 'shared'],
      amount: 45,
      date: dates[18],
      description: 'Groceries',
    },
    {
      tags: ['food', 'restaurant'],
      amount: 9,
      date: dates[19],
      description: "McDonald's",
    },
  ];

  for (const expense of expenses) {
    await createExpense({ user, ...expense });
  }

  console.log('Expenses created');
}

type CreateExpenseParams = {
  user: User;
  tags: string[];
  amount: number;
  date?: Date;
  description: string;
};

async function createExpense({ user, tags, amount, date, description }: CreateExpenseParams) {
  const createdById = user.id;
  if (!createdById) throw new Error('User id is required');
  if (!date) throw new Error('Date is required');

  await db.tag.createMany({
    data: tags.map((name) => ({ name, createdById })),
    skipDuplicates: true,
  });

  const dbTags = await db.tag.findMany({
    where: {
      createdById,
      name: { in: tags },
    },
  });

  return db.personalExpense.create({
    data: {
      user: { connect: { id: user.id } },
      expense: {
        create: {
          amount: parseInt(amount.toFixed(2).replace('.', '')),
          date,
          description,
          ExpensesTags: {
            createMany: {
              data: dbTags.map((tag) => ({ tagId: tag.id })),
            },
          },
        },
      },
    },
  });
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
