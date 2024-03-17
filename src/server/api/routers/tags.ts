import { TransactionType } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';

export const tagsRouter = createTRPCRouter({
  all: privateProcedure
    .input(z.object({ type: z.nativeEnum(TransactionType) }))
    .query(({ ctx: { db, user }, input: { type } }) => {
      return db.tag.findMany({
        where: {
          createdBy: user,
          TransactionsTags: {
            some: {
              transaction: {
                type,
              },
            },
          },
        },
      });
    }),

  update: privateProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(({ ctx: { db, user }, input: { id, name } }) => {
      return db.tag.update({
        where: {
          createdBy: user,
          id,
        },
        data: {
          name,
        },
      });
    }),

  delete: privateProcedure.input(z.object({ id: z.string() })).mutation(({ ctx: { db, user }, input: { id } }) => {
    return db.tag.delete({
      where: {
        createdBy: user,
        id,
      },
      include: {
        TransactionsTags: true,
      },
    });
  }),
});
