import { z } from 'zod';

export const groupExpenseFormSchema = z.object({
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
