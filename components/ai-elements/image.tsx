import { cn } from '@/lib/utils';
import type { Experimental_GeneratedImage } from 'ai';
import NextImage from 'next/image';

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
  mediaType?: string;
};

export const Image = ({
  base64,
  mediaType,
  ...props
}: ImageProps) => (
  <NextImage
    {...props}
    src={`data:${mediaType};base64,${base64}`}
    alt={props.alt || 'Generated image'}
    width={500}
    height={300}
    className={cn(
      'max-w-full h-auto rounded-md overflow-hidden',
      props.className,
    )}
  />
);
