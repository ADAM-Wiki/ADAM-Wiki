interface ArticleCardProps {
  title: string;
  date: string;
  readTime: string;
  wordCount: string;
  isFeatured?: boolean;
  image?: string;
  onClick?: () => void;
}

export default function ArticleCard({ title, date, readTime, wordCount }: ArticleCardProps) {
  return (
    <div className="py-6">
      <h3 className="text-base font-medium mb-2">{title}</h3>
      <div className="flex items-center gap-4 text-sm text-brand-dim">
        <span>{date}</span>
        <span>{readTime}</span>
        <span>{wordCount}</span>
      </div>
    </div>
  );
}