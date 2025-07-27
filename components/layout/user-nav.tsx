"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useSidebarStore } from "@/lib/stores/sidebar-store";

export function UserNav() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const [isMobile, setIsMobile] = useState(false);
  const { setIsOpen } = useSidebarStore();
  const [prevStatus, setPrevStatus] = useState(status);

  // Check if it's a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Open sidebar automatically when user logs in
  useEffect(() => {
    // Only open sidebar when status changes from unauthenticated/loading to authenticated
    if (prevStatus !== "authenticated" && status === "authenticated") {
      // Don't auto-open on mobile as it might be intrusive
      if (!isMobile) {
        setIsOpen(true);
      }
    }
    setPrevStatus(status);
  }, [status, prevStatus, setIsOpen, isMobile]);

  // Get user initials for avatar fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "GU";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return <Button variant="ghost" size="sm" disabled className={isMobile ? "h-8 w-8" : "h-9 w-9"} />;
  }

  if (!isAuthenticated) {
    return isMobile ? (
      // On mobile, we'll use the dropdown menu instead of sign in button
      null
    ) : (
      <Button variant="outline" size="sm" asChild>
        <Link href="/signin">Sign In</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative rounded-full ${isMobile ? 'h-8 w-8' : 'h-9 w-9'}`}>
          <Avatar className={isMobile ? "h-7 w-7" : "h-8 w-8"}>
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
            <AvatarFallback>{getInitials(session?.user?.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={isMobile ? "w-48" : "w-56"} align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className={`text-sm font-medium leading-none ${isMobile ? 'line-clamp-1' : ''}`}>{session?.user?.name}</p>
            <p className={`text-xs leading-none text-muted-foreground ${isMobile ? 'line-clamp-1' : ''}`}>
              {session?.user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 