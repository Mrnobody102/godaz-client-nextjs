import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/assets/styles/globals.css';
import { APP_DESCRIPTION, APP_NAME } from '@/lib/constants';
import './globals.css';
import ClientQueryProvider from '@/components/query-client-provider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: `${APP_DESCRIPTION}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ClientQueryProvider>{children}</ClientQueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
