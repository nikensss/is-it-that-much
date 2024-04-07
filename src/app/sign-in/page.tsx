'use client';

import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export default function Page() {
  const { theme } = useTheme();

  return (
    <div className="self-center">
      <SignIn
        appearance={{ ...(theme === 'dark' ? { baseTheme: dark } : {}) }}
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
