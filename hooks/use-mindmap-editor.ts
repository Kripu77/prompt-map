import { useState, useCallback, useEffect } from 'react';
import { useMindmapStore } from '@/lib/stores/mindmap-store';
import { useThreadsStore } from '@/lib/stores/threads-store';
import { useThreads } from '@/hooks/use-threads';
import { toast } from 'sonner';
import type { ThreadUpdateRequest, Thread } from '@/types/api';

export function useMindmapEditor() {
  const { mindmapData, setMindmapData } = useMindmapStore();
  const { currentThread } = useThreadsStore();
  const { updateThread } = useThreads();
  const [isSaving, setIsSaving] = useState(false);
  
  // Simple save function - saves current mindmap data to the current thread
  const saveChanges = useCallback(async () => {
    if (!currentThread?.id || isSaving) {
      toast.error('No thread selected to save');
      return;
    }

    // Cast to the correct Thread type from API
    const thread = currentThread as Thread;
    
    const updates: ThreadUpdateRequest = {
      content: mindmapData,
      title: thread.title,
      reasoning: thread.reasoning
    };

    setIsSaving(true);
    try {
      const updatedThread = await updateThread(currentThread.id, updates);
      if (updatedThread) {
        toast.success('Changes saved to your knowledge base!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [currentThread, mindmapData, isSaving, updateThread]);

  return {
    saveChanges,
    isSaving,
    canSave: !!currentThread?.id,
  };
}