'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { api } from '~/trpc/react';

export default function DashboardRegisterPersonalIncome() {
  const router = useRouter();
  const [description, setDescription] = useState(getRandomDescription());
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const registerExpense = api.personalIncomes.register.useMutation({
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
          Register income
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-md max-sm:w-11/12">
        <DialogHeader>
          <DialogTitle>Register income</DialogTitle>
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
                placeholder={description}
                className="col-span-7"
                minLength={3}
              />
            </div>
            <div className="grid grid-cols-10 items-center gap-4">
              <Label htmlFor="income-amount" className="col-span-3 text-right">
                Amount
              </Label>
              <Input
                id="income-amount"
                type="number"
                step={0.01}
                min={0.01}
                onChange={(e) => setAmount(parseFloat(e.target.value))}
                value={amount}
                className="col-span-7"
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
  const descriptions = ['Income', 'Settlements', 'Rent', 'Dinner'];

  return descriptions[Math.floor(Math.random() * descriptions.length)] ?? 'Concerts';
}
