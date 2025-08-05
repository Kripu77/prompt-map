import { MindmapContainer } from '@/components/features/mindmap/mindmap-container';

import { AIReasoningPanelWrapper } from '@/components/features/mindmap/ai-reasoning-panel-wrapper';
import { OnboardingGuide } from '@/components/features/onboarding';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  // Get the user session
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <MindmapContainer />

      <AIReasoningPanelWrapper />
      {/* Temporarily hidden on mobile screens */}
      <div className="hidden md:block">
        <OnboardingGuide userId={userId} />
      </div>
    </main>
  );
}
