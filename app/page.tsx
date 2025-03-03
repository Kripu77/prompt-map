import MarkmapHooks from "@/hooks/markmap";
import { Header } from "@/components/ui/header";

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4">
        <Header />
        <main>
          <MarkmapHooks />
        </main>
      </div>
    </div>
  );
}
