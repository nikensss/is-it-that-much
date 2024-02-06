'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/trpc/react';

export function DashboardRegisterExpense() {
  const router = useRouter();
  const [description, setDescription] = useState(getRandomDescription());
  const [amount, setAmount] = useState(0);

  const registerExpense = api.personalExpenses.register.useMutation({
    onSuccess: () => {
      router.refresh();
      setDescription(getRandomDescription());
      setAmount(0);
    },
  });

  const onSubmit = () => {
    return registerExpense.mutateAsync({
      description,
      amount,
    });
  };

  return (
    <div className="flex justify-center rounded-md bg-white p-4 shadow-md">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Register expense</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={description}
                  className="col-span-3"
                  minLength={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expense-amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="expense-amount"
                  type="number"
                  step={0.01}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  placeholder={`${amount}`}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Register expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getRandomDescription(): string {
  const descriptions = [
    'Groceries',
    'Rent',
    'Electricity',
    'Water',
    'Internet',
    'Phone',
    'Gas',
    'Car',
    'Health',
    'Insurance',
    'Taxes',
    'Savings',
    'Investments',
    'Entertainment',
    'Travel',
    'Education',
    'Clothing',
    'Furniture',
    'Electronics',
    'Appliances',
    'Home',
    'Garden',
    'Pets',
    'Gifts',
    'Donations',
    'Loans',
    'Subscriptions',
    'Memberships',
    'Music',
    'Movies',
    'Games',
    'Software',
    'Apps',
    'Food',
    'Drinks',
    'Takeout',
    'Fast Food',
    'Restaurants',
    'Bars',
    'Cafes',
    'Desserts',
    'Snacks',
    'Sweets',
    'Health',
    'Fitness',
    'Sports',
    'Hobbies',
    'Gaming',
    'Books',
    'Education',
    'School',
    'College',
    'University',
    'Courses',
    'Training',
    'Workshops',
    'Conferences',
    'Seminars',
    'Webinars',
    'Events',
    'Parties',
    'Celebrations',
    'Holidays',
    'Vacations',
    'Trips',
    'Adventures',
    'Podcasts',
    'Audiobooks',
    'Music',
    'Instruments',
    'Concerts',
    'Shows',
    'Festivals',
    'Exhibitions',
    'Museums',
    'Galleries',
    'Theater',
    'Cinema',
    'Movies',
    'Films',
    'TV',
    'Series',
    'Actors',
    'Directors',
    'Writers',
    'Producers',
    'Cinematography',
    'Music',
    'Costumes',
    'Makeup',
  ];

  return descriptions[Math.floor(Math.random() * descriptions.length)] ?? 'Concerts';
}
