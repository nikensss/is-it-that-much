import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="self-center">
      <SignIn afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard" />
    </div>
  );
}
