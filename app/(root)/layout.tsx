import Header from '@/components/shared/header';
import Footer from '@/components/footer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header full width border */}
      <div className="w-full border-b">
        <div className="max-w-screen-xl mx-auto px-4">
          <Header />
        </div>
      </div>
      {/* Main content */}
      <div className="max-w-screen-xl mx-auto px-4 flex-1 w-full">
        <main className="w-full">{children}</main>
      </div>
      {/* Footer full width border */}
      <div className="w-full border-t">
        <div className="max-w-screen-xl mx-auto px-4">
          <Footer />
        </div>
      </div>
    </div>
  );
}
