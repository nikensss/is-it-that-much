import { TransactionType } from '@prisma/client';
import { endOfMonth, startOfMonth } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { log } from 'next-axiom';
import { z } from 'zod';
import { toCents } from '~/lib/utils.client';
import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';

export const personalTransactionsRouter = createTRPCRouter({
  all: privateProcedure
    .input(z.object({ type: z.nativeEnum(TransactionType) }))
    .query(({ ctx: { db, user }, input: { type } }) => {
      return db.personalTransaction.findMany({
        where: {
          userId: user.id,
          transaction: {
            type,
          },
        },
        orderBy: {
          transaction: {
            date: 'desc',
          },
        },
        include: {
          transaction: {
            include: {
              TransactionsTags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      });
    }),

  period: privateProcedure
    .input(
      z.object({
        type: z.nativeEnum(TransactionType),
        from: z.date().nullish(),
        to: z.date().nullish(),
      }),
    )
    .query(async ({ ctx: { db, user }, input }) => {
      const t = toZonedTime(Date.now(), user.timezone ?? 'Europe/Amsterdam');
      const from = fromZonedTime(startOfMonth(t), user.timezone ?? 'Europe/Amsterdam');
      const to = fromZonedTime(endOfMonth(t), user.timezone ?? 'Europe/Amsterdam');

      return db.transaction.findMany({
        where: {
          date: {
            gte: input.from ?? from,
            lte: input.to ?? to,
          },
          type: input.type,
          PersonalTransaction: {
            userId: user.id,
          },
        },
        orderBy: {
          date: 'desc',
        },
        include: {
          TransactionsTags: {
            include: {
              tag: true,
            },
          },
        },
      });
    }),

  totalAmountInMonth: privateProcedure
    .input(
      z.object({
        type: z.nativeEnum(TransactionType),
        date: z.date().nullish(),
      }),
    )
    .query(async ({ ctx: { db, user }, input: { type, date } }) => {
      const t = toZonedTime(date?.getTime() ?? Date.now(), user.timezone ?? 'Europe/Amsterdam');
      const from = fromZonedTime(startOfMonth(t), user.timezone ?? 'Europe/Amsterdam');
      const to = fromZonedTime(endOfMonth(t), user.timezone ?? 'Europe/Amsterdam');

      return db.transaction.aggregate({
        where: {
          date: {
            gte: from,
            lte: to,
          },
          type,
          PersonalTransaction: {
            userId: user.id,
          },
        },
        _sum: {
          amount: true,
        },
      });
    }),

  create: privateProcedure
    .input(
      z.object({
        type: z.nativeEnum(TransactionType),
        amount: z.number().positive(),
        date: z.date().default(() => new Date()),
        description: z.string().min(1),
        tags: z.array(z.string().min(3).max(50)),
      }),
    )
    .mutation(async ({ ctx: { db, user }, input: { amount, date, description, type, tags } }) => {
      try {
        await db.tag.createMany({
          data: tags.map((name) => ({ name, createdById: user.id })),
          skipDuplicates: true,
        });

        const dbTags = await db.tag.findMany({
          where: {
            createdById: user.id,
            name: { in: tags },
          },
        });

        return db.personalTransaction.create({
          data: {
            user: { connect: { id: user.id } },
            transaction: {
              create: {
                amount: toCents(amount),
                date,
                description,
                type,
                TransactionsTags: {
                  createMany: {
                    data: dbTags.map((tag) => ({ tagId: tag.id })),
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        log.error(`could not create personal transaction (${type})`, {
          amount,
          description,
          error,
          userId: user.id,
          tags,
        });
        return null;
      }
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive(),
        date: z.date().default(() => new Date()),
        description: z.string().min(1),
        tags: z.array(z.string().min(3).max(50)),
      }),
    )
    .mutation(async ({ ctx: { db, user }, input: { id, amount, date, description, tags } }) => {
      try {
        // delete all the tags the transaction has
        await db.transactionsTags.deleteMany({ where: { transactionId: id } });

        // ensure all the tags for this transaction exist
        await db.tag.createMany({
          data: tags.map((name) => ({ name, createdById: user.id })),
          skipDuplicates: true,
        });

        const dbTags = await db.tag.findMany({
          where: {
            createdById: user.id,
            name: { in: tags },
          },
        });

        await db.transactionsTags.createMany({
          data: dbTags.map((tag) => ({ tagId: tag.id, transactionId: id })),
        });

        return db.personalTransaction.update({
          where: { transactionId: id },
          data: {
            transaction: {
              update: {
                amount: toCents(amount),
                date,
                description,
              },
            },
          },
        });
      } catch (error) {
        log.error('could not update personal transaction', {
          id,
          amount,
          description,
          error,
          userId: user.id,
          tags,
        });
        return null;
      }
    }),

  recent: privateProcedure
    .input(
      z.object({
        type: z.nativeEnum(TransactionType),
      }),
    )
    .query(async ({ ctx: { db, user }, input: { type } }) => {
      return db.personalTransaction.findMany({
        where: {
          user,
          transaction: {
            type,
          },
        },
        take: 3,
        orderBy: {
          transaction: {
            date: 'desc',
          },
        },
        include: {
          transaction: {
            include: {
              TransactionsTags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
      });
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx: { db, user }, input: { id } }) => {
      try {
        return db.transaction.delete({
          where: {
            id,
            PersonalTransaction: {
              user,
            },
          },
        });
      } catch (error) {
        log.error('could not delete personal transaction', { id, error, userId: user.id });
        return null;
      }
    }),
});
