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

type Transaction = {
  amount: number;
  checked: boolean;
  date: Date;
  description: string;
  tags: string;
  type: TransactionType;
};

export default function FilePage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<'select-file' | 'select-columns' | 'edit-rows'>('select-file'); // 'select-file' | 'select-columns
  const [columns, setColumns] = useState<string[]>([]);
  const [records, setRecords] = useState<Record<string, string | undefined>[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateColumn, setDateColumn] = useState<string>();
  const [amountColumn, setAmountColumn] = useState<string>();
  const [descriptionColumn, setDescriptionColumn] = useState<string>();
  const [globalChecked, setGlobalChecked] = useState<boolean>(true);

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

                const records = await getRecords(await file.text());
                setRecords(records);
                setColumns(getColumns(records));
                setStage('select-columns');
              }}
            />
          </>
        ) : null}
        {stage === 'select-columns' ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p>The date is at:</p>
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
              <p>The amount is at:</p>
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
              <p>The description is at:</p>
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
                    date: parseDate(record[`${dateColumn}`] ?? '', 'yyyyMMdd', new Date()),
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
                  <TableRow className="hover:bg-transparent dark:hover:bg-transparent" key={i}>
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
                    <TableCell className="select-none">{transaction.amount}</TableCell>
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
                      <Input />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button className="mt-auto self-stretch">Save</Button>
          </>
        ) : null}
      </BlockBody>
    </>
  );
}

function getRecords(text: string): Promise<Record<string, string | undefined>[]> {
  return new Promise((res, rej) => {
    parseCSV(text, { delimiter: ';', columns: true }, (err, records) => {
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
