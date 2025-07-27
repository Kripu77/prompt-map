"use client";

import { useAuthSidebar } from "@/hooks/use-auth-sidebar";
import { ReactNode } from "react";


export function AuthSidebarProvider({ children }: { children: ReactNode }) {
  useAuthSidebar();
  
  return <>{children}</>;
} 