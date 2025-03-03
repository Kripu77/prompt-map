"use client"

import React from 'react';
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Send } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function PromptInput({ value, onChange, onSubmit, isLoading }: PromptInputProps) {
  return (
    <div className=" flex flex-col  p-6 rounded-lg border border-gray-800">
      <div className="relative">
        <Textarea
          placeholder="Enter a topic or concept to generate a mind map..."
          className="min-h-[80px] resize-none pr-12 border-gray-800 text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-gray-700 focus:border-transparent"
          value={value}
          onChange={onChange}
          disabled={isLoading}
        />
        <Button
          size="icon"
          className="absolute right-4 bottom-4 bg-gray-800 hover:bg-gray-700 text-gray-300"
          onClick={onSubmit}
          disabled={isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}