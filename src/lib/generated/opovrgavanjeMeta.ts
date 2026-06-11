export type GeneratedOpovrgavanjeMeta = {
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

export const opovrgavanjeMeta: GeneratedOpovrgavanjeMeta[] = [
  {
    "title": "Test članak",
    "date": "2026-05-30",
    "slug": "test-clanak",
    "category": "opovrgavanje",
    "tags": [
      "opovrgavanje"
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
