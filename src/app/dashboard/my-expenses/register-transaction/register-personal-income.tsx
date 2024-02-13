import RegisterTransaction from '~/app/dashboard/my-expenses/register-transaction/register-transaction';
import { api } from '~/trpc/server';

export default async function DashboardRegisterPersonalIncome() {
  const tags = await api.tags.incomes.query();

  return (
    <RegisterTransaction
      tags={tags.map((t) => ({ ...t, text: t.name }))}
      target="incomes"
      descriptions={descriptions}
      title="Register income"
    />
  );
}

const descriptions = ['Income', 'Settlements', 'Rent', 'Dinner'];

export const dynamic = 'force-dynamic';
