'use client';

import { useControllableState } from '@radix-ui/react-use-controllable-state';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { BrainIcon, ChevronDownIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { createContext, memo, useContext, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Response } from './response';

type ReasoningContextValue = {
  isStreaming: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  duration: number;
};

const ReasoningContext = createContext<ReasoningContextValue | null>(null);

const useReasoning = () => {
  const context = useContext(ReasoningContext);
  if (!context) {
    throw new Error('Reasoning components must be used within Reasoning');
  }
  return context;
};

export type ReasoningProps = ComponentProps<typeof Collapsible> & {
  isStreaming?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
};

export const Reasoning = memo(
  ({
    className,
    isStreaming = false,
    open,
    defaultOpen = false,
    onOpenChange,
    duration: durationProp,
    children,
    ...props
  }: ReasoningProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      prop: open,
      defaultProp: defaultOpen,
      onChange: onOpenChange,
    });
    const [duration, setDuration] = useControllableState({
      prop: durationProp,
      defaultProp: 0,
    });

    const [startTime, setStartTime] = useState<number | null>(null);

    
    useEffect(() => {
      if (durationProp === undefined) {
        if (isStreaming) {
          if (startTime === null) {
            setStartTime(Date.now());
          }
        } else if (startTime !== null) {
          setDuration(Math.round((Date.now() - startTime) / 1000));
          setStartTime(null);
        }
      }
    }, [isStreaming, startTime, setDuration, durationProp]);

    useEffect(() => {
      if (isStreaming && !isOpen && defaultOpen) {
        setIsOpen(true);
      } else if (!isStreaming && isOpen && duration > 0) {
        setIsOpen(false);
      }
    }, [isStreaming, isOpen, defaultOpen, duration, setIsOpen]);

    const handleOpenChange = (open: boolean) => {
      setIsOpen(open);
    };

    return (
      <ReasoningContext.Provider
        value={{ isStreaming, isOpen, setIsOpen, duration }}
      >
        <Collapsible
          className={cn('not-prose mb-4', className)}
          onOpenChange={handleOpenChange}
          open={isOpen}
          {...props}
        >
          {children}
        </Collapsible>
      </ReasoningContext.Provider>
    );
  },
);

export type ReasoningTriggerProps = ComponentProps<
  typeof CollapsibleTrigger
> & {
  title?: string;
};

export const ReasoningTrigger = memo(
  ({
    className,
    children,
    ...props
  }: ReasoningTriggerProps) => {
    const { isStreaming, isOpen, duration } = useReasoning();

    return (
      <CollapsibleTrigger
        className={cn(
          'flex items-center gap-2 text-muted-foreground text-sm',
          className,
        )}
        {...props}
      >
        {children ?? (
          <>
            <BrainIcon className="size-4" />
            {isStreaming ? (
              <p>Thinking...</p>
            ) : (
              <p>{duration > 0 ? `Thought for ${duration} seconds` : 'Thought process'}</p>
            )}
            <ChevronDownIcon
              className={cn(
                'size-4 text-muted-foreground transition-transform',
                isOpen ? 'rotate-180' : 'rotate-0',
              )}
            />
          </>
        )}
      </CollapsibleTrigger>
    );
  },
);

export type ReasoningContentProps = ComponentProps<
  typeof CollapsibleContent
> & {
  children: string;
};

export const ReasoningContent = memo(
  ({ className, children, ...props }: ReasoningContentProps) => {
    const { isStreaming } = useReasoning();
    const contentRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when content changes during streaming
    useEffect(() => {
      if (isStreaming && contentRef.current) {
        const scrollElement = contentRef.current;
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }, [children, isStreaming]);

    return (
      <CollapsibleContent
        ref={contentRef}
        className={cn(
          'mt-4 text-sm max-h-80 overflow-y-auto',
          'text-popover-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
          className,
        )}
        {...props}
      >
        <Response className="grid gap-2">{children}</Response>
      </CollapsibleContent>
    );
  },
);

Reasoning.displayName = 'Reasoning';
ReasoningTrigger.displayName = 'ReasoningTrigger';
ReasoningContent.displayName = 'ReasoningContent';
