/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react';

  export const meta: {
    title: string;
    date: string;
    slug: string;
    category?: string;
    tags: string[];
    description: string;
  };

  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}