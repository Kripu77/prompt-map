import MarkmapHooks from "@/hooks/markmap";
import { Header } from "@/components/ui/header";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-1 overflow-hidden">
        <MarkmapHooks />
      </div>
    </main>
  );
}
