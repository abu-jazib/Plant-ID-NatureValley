
"use client";

import { NatureValleyLogoIcon } from "@/components/icons/NatureValleyLogoIcon";
import Footer from "@/components/layout/Footer"; 
// Updated import path for Header
import { Header } from "../components/layout/Header"; 
// Updated import path for LeafWiseApp
import { LeafWiseApp } from "../components/leafwise/LeafWiseApp";
import "@/public/assets/css/style.css"


export default function HomePage() {

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/30">
      <Header /> {/* Use the new Header component */}

      <main className="flex-grow container mx-auto p-4 md:p-8 w-full max-w-3xl pt-20 font-sans"> {/* Increased pt-16 to pt-20 */}
        <LeafWiseApp />
      </main>

      <Footer /> 
    </div>
  );
}

