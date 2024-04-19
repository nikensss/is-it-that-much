'use client';

import { useClerk } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SignOut() {
  const { signOut } = useClerk();
  const router = useRouter();

  signOut()
    .then(() => router.push('/'))
    .catch(() => router.push('/'));

  return <Loader2 className="size-screen animate-spin" />;
}
