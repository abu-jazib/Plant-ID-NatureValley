
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { NatureValleyLogoIcon } from "@/components/icons/NatureValleyLogoIcon";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  const [currentYear, setCurrentYear] = useState<number | string>('');

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="w-full bg-primary text-primary-foreground font-sans">
      <div className="container mx-auto py-12 md:py-16 px-4"> {/* Changed pl-4 to px-4 */}
        {/*====== Footer Widget ======*/}
        <div className="flex flex-wrap -mx-4">
          <div className="w-full lg:w-3/5 px-4 mb-8 lg:mb-0">
            {/*====== Footer About Widget ======*/}
            <div className="lg:pr-10">
              <div className="mb-4">
                <Link href="/" aria-label="NatureValley Home">
                  <NatureValleyLogoIcon className="h-16 w-auto text-primary-foreground" />
                </Link>
              </div>
              <p className="mb-4 font-sans">
                Path to Greener tomorrow. We are here to help you to make
                your life better.
              </p>
              <Button asChild variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-sans">
                <Link href="https://naturevalley.com.pk/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>

          <div className="w-full lg:w-2/5 px-4">
            {/*====== Contact Info Widget ======*/}
            <div className="mb-8">
              <h4 className="text-lg font-semibold mb-4 text-primary-foreground font-sans">Get In Touch</h4>
              <ul className="space-y-3">
                <li className="flex items-start font-sans">
                  <MapPin className="h-5 w-5 mr-3 mt-1 text-primary-foreground/80 flex-shrink-0" />
                  <span>27KM Multan Road Lahore, Punjab, Pakistan</span>
                </li>
                <li className="flex items-center font-sans">
                  <Mail className="h-5 w-5 mr-3 text-primary-foreground/80 flex-shrink-0" />
                  <a href="mailto:info@naturevalley.com.pk" className="hover:text-primary-foreground/80 transition-colors">info@naturevalley.com.pk</a>
                </li>
                <li className="flex items-center font-sans">
                  <Phone className="h-5 w-5 mr-3 text-primary-foreground/80 flex-shrink-0" />
                  <a href="tel:+923328194499" className="hover:text-primary-foreground/80 transition-colors">+92 332 8194499</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/*=== Copyright Area ===*/}
      <div className="py-4 border-t border-primary-foreground/20">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm px-4"> {/* Added px-4 for consistency */}
          <div className="mb-2 md:mb-0">
            <p className="font-sans">&copy; {currentYear} NatureValley. All Rights Reserved.</p>
          </div>
          {/* Add Privacy Policy / Terms of Service links here if needed */}
          {/* <div className="flex space-x-4">
            <Link href="/privacy-policy" className="hover:text-primary-foreground/80 transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-primary-foreground/80 transition-colors">Terms of Service</Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
