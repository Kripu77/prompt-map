"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  return (
    <header className="mb-12 text-center relative border-b border-gray-200 dark:border-gray-800 pb-8 transition-colors duration-200">
      <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
        Mind Map Generator
      </h1>
      <p className="text-gray-600 dark:text-gray-400 text-lg">
        Enter a topic or concept to generate a visual mind map
      </p>
      <ThemeToggle />
    </header>
  );
}