import * as React from 'react';

import { cn } from '~/lib/utils.client';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-primary-200 bg-transparent px-3 py-1 text-[16px] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-primary-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-primary-800 dark:bg-primary-600 dark:placeholder:text-primary-400 dark:focus-visible:ring-primary-300',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export interface InputWithCurrencyProps extends InputProps {
  currency: string;
}

const InputWithCurrency = React.forwardRef<HTMLInputElement, InputWithCurrencyProps>(
  ({ className, currency, ...props }, ref) => {
    return (
      <div className="flex items-center justify-end">
        <Input
          className={cn(
            'peer rounded-r-none pr-1 text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
            className,
          )}
          type="number"
          ref={ref}
          onFocus={(e) => e.target.select()}
          {...props}
        />
        <p className="flex items-center justify-center self-stretch rounded-r-md border border-primary-200 bg-transparent px-2 py-1 transition-colors placeholder:text-primary-500 peer-focus-visible:ring-1 peer-focus-visible:ring-primary-950 dark:border-primary-800 dark:placeholder:text-primary-400 dark:peer-focus-visible:ring-primary-300">
          {currency}
        </p>
      </div>
    );
  },
);
InputWithCurrency.displayName = 'InputWithCurrency';

export { Input, InputWithCurrency };
