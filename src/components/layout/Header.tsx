
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { NatureValleyLogoIcon } from '@/components/icons/NatureValleyLogoIcon';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';

const NavLinks = [
  { href: 'https://naturevalley.com.pk/', label: 'Home' },
  { href: 'https://naturevalley.com.pk/team', label: 'Our Team' },
  { href: 'https://naturevalley.com.pk/blogs', label: 'Blogs' },
  { href: 'https://naturevalley.com.pk/contact', label: 'Contact' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-primary text-primary-foreground shadow-md top-0 z-50 font-sans">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="flex items-center">
          <NatureValleyLogoIcon className="h-10 w-auto text-primary-foreground" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {NavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium hover:text-primary-foreground/80 transition-colors px-2 py-1 rounded-md"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-3/4 bg-primary text-primary-foreground p-6 font-sans">
              <div className="flex flex-col h-full">
                <SheetHeader>
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex justify-between items-center mb-8">
                   <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                      <NatureValleyLogoIcon className="h-10 w-auto text-primary-foreground" />
                   </Link>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col space-y-4">
                  {NavLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="text-lg font-medium hover:bg-primary-foreground/10 transition-colors p-3 rounded-md text-center"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
