import { TransactionType } from '@prisma/client';
import RegisterTransaction from '~/app/dashboard/my-expenses/register-transaction/register-transaction';
import { api } from '~/trpc/server';

export default async function DashboardRegisterPersonalIncome() {
  const [tags, user] = await Promise.all([
    api.tags.all.query({
      type: TransactionType.INCOME,
    }),
    api.users.get.query(),
  ]);
  const weekStartsOn = user?.weekStartsOn ?? 1;
  const timezone = user?.timezone ?? 'Europe/Amsterdam';

  return (
    <RegisterTransaction
      timezone={timezone}
      weekStartsOn={weekStartsOn}
      tags={tags.map((t) => ({ ...t, text: t.name }))}
      target={TransactionType.INCOME}
      descriptions={descriptions}
      title="Register income"
    />
  );
}

const descriptions = ['Income', 'Settlements', 'Rent', 'Dinner'];

export const dynamic = 'force-dynamic';
