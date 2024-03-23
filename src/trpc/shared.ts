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
  description: z.string().min(3, 'Description must be at least 3 characters'),
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.date(),
  groupId: z.string().cuid(),
  createdById: z.string().cuid(),
  splits: z.array(
    z.object({
      userId: z.string().cuid(),
      paid: z.number().min(0),
      owed: z.number().min(0),
    }),
  ),
});
