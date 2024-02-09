import RegisterAmount from '~/app/dashboard/my-expenses/register-amount';
import { api } from '~/trpc/server';

export default async function DashboardRegisterPersonalIncome() {
  const tags = await api.tags.incomes.query();

  return (
    <RegisterAmount
      tags={tags.map((t) => ({ ...t, text: t.name }))}
      target="incomes"
      descriptions={descriptions}
      title="Register income"
    />
  );
}

const descriptions = ['Income', 'Settlements', 'Rent', 'Dinner'];
