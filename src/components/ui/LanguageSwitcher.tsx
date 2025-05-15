"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LanguageSwitcherProps {
  selectedLanguage: "en" | "ur";
  onLanguageChange: (language: "en" | "ur") => void;
  className?: string;
}
export function LanguageSwitcher({
  selectedLanguage,
  onLanguageChange,
  className,
}: LanguageSwitcherProps) {
  return (
    <Tabs
      defaultValue={selectedLanguage}
      onValueChange={(value) => onLanguageChange(value as "en" | "ur")}
      className={className}
    >
      <TabsList className="grid w-full grid-cols-2 md:w-auto bg-[#1B5B3B] text-white rounded-md overflow-hidden">
        <TabsTrigger
          value="en"
          className="font-sans data-[state=active]:bg-[#174d32] data-[state=active]:text-white"
        >
          English
        </TabsTrigger>
        <TabsTrigger
          value="ur"
          className="font-jameel data-[state=active]:bg-[#174d32] data-[state=active]:text-white"
        >
          اردو
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
