export type NewsFocus = "sector" | "producto" | "investigacion" | "tecnico";

export type GeneratedNewsCandidate = {
  title: string;
  summary: string;
  url: string;
  sourceName?: string;
  imageUrl?: string;
  focus?: NewsFocus;
  impact?: number;
  topics?: string[];
};

export type NewsItem = {
  id: string;
  day: string;
  title: string;
  summary: string | null;
  url: string;
  url_hash: string;
  normalized_title: string;
  source_name: string | null;
  source_host: string | null;
  image_url: string | null;
  focus: NewsFocus | null;
  impact: number | null;
  topics: string[];
  created_at: string;
};

export type NewsDay = {
  day: string;
  generated_at: string;
  provider: string;
  item_count: number;
  status: string;
};
