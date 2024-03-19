import { z } from 'zod';

export const groupExpenseFormSchema = z.object({
  description: z.string(),
  amount: z.number().positive(),
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
