import { UserProfile } from '@clerk/nextjs';

export default function UserPage() {
  return <UserProfile path="/user" routing="path" />;
}
