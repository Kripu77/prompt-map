"use client"

import React, { useRef, useEffect } from 'react';
import { Markmap } from 'markmap-view';
import { Toolbar } from 'markmap-toolbar';
import { transformer } from '@/lib';

interface MindmapViewProps {
  data: string;
}

function renderToolbar(mm: Markmap, wrapper: HTMLElement) {
  while (wrapper?.firstChild) wrapper.firstChild.remove();
  if (mm && wrapper) {
    const toolbar = new Toolbar();
    toolbar.attach(mm);
    toolbar.setItems(Toolbar.defaultItems);
    wrapper.append(toolbar.render());
  }
}

export function MindmapView({ data }: MindmapViewProps) {
  const refSvg = useRef<SVGSVGElement>(null);
  const refMm = useRef<Markmap | undefined>(undefined);
  const refToolbar = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (refMm.current) return;
    const mm = Markmap.create(refSvg.current);
    refMm.current = mm;
    if (refToolbar.current) {
      renderToolbar(refMm.current, refToolbar.current);
    }
  }, [refSvg.current]);

  useEffect(() => {
    const mm = refMm.current;
    if (!mm) return;
    const { root } = transformer.transform(data);
    mm.setData(root).then(() => {
      mm.fit();
      mm.rescale(0.8); // Increased scale for better visibility
      mm.transition(300); // Smooth transition to the new view with 300ms duration
    });
  }, [refMm.current, data]);

  return (
    <div className="w-full h-full overflow-scroll">
      <svg className="w-full h-full dark:text-white" ref={refSvg} />
      {/* <div className=" bg-gray-800 rounded-md" ref={refToolbar} /> */}
    </div>
  );
}