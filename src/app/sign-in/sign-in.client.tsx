'use client';

import { SignIn as ClerkSignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export default function SignIn() {
  const { theme } = useTheme();

  return (
    <div className="self-center">
      <ClerkSignIn
        appearance={{ ...(theme === 'dark' ? { baseTheme: dark } : {}) }}
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}
