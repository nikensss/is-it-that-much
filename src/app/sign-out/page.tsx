'use client';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();

  signOut()
    .then(() => router.push('/'))
    .catch(() => router.push('/'));
}
