'use client';

import { useRef, useState } from 'react';
import { BlockTitle, BlockBody } from '~/app/_components/block';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { parse } from 'csv-parse';
import { cn } from '~/lib/utils.client';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

export default function FilePage() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isFileParsed, setIsFileParsed] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);

  return (
    <>
      <BlockTitle>From CSV file</BlockTitle>
      <BlockBody className="flex grow flex-col items-center justify-center">
        <Label
          htmlFor="file"
          className={cn(
            isFileParsed ? 'hidden' : '',
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

            const records = await parseCSV(await file.text());
            setRecords(records);
            setColumns(getColumns(records));
            setIsFileParsed(true);
          }}
        />
        {isFileParsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p>The date is at:</p>
              <Select>
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
              <Select>
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
              <Select>
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
            <Button className="mt-2">Continue</Button>
          </div>
        ) : null}
      </BlockBody>
    </>
  );
}

function parseCSV(text: string): Promise<Record<string, unknown>[]> {
  return new Promise((res, rej) => {
    parse(text, { delimiter: ';', columns: true }, (err, records) => {
      if (err) return rej(err);
      res(records as Record<string, unknown>[]);
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
