//	shared TypeScript types

export type LightboxData = {
  url: string;
  caption: string;
};


export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}