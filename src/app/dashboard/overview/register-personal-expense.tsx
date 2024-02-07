'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/trpc/react';

export default function DashboardRegisterPersonalExpense() {
  const router = useRouter();
  const [description, setDescription] = useState(getRandomDescription());
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const registerExpense = api.personalExpenses.register.useMutation({
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsOpen(false),
    onSuccess: () => router.refresh(),
  });

  const resetForm = () => {
    setDescription(getRandomDescription());
    setAmount(0);
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={resetForm}>
          Register expense
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-md max-sm:w-11/12">
        <DialogHeader>
          <DialogTitle>Register expense</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            return registerExpense.mutate({ description, amount });
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-10 items-center gap-4">
              <Label htmlFor="description" className="col-span-3 text-right">
                Description
              </Label>
              <Input
                id="description"
                onChange={(e) => setDescription(e.target.value)}
                onFocus={(e) => e.target.select()}
                placeholder={description}
                className="col-span-7 text-[16px]"
                minLength={3}
              />
            </div>
            <div className="grid grid-cols-10 items-center gap-4">
              <Label htmlFor="expense-amount" className="col-span-3 text-right">
                Amount
              </Label>
              <Input
                id="expense-amount"
                type="number"
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                onFocus={(e) => e.target.select()}
                className="col-span-7 text-[16px]"
                step={0.01}
                min={0.01}
                value={amount}
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="m-4 h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getRandomDescription(): string {
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

  return descriptions[Math.floor(Math.random() * descriptions.length)] ?? 'Concerts';
}
