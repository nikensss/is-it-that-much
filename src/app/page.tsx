import { SignInButton, SignOutButton, currentUser } from '@clerk/nextjs';
import { unstable_noStore as noStore } from 'next/cache';
import { CreateCategory } from '~/app/_components/create-category';
import { api } from '~/trpc/server';

export default async function Home() {
  noStore();
  const categories = await api.categories.getAll.query();
  const user = await currentUser();
  if (user && !(await api.users.exists.query())) {
    await api.users.create.mutate();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          {user ? <SignOutButton /> : <SignInButton />}
        </div>
        <div className="flex flex-col items-center gap-2">
          <p>Categories:</p>
          <ul>
            {categories.map((category) => (
              <li key={category.id}>{category.name}</li>
            ))}
          </ul>
        </div>

        <CrudShowcase />
      </div>
    </main>
  );
}

async function CrudShowcase() {
  const latestPost = await api.categories.getLatest.query();

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent post: {latestPost.name}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}

      <CreateCategory />
    </div>
  );
}
