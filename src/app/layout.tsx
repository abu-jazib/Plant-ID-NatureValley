
import type { Metadata } from 'next';
import { Montserrat, Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({
  variable: '--font-geist-sans', // Keep existing CSS variable name for Tailwind
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const roboto = Roboto({
  variable: '--font-geist-mono', // Keep existing CSS variable name for Tailwind
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'NatureValley - Plant Identifier & Disease Detector',
  description: 'Upload a leaf image to identify the plant and detect potential diseases with NatureValley.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${roboto.variable} antialiased`} suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
