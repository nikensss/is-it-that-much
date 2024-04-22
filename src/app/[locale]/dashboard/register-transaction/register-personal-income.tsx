import { TransactionType } from '@prisma/client';
import RegisterTransaction from '~/app/[locale]/dashboard/register-transaction/register-transaction.client';
import { api } from '~/trpc/server';

export default async function DashboardRegisterPersonalIncome() {
  const [tags, user] = await Promise.all([
    api.tags.all.query({
      type: TransactionType.INCOME,
    }),
    api.users.get.query(),
  ]);
  const weekStartsOn = user.weekStartsOn ?? 1;
  const timezone = user.timezone ?? 'Europe/Amsterdam';

  return (
    <RegisterTransaction
      currency={user.currency}
      timezone={timezone}
      weekStartsOn={weekStartsOn}
      tags={tags.map((t) => ({ ...t, text: t.name }))}
      transactionType={TransactionType.INCOME}
      descriptions={descriptions}
    />
  );
}

const descriptions = ['Income', 'Settlements', 'Rent', 'Dinner'];

export const dynamic = 'force-dynamic';
