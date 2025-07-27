"use client";

export function ScalableContent({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 w-full h-full">
        {children}
      </main>
    </div>
  );
} 