import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut } from '@clerk/nextjs';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';

export default async function Home() {
  noStore();

  return (
    <div>
      <section className="w-full pt-12">
        <div className="space-y-10 px-4">
          <div className="mx-auto flex max-w-[800px] px-4 sm:px-6 md:grid-cols-2 md:gap-16 md:px-10">
            <div>
              <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                Track your expenses effortlessly
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Our expense tracking service helps you keep a tab on your expenses with ease. Sign up now to get
                started.
              </p>
              <ClerkLoading>
                <button
                  className="my-4 inline-flex rounded-md px-8 py-2 text-lg font-medium shadow outline-none transition-colors dark:bg-gray-400 dark:hover:bg-gray-300"
                  disabled
                >
                  Sign in
                </button>
              </ClerkLoading>

              <ClerkLoaded>
                <SignedIn>
                  <Link
                    className="my-4 inline-flex rounded-md px-8 py-2 text-lg font-medium shadow outline-none transition-colors dark:bg-gray-400 dark:hover:bg-gray-300"
                    href="#"
                  >
                    Go to Dashboard
                  </Link>
                </SignedIn>
                <SignedOut>
                  <Link
                    className="my-4 inline-flex rounded-md px-8 py-2 text-lg font-medium shadow outline-none transition-colors dark:bg-gray-400 dark:hover:bg-gray-300"
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                </SignedOut>
              </ClerkLoaded>
            </div>
          </div>
        </div>
      </section>
      <section className="flex w-full items-center justify-center pt-24">
        <div className="container space-y-12 px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Explore the features of our expense tracking service.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 pb-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <CalendarIcon className="mx-auto h-10 w-10" />
              <h3 className="text-center text-lg font-bold">Date-wise Tracking</h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Track your expenses based on dates.
              </p>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <CatIcon className="mx-auto h-10 w-10" />
              <h3 className="text-center text-lg font-bold">Category-wise Sorting</h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Sort your expenses based on categories.
              </p>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <BarChartIcon className="mx-auto h-10 w-10" />
              <h3 className="text-center text-lg font-bold">Visual Representation</h3>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Get a visual representation of your expenses.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function BarChartIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}

function CalendarIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function CatIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z" />
      <path d="M8 14v.5" />
      <path d="M16 14v.5" />
      <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
    </svg>
  );
}
