'use client';

import RegisterAmount from '~/app/dashboard/my-expenses/register-amount';

export default function DashboardRegisterPersonalIncome() {
  return <RegisterAmount target="incomes" descriptions={descriptions} title="Register income" />;
}

const descriptions = ['Income', 'Settlements', 'Rent', 'Dinner'];
