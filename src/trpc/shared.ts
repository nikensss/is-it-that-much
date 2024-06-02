import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';

import { type AppRouter } from '~/server/api/root';

export const transformer = superjson;

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function getUrl() {
  return getBaseUrl() + '/api/trpc';
}

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const groupSettlementFormSchema = z
  .object({
    settlementId: z.string().cuid().nullable(),
    amount: z.number().min(0.01),
    date: z.date(),
    groupId: z.string().cuid(),
    fromId: z.string().cuid(),
    toId: z.string().cuid(),
  })
  .superRefine((data, ctx) => {
    if (data.fromId === data.toId) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sender and receiver must be different',
      });
    }
  });

export const groupExpenseFormSchema = z.object({
  expenseId: z.string().cuid().nullable(),
  description: z.string().min(1, 'Description must be at least 1 character'),
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.date(),
  groupId: z.string().cuid(),
  createdById: z.string().cuid(),
  tags: z.array(
    z.object({
      id: z.string(),
      text: z.string().min(1, 'Tag must be at least 1 character').max(20, 'Tag must be at most 20 characters'),
    }),
  ),
  splits: z.array(
    z.object({
      userId: z.string().cuid(),
      paid: z.number().min(0),
      owed: z.number().min(0),
    }),
  ),
});

export const triggersFormSchema = z.object({
  triggers: z
    .array(
      z.object({
        triggerId: z.string().cuid().nullable(),
        target: z.string().min(1, 'Target must be at least 1 character'),
        description: z.string(),
        tags: z.string().max(300, 'Too many tags'),
      }),
    )
    .superRefine((triggers, context) => {
      for (let i = 0; i < triggers.length; i++) {
        if (triggers[i]?.description.trim().length === 0 && triggers[i]?.tags.trim().length === 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Description or tags must be provided',
            path: [i, 'description'],
          });

          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Description or tags must be provided',
            path: [i, 'tags'],
          });
        }

        for (let j = i + 1; j < triggers.length; j++) {
          if (triggers[i]?.target === triggers[j]?.target) {
            // return { message: 'target must be unique', path: [j, 'target'] };
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Target must be unique',
              path: [j, 'target'],
            });
          }
        }
      }
    }),
});
