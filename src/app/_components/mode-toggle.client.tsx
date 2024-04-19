'use client';

import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <label
      htmlFor="mode-toggle"
      className="relative cursor-pointer rounded-lg border border-primary-900 p-2 dark:border-primary-200 dark:bg-primary-900"
    >
      <input
        type="checkbox"
        id="mode-toggle"
        className="hidden"
        onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      <SunIcon className="h-[1.2rem] w-[1.2rem] transition-all dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <MoonIcon className="absolute top-[20%] h-[1.2rem] w-[1.2rem] translate-y-4 rotate-[120deg] opacity-0 transition-all duration-300 dark:translate-y-0 dark:opacity-100 " />
      <span className="sr-only">Toggle theme</span>
    </label>
  );
}
