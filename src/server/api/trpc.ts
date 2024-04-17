/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { auth } from '@clerk/nextjs/server';
import { TransactionType, type User } from '@prisma/client';
import { TRPCError, initTRPC } from '@trpc/server';
import { endOfMonth, startOfMonth } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import superjson from 'superjson';
import { ZodError, z } from 'zod';
import { createUserInDatabase } from '~/lib/utils.server';
import { db } from '~/server/db';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return { db, ...opts };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

export const privateProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { userId } = auth();
  if (!userId) throw new TRPCError({ code: 'FORBIDDEN' });

  const user = await ctx.db.user.findUnique({ where: { externalId: userId } });
  if (user) return next({ ctx: { user } });

  return next({ ctx: { user: await createUserInDatabase(userId) } });
});

export const personalTransactionProcedure = privateProcedure
  .input(z.object({ type: z.nativeEnum(TransactionType) }))
  .use(({ next, input: { type } }) => next({ ctx: { type } }));

const periodSchema = z.object({
  from: z.date().nullish(),
  to: z.date().nullish(),
});

function getPeriod(user: User, period: z.infer<typeof periodSchema>) {
  const t = toZonedTime(Date.now(), user.timezone ?? 'Europe/Amsterdam');
  const from = fromZonedTime(startOfMonth(t), user.timezone ?? 'Europe/Amsterdam');
  const to = fromZonedTime(endOfMonth(t), user.timezone ?? 'Europe/Amsterdam');

  return { from: period.from ?? from, to: period.to ?? to };
}

export const personalTransactionPeriodProcedure = personalTransactionProcedure
  .input(periodSchema)
  .use(async ({ ctx: { user }, input, next }) => next({ ctx: getPeriod(user, input) }));

export const groupProcedure = privateProcedure
  .input(z.object({ groupId: z.string().cuid() }))
  .use(async ({ ctx: { db, user }, input: { groupId: id }, next }) => {
    const isUserInGroup = await db.usersGroups.findFirst({ where: { groupId: id, userId: user.id } });
    if (!isUserInGroup) throw new TRPCError({ code: 'FORBIDDEN' });

    const group = await db.group.findFirst({
      where: { id },
      include: {
        UserGroup: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!group) throw new TRPCError({ code: 'BAD_REQUEST' });

    return next({ ctx: { group } });
  });

export const groupPeriodProcedure = groupProcedure
  .input(periodSchema)
  .use(async ({ ctx: { user }, input, next }) => next({ ctx: getPeriod(user, input) }));
