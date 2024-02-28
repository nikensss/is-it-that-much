import { TransactionType } from '@prisma/client';
import RegisterTransaction from '~/app/dashboard/register-transaction/register-transaction';
import { api } from '~/trpc/server';

export default async function DashboardRegisterPersonalExpense() {
  const [tags, user] = await Promise.all([
    api.tags.all.query({ type: TransactionType.EXPENSE }),
    api.users.get.query(),
  ]);
  const weekStartsOn = user?.weekStartsOn ?? 1;
  const timezone = user?.timezone ?? 'Europe/Amsterdam';

  return (
    <RegisterTransaction
      timezone={timezone}
      weekStartsOn={weekStartsOn}
      tags={tags}
      transactionType={TransactionType.EXPENSE}
      descriptions={descriptions}
    />
  );
}

const descriptions = [
  'Actors',
  'Adventures',
  'Appliances',
  'Apps',
  'Cafes',
  'Car',
  'Concerts',
  'Conferences',
  'Costumes',
  'Electronics',
  'Exhibitions',
  'Festivals',
  'Fitness',
  'Food',
  'Games',
  'Gaming',
  'Gas',
  'Groceries',
  'Holidays',
  'Insurances',
  'Internet',
  'Movies',
  'Museums',
  'Music',
  'Netflix',
  'Parties',
  'Phone',
  'Rent',
  'Restaurants',
  'Savings',
  'Seminars',
  'Shows',
  'Snacks',
  'Sports',
  'Sweets',
  'Taxes',
  'Training',
  'Trips',
  'University',
  'Vacations',
  'Water',
  'Webinars',
  'Workshops',
];

export const dynamic = 'force-dynamic';
