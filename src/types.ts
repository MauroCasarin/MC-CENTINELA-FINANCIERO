export interface NewsItem {
  [key: string]: any; // Flexible for now until we know the structure
  title?: string;
  headline?: string;
  description?: string;
  summary?: string;
  content?: string;
  url?: string;
  link?: string;
  image?: string;
  imageUrl?: string;
  date?: string;
  publishedAt?: string;
  source?: string;
}
