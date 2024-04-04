import { createTRPCRouter, privateProcedure } from '~/server/api/trpc';

export const allGroupsSettlementsRouter = createTRPCRouter({
  recent: privateProcedure.query(async ({ ctx: { db, user } }) => {
    return db.settlement.findMany({
      where: {
        group: {
          UserGroup: {
            some: {
              user,
            },
          },
        },
      },
      include: {
        from: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        to: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }),
});
