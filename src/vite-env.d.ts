/// <reference types="vite/client" />

/** Substituted by Vite at build time - see `define` in vite.config.ts. */
declare const __BUILD_YEAR__: number;

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