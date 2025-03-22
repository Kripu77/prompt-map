"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "./button";
import { Download } from "lucide-react";
import { useMindmapStore } from "@/lib/store";
import { useTheme } from "next-themes";

export function Header() {


 
  return (
    <header className="border-b">
        <div className="px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Mind Map Generator</h1>
            <p className="text-muted-foreground">Enter a topic or concept to generate a visual mind map</p>
          </div>
          <div className="flex items-center gap-2">
            
            <ThemeToggle />
          </div>
        </div>
      </header>
  );
}