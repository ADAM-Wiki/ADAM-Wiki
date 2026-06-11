export type GeneratedIstorijaMeta = {
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

export const istorijaMeta: GeneratedIstorijaMeta[] = [
  {
    "title": "Test članak",
    "date": "2026-05-30",
    "slug": "test-clanak",
    "category": "istorija",
    "tags": [
      "istorija"
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
