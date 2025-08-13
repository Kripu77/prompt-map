"use client";

import React from 'react';
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationSource,
} from '@/components/ai-elements/inline-citation';

interface SourceData {
  title?: string;
  url: string;
  description?: string;
}

interface InlineCitationRendererProps {
  sources: SourceData[];
}

export function InlineCitationRenderer({ sources }: InlineCitationRendererProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  const sourceUrls = sources.map(source => source.url);

  return (
    <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
      <InlineCitation>
        <InlineCitationCard>
          <InlineCitationCardTrigger sources={sourceUrls} />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselHeader>
                <InlineCitationCarouselPrev />
                <InlineCitationCarouselIndex />
                <InlineCitationCarouselNext />
              </InlineCitationCarouselHeader>
              <InlineCitationCarouselContent>
                {sources.map((source, index) => (
                  <InlineCitationCarouselItem key={index}>
                    <InlineCitationSource
                      title={source.title || 'Untitled Source'}
                      url={source.url}
                      description={source.description}
                    />
                  </InlineCitationCarouselItem>
                ))}
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
    </div>
  );
}