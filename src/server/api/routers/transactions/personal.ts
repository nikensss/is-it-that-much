import { auth } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { TransactionType } from '@prisma/client';
import { endOfMonth, startOfMonth } from 'date-fns';
import { getTimezoneOffset, utcToZonedTime } from 'date-fns-tz';
import { log } from 'next-axiom';
import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const personalTransactionsRouter = createTRPCRouter({
  all: publicProcedure.input(z.object({ type: z.nativeEnum(TransactionType) })).query(({ ctx, input: { type } }) => {
    const { userId } = auth();
    if (!userId) throw new Error('Not authenticated');

    return ctx.db.personalTransaction.findMany({
      where: {
        user: {
          externalId: userId,
        },
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

  period: publicProcedure
    .input(
      z.object({
        type: z.nativeEnum(TransactionType),
        from: z.date().nullish(),
        to: z.date().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId } = auth();
      if (!userId) throw new Error('Not authenticated');

      const user = await ctx.db.user.findUnique({
        where: {
          externalId: userId,
        },
        select: {
          timezone: true,
        },
      });

      const timezone = user?.timezone ?? 'Europe/Amsterdam';
      const now = utcToZonedTime(Date.now(), timezone);
      const preferredTimezoneOffset = getTimezoneOffset(timezone);
      const localeTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
      const from = new Date(startOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);
      const to = new Date(endOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);

      return ctx.db.transaction.findMany({
        where: {
          date: {
            gte: input?.from ?? from,
            lte: input?.to ?? to,
          },
          type: input.type,
          PersonalTransaction: {
            user: {
              externalId: userId,
            },
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

  totalAmountInMonth: publicProcedure
    .input(
      z.object({
        type: z.nativeEnum(TransactionType),
        date: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId } = auth();
      if (!userId) throw new Error('Not authenticated');

      const user = await ctx.db.user.findUnique({
        where: {
          externalId: userId,
        },
        select: {
          timezone: true,
        },
      });

      const timezone = user?.timezone ?? 'Europe/Amsterdam';
      const now = utcToZonedTime(input.date ?? Date.now(), timezone);
      const preferredTimezoneOffset = getTimezoneOffset(timezone);
      const localeTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
      const from = new Date(startOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);
      const to = new Date(endOfMonth(now).getTime() - preferredTimezoneOffset - localeTimezoneOffset);

      return ctx.db.transaction.aggregate({
        where: {
          date: {
            gte: from,
            lte: to,
          },
          type: input.type,
          PersonalTransaction: {
            user: {
              externalId: userId,
            },
          },
        },
        _sum: {
          amount: true,
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        type: z.nativeEnum(TransactionType),
        amount: z.number().positive(),
        date: z.date().default(() => new Date()),
        description: z.string().min(1),
        tags: z.array(z.string().min(3).max(50)),
      }),
    )
    .mutation(async ({ ctx, input: { amount, date, description, type, tags } }) => {
      try {
        const user = await currentUser();
        if (!user) throw new Error('Not authenticated');

        const createdById = user.externalId;
        if (!createdById) throw new Error('User has no externalId');

        await ctx.db.tag.createMany({
          data: tags.map((name) => ({ name, createdById })),
          skipDuplicates: true,
        });

        const dbTags = await ctx.db.tag.findMany({
          where: {
            createdById,
            name: { in: tags },
          },
        });

        return ctx.db.personalTransaction.create({
          data: {
            user: { connect: { externalId: user.id } },
            transaction: {
              create: {
                amount: parseInt(amount.toFixed(2)) * 100,
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
          externalUserId: auth().userId,
          tags,
        });
        return null;
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive(),
        date: z.date().default(() => new Date()),
        description: z.string().min(1),
        tags: z.array(z.string().min(3).max(50)),
      }),
    )
    .mutation(async ({ ctx, input: { id, amount, date, description, tags } }) => {
      try {
        const user = await currentUser();
        if (!user) throw new Error('Not authenticated');

        const createdById = user.externalId;
        if (!createdById) throw new Error('User has no externalId');

        // delete all the tags the transaction has
        await ctx.db.transactionsTags.deleteMany({ where: { transactionId: id } });

        // ensure all the tags for this transaction exist
        await ctx.db.tag.createMany({
          data: tags.map((name) => ({ name, createdById })),
          skipDuplicates: true,
        });

        const dbTags = await ctx.db.tag.findMany({
          where: {
            createdById,
            name: { in: tags },
          },
        });

        await ctx.db.transactionsTags.createMany({
          data: dbTags.map((tag) => ({ tagId: tag.id, transactionId: id })),
        });

        return ctx.db.personalTransaction.update({
          where: { transactionId: id },
          data: {
            transaction: {
              update: {
                amount: parseInt(amount.toFixed(2)) * 100,
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
          externalUserId: auth().userId,
          tags,
        });
        return null;
      }
    }),

  recent: publicProcedure
    .input(
      z.object({
        type: z.nativeEnum(TransactionType),
      }),
    )
    .query(async ({ ctx, input: { type } }) => {
      const user = auth();

      if (!user?.userId) return [];

      return ctx.db.personalTransaction.findMany({
        where: {
          user: {
            externalId: user.userId,
          },
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

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input: { id } }) => {
    const user = await currentUser();
    try {
      if (!user) throw new Error('Not authenticated');

      return ctx.db.transaction.delete({
        where: {
          id,
          PersonalTransaction: {
            user: {
              externalId: user.id,
            },
          },
        },
      });
    } catch (error) {
      log.error('could not delete personal transaction', {
        id,
        error,
        externalUserId: user?.id,
        userId: user?.externalId,
      });
      return null;
    }
  }),
});
