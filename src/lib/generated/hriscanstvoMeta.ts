export type GeneratedhriscanstvoMeta = {
  title: string;
  date: string;
  slug: string;
  category: string;
  tags: string[];
  description: string;
  wordCount: number;
  readingTimeMinutes: number;
  searchText: string;
  searchChunks: string[];
};

export const hriscanstvoMeta: GeneratedhriscanstvoMeta[] = [
  {
    "title": "Test članak",
    "date": "2026-05-30",
    "slug": "test-clanak",
    "category": "hriscanstvo",
    "tags": [
      "hriscanstvo"
    ],
    "description": "Kratak opis članka.",
    "wordCount": 1,
    "readingTimeMinutes": 1,
    "searchText": "test",
    "searchChunks": [
      "test"
    ]
  }
];
