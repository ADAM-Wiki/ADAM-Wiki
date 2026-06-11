export type GeneratedAteizamMeta = {
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

export const ateizamMeta: GeneratedAteizamMeta[] = [
  {
    "title": "Test članak",
    "date": "2026-05-30",
    "slug": "test-clanak",
    "category": "ateizam",
    "tags": [
      "ateizam"
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
