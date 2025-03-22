import MarkmapHooks from "@/hooks/markmap";
import { OnboardingGuide } from '@/components/ui/onboarding-guide';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  // Get the user session
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <MarkmapHooks />
      <OnboardingGuide userId={userId} />
    </main>
  );
}
