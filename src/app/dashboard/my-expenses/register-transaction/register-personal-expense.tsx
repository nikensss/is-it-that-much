import RegisterTransaction from '~/app/dashboard/my-expenses/register-transaction/register-transaction';
import { api } from '~/trpc/server';

export default async function DashboardRegisterPersonalExpense() {
  const tags = await api.tags.expenses.query();

  return (
    <RegisterTransaction
      tags={tags.map((t) => ({ ...t, text: t.name }))}
      target="expenses"
      descriptions={descriptions}
      title="Register expense"
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
