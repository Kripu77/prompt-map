import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mindmapService, type MindmapGenerationOptions } from '@/lib/api/services/mindmap-service';
import type { PromptPayload, MindmapResponse, TopicShiftResponse } from '@/types/api';

// Hook for generating mindmaps
export function useGenerateMindmap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      payload, 
      options = {} 
    }: { 
      payload: PromptPayload; 
      options?: MindmapGenerationOptions & { enableWebSearch?: boolean };
    }) => {
      return await mindmapService.generateMindmap(payload, options);
    },
    onSuccess: () => {
      // Invalidate any relevant queries if needed
      queryClient.invalidateQueries({ queryKey: ['mindmap'] });
    }
  });
}

// Hook for checking topic shifts
export function useCheckTopicShift() {
  return useMutation({
    mutationFn: async (payload: PromptPayload) => {
      return await mindmapService.analyzeTopicShift(payload);
    }
  });
}

