"use client"

import React, { useEffect } from 'react';
import { useMindmapStore } from "@/lib/store";
import { PromptInput } from "@/components/ui/prompt-input";
import { MindmapView } from "@/components/ui/mindmap-view";
import { useChat } from '@ai-sdk/react'



export default function MarkmapHooks() {
  const { prompt, setPrompt, isLoading, setIsLoading, mindmapData, setMindmapData } = useMindmapStore();
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  useEffect(() => {
    if (messages.length > 0) {
      
      const lastMessage = messages[messages.length - 1];
      messages.forEach(m => {
        console.log(m.role)
      })
      if (lastMessage.role === 'assistant') {
        setIsLoading(false);
        setPrompt('');
        setMindmapData(lastMessage.content);
      }
    }
  }, [
    messages,
  ]);

  return (
    <div className="relative flex flex-col w-full h-[calc(95vh-8rem)] rounded-xl">
      <div className="flex-1 mb-24">
        <MindmapView data={mindmapData } />
      </div>

    
      {messages.map(m => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}

      <div className="fixed bottom-6 left-6 right-6 z-10">
        <PromptInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
