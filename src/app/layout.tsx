import '~/styles/globals.css';
import { Inter } from 'next/font/google';
import { TRPCReactProvider } from '~/trpc/react';
import { ClerkProvider } from '@clerk/nextjs';
import { Footer } from '~/app/_components/footer';
import { NavBar } from '~/app/_components/navbar';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Is It That Much',
  description: 'Easily keep track of your expenses.',
  icons: [{ rel: 'icon', url: '/favicon.svg' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`font-sans ${inter.variable}`}>
          <div className="flex min-h-screen flex-col">
            <NavBar />
            <main className="flex flex-1 justify-center">
              <TRPCReactProvider>{children}</TRPCReactProvider>
            </main>
            <Footer />
          </div>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
