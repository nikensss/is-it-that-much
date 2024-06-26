import React from 'react';
import { Command, CommandList, CommandItem, CommandGroup } from '~/components/ui/command';
import { type Tag as TagType } from './tag-input';

type AutocompleteProps = {
  tags: TagType[];
  setTags: React.Dispatch<React.SetStateAction<TagType[]>>;
  autocompleteOptions: TagType[];
  maxTags?: number;
  onTagAdd?: (tag: string) => void;
  allowDuplicates: boolean;
  children: React.ReactNode;
};

export const Autocomplete: React.FC<AutocompleteProps> = ({
  tags,
  setTags,
  autocompleteOptions,
  maxTags,
  onTagAdd,
  allowDuplicates,
  children,
}) => {
  return (
    <Command className="border border-transparent dark:border-white dark:bg-primary-700">
      {children}
      <CommandList>
        <CommandGroup heading="Previously used">
          {autocompleteOptions.map((option) => (
            <div
              onClick={() => {
                if (maxTags && tags.length >= maxTags) return;
                if (!allowDuplicates && tags.some((tag) => tag.text === option.text)) return;
                setTags([...tags, option]);
                onTagAdd?.(option.text);
              }}
              key={option.id}
            >
              <CommandItem className="cursor-pointer rounded-md transition-all dark:text-white">
                <div>{option.text}</div>
              </CommandItem>
            </div>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
