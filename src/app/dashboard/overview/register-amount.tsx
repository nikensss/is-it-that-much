'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { getRandomElement } from '~/lib/utils';
import { api } from '~/trpc/react';

export type Target = 'expenses' | 'incomes';

export type RegisterAmountProps = {
  descriptions: string[];
  target: Target;
  title: string;
};

export default function RegisterAmount({ descriptions, target, title }: RegisterAmountProps) {
  const router = useRouter();
  const [description, setDescription] = useState(getRandomElement(descriptions));
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const resetForm = () => {
    setDescription(getRandomElement(descriptions));
    setAmount(0);
    setIsOpen(true);
    setIsLoading(false);
  };

  const mutationConfig = {
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsOpen(false),
    onSuccess: () => router.refresh(),
  };

  const registerExpense = api.personalExpenses.register.useMutation(mutationConfig);
  const registerIncome = api.personalIncomes.register.useMutation(mutationConfig);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={resetForm}>
          {title}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-md max-sm:w-11/12">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (target === 'expenses') {
              return registerExpense.mutate({ description, amount });
            }

            if (target === 'incomes') {
              return registerIncome.mutate({ description, amount });
            }

            throw new Error('Invalid target');
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
              <Label htmlFor="amount" className="col-span-3 text-right">
                Amount
              </Label>
              <Input
                id="amount"
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
