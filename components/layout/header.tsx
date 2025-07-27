"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "../ui/button";
import { Download, Sparkles, MoreVertical, LogIn, Moon, Sun } from "lucide-react";
import { useMindmapStore } from "@/lib/stores/mindmap-store";
import { useTheme } from "next-themes";
import { exportMindmap } from "@/lib/mindmap-utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { UserNav } from "./user-nav";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import Link from "next/link";

// Create a custom sidebar icon component
function SidebarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <line x1="9" y1="5" x2="9" y2="19" />
    </svg>
  );
}

// Create a global state handler for sidebar visibility - we'll keep this for backward compatibility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let globalSidebarHandler: ((isOpen: boolean) => void) | null = null;

export function setSidebarHandler(handler: (isOpen: boolean) => void) {
  globalSidebarHandler = handler;
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const { mindmapRef, mindmapData } = useMindmapStore();
  const { isOpen, setIsOpen } = useSidebarStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const handleExport = () => {
    if (mindmapData && mindmapRef) {
      exportMindmap(mindmapRef, theme);
    }
  };

  const handleSidebarToggle = () => {
    if(isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(!isOpen);
    }
  };
 
  return (
    <header className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="px-3 sm:px-5 md:px-8 py-2 sm:py-3 flex justify-between items-center">
        <motion.div 
          className="flex items-center gap-2 flex-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                repeatType: "loop", 
                duration: 5,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
            </motion.div>
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-amber-500/20 blur-xl rounded-full -z-10" />
          </div>
          
          <div className="min-w-0 flex-1">
            {/* Truncate title on small screens */}
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 truncate max-w-[180px] xs:max-w-[240px] sm:max-w-none">
             Prompt Map
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block max-w-md">
              Enter a topic or concept to generate a visual mind map
            </p>
          </div>
        </motion.div>
        
        {/* Desktop navigation */}
        <motion.div 
          className="hidden sm:flex items-center gap-2 sm:gap-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSidebarToggle}
              className="text-muted-foreground hover:text-foreground sidebar-toggle-button"
              title="Your Mindmaps"
            >
              <SidebarIcon className="h-5 w-5" />
            </Button>
          )}
          {mindmapData && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className={cn(
                "flex items-center gap-1 px-2 sm:px-3 h-8 sm:h-9 rounded-full header-export-button",
                "border-transparent bg-foreground/5 hover:bg-foreground/10",
                "hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              )}
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">Export</span>
            </Button>
          )}
          <ThemeToggle />
          <UserNav />
        </motion.div>

        {/* Mobile navigation - compact with dropdown */}
        <motion.div 
          className="flex sm:hidden items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {/* If authenticated, always show the sidebar toggle first */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSidebarToggle}
              className="text-muted-foreground hover:text-foreground h-8 w-8 sidebar-toggle-button"
              title="Your Mindmaps"
            >
              <SidebarIcon className="h-4 w-4" />
            </Button>
          )}
          
          {/* If mindmap exists, show Export button */}
          {mindmapData && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="h-8 w-8 p-0 rounded-full header-export-button"
              title="Export Mindmap"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          )}
          
          {/* Mobile dropdown menu for remaining actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs">Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme(theme === "light" ? "dark" : "light")} className="cursor-pointer">
                <div className="flex items-center gap-2">
                  {theme === "light" ? 
                    <Moon className="h-3.5 w-3.5" /> : 
                    <Sun className="h-3.5 w-3.5" />
                  }
                  <span className="text-xs">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
                </div>
              </DropdownMenuItem>
              
              {/* Show Sign In in the dropdown if not authenticated */}
              {!isAuthenticated && (
                <DropdownMenuItem asChild>
                  <Link href="/signin" className="flex items-center gap-2 cursor-pointer">
                    <LogIn className="h-3.5 w-3.5" />
                    <span className="text-xs">Sign In</span>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Keep UserNav outside dropdown for easy profile access */}
          <UserNav />
        </motion.div>
      </div>
    </header>
  );
}