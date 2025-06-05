
import type { Metadata } from 'next';
import { Montserrat, Roboto } from 'next/font/google';
import Script from 'next/script'; // Import Script component
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
      <head>
        {/* Other head elements can go here */}
      </head>
      <body className={`${montserrat.variable} ${roboto.variable} antialiased`} suppressHydrationWarning>
        {children}
        <Toaster />
        <Script
          id="adsbygoogle-script"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2252656502777909" // REPLACE WITH YOUR PUBLISHER ID
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
