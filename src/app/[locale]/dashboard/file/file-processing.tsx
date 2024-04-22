'use client';

import { format, parse as parseDate } from 'date-fns';
import { useRef, useState } from 'react';
import { BlockTitle, BlockBody } from '~/app/_components/block';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { parse as parseCSV } from 'csv-parse';
import { cn } from '~/lib/utils.client';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { TransactionType } from '@prisma/client';
import { CheckSquareIcon, SquareIcon } from 'lucide-react';
import type { RouterOutputs } from '~/trpc/shared';
import { api } from '~/trpc/react.client';
import { useRouter } from 'next/navigation';
import { fromZonedTime } from 'date-fns-tz';

type Transaction = {
  amount: number;
  checked: boolean;
  date: Date;
  description: string;
  tags: string;
  type: TransactionType;
};

const stages = ['select-file', 'select-separator', 'select-columns', 'edit-rows'] as const;
type Stage = (typeof stages)[number];

const delimiters = [';', ','] as const;
type Delimiter = (typeof delimiters)[number];

const dateFormats = ['yyyyMMdd', 'yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy'] as const;
type DateFormat = (typeof dateFormats)[number];

export function FileProcessing({ user }: { user: RouterOutputs['users']['get'] }) {
  const router = useRouter();

  const fileInput = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<Stage>('select-file'); // 'select-file' | 'select-columns
  const [delimiter, setDelimiter] = useState<Delimiter>(delimiters[0]);
  const [dateFormat, setDateFormat] = useState<DateFormat>(dateFormats[0]);
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [records, setRecords] = useState<Record<string, string | undefined>[]>([]);
  const [dateColumn, setDateColumn] = useState<string>();
  const [amountColumn, setAmountColumn] = useState<string>();
  const [descriptionColumn, setDescriptionColumn] = useState<string>();
  const [globalChecked, setGlobalChecked] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const currencyFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: user.currency ?? 'EUR' });

  const bulk = api.transactions.personal.bulk.useMutation({
    onMutate: () => setIsLoading(true),
    onSettled: () => setIsLoading(false),
    onSuccess: () => router.push('/dashboard'),
  });

  function submit() {
    const data = transactions.map((t) => ({
      type: t.type,
      amount: t.amount,
      description: t.description,
      tags: t.tags.split(',').map((tag) => tag.trim()),
      date: user.timezone ? fromZonedTime(format(t.date, 'yyyy-MM-dd'), user.timezone) : t.date,
    }));

    bulk.mutate({ data });
  }

  return (
    <>
      <BlockTitle>From CSV file</BlockTitle>
      <BlockBody
        className={cn(stage === 'edit-rows' ? 'justify-start' : 'justify-center', 'flex grow flex-col items-center')}
      >
        {stage === 'select-file' ? (
          <>
            <Label
              htmlFor="file"
              className={cn(
                stage === 'select-file' ? '' : 'hidden',
                'cursor-pointer rounded-md bg-primary-700 px-4 py-3 text-primary-300 animate-in dark:bg-primary-300 dark:text-primary-800',
              )}
            >
              Select a file
            </Label>
            <Input
              ref={fileInput}
              id="file"
              type="file"
              className="hidden"
              onChange={async () => {
                const file = fileInput.current?.files?.[0];
                if (!file) {
                  console.error('No file selected');
                  return;
                }

                setFile(file);
                setStage('select-separator');
              }}
            />
          </>
        ) : null}
        {stage === 'select-separator' ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p>Delimiter:</p>
              <Select onValueChange={(delimiter: Delimiter) => setDelimiter(delimiter)} defaultValue={delimiter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a delimiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {delimiters.map((delimiter) => (
                      <SelectItem key={delimiter} value={delimiter}>
                        {delimiter}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={async () => {
                if (!file) return setStage('select-file');

                const records = await getRecords(await file.text(), delimiter);
                setRecords(records);
                setColumns(getColumns(records));
                setStage('select-columns');
              }}
            >
              Continue
            </Button>
          </div>
        ) : null}
        {stage === 'select-columns' ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p>Date column:</p>
              <Select onValueChange={setDateColumn}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p>Date format:</p>
              <Select onValueChange={(dateFormat: DateFormat) => setDateFormat(dateFormat)} defaultValue={dateFormat}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {dateFormats.map((dateFormat) => (
                      <SelectItem key={dateFormat} value={dateFormat}>
                        {dateFormat}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p>Amount column:</p>
              <Select onValueChange={setAmountColumn}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p>Description column:</p>
              <Select onValueChange={setDescriptionColumn}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {columns.map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                for (const record of records) {
                  const amount = parseFloat((record[`${amountColumn}`] ?? '0').replace(/,/g, '.'));
                  transactions.push({
                    amount: Math.abs(amount),
                    checked: true,
                    date: parseDate(record[`${dateColumn}`] ?? '', dateFormat, new Date()),
                    description: record[`${descriptionColumn}`] ?? '',
                    tags: '',
                    type: amount > 0 ? TransactionType.INCOME : TransactionType.EXPENSE,
                  });
                }
                setStage('edit-rows');
              }}
              className="mt-2"
            >
              Continue
            </Button>
          </div>
        ) : null}
        {stage === 'edit-rows' ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => {
                      setTransactions((transactions) => {
                        const res = [...transactions];
                        for (const t of res) {
                          t.checked = !globalChecked;
                        }
                        return res;
                      });
                      setGlobalChecked(!globalChecked);
                    }}
                    className="cursor-pointer"
                  >
                    {globalChecked ? <CheckSquareIcon /> : <SquareIcon />}
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, i) => (
                  <TableRow key={i}>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => {
                        setTransactions((transactions) => {
                          const res = [...transactions];
                          const t = res[i];
                          if (!t) return res;
                          res[i] = { ...t, checked: !t.checked };
                          return res;
                        });
                      }}
                    >
                      {transaction.checked ? <CheckSquareIcon /> : <SquareIcon />}
                    </TableCell>
                    <TableCell className="select-none">{format(transaction.date, 'yyyy-MM-dd')}</TableCell>
                    <TableCell className="select-none text-right">
                      {currencyFormatter.format(transaction.amount)}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer select-none text-center hover:bg-primary-100 hover:text-primary-900 dark:hover:bg-primary-800 dark:hover:text-primary-50"
                      onClick={() => {
                        setTransactions((transactions) => {
                          const res = [...transactions];
                          const t = res[i];
                          if (!t) return res;
                          res[i] = {
                            ...t,
                            type:
                              res[i]?.type === TransactionType.EXPENSE
                                ? TransactionType.INCOME
                                : TransactionType.EXPENSE,
                          };
                          return res;
                        });
                      }}
                    >
                      {transaction.type}
                    </TableCell>
                    <TableCell>
                      <Input
                        onFocus={(e) => e.target.select()}
                        defaultValue={transaction.description}
                        onChange={(event) => {
                          setTransactions((transactions) => {
                            const res = [...transactions];
                            const t = res[i];
                            if (!t) return res;
                            res[i] = { ...t, description: event.target.value };
                            return res;
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        onFocus={(e) => e.target.select()}
                        defaultValue={transaction.tags}
                        onChange={(event) => {
                          setTransactions((transactions) => {
                            const res = [...transactions];
                            const t = res[i];
                            if (!t) return res;
                            res[i] = { ...t, tags: event.target.value };
                            return res;
                          });
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={submit} disabled={isLoading} className="mt-auto self-stretch">
              Save
            </Button>
          </>
        ) : null}
      </BlockBody>
    </>
  );
}

function getRecords(text: string, separator: string): Promise<Record<string, string | undefined>[]> {
  return new Promise((res, rej) => {
    parseCSV(text, { delimiter: separator, columns: true }, (err, records) => {
      if (err) return rej(err);
      res(records as Record<string, string | undefined>[]);
    });
  });
}

function getColumns(records: Record<string, unknown>[]): string[] {
  const columns = new Set<string>();
  for (const record of records) {
    for (const column of Object.keys(record)) {
      columns.add(column);
    }
  }

  return [...columns];
}
