"use client";

import { useAuthSidebar } from "@/hooks/use-auth-sidebar";
import { ReactNode } from "react";

/**
 * A provider component that handles sidebar auto-open when a user logs in
 */
export function AuthSidebarProvider({ children }: { children: ReactNode }) {
  // Use the hook to set up sidebar auto-open
  useAuthSidebar();
  
  // Just render children as this component just handles effects
  return <>{children}</>;
} 