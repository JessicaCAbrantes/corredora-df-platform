export type BlogPostDto = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string | null;
  readingTimeMinutes: number | null;
  publishedAt: string | null;
  published: boolean;
};

export type BlogPostsListMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type BlogPostsListResponse = {
  data: BlogPostDto[];
  meta: BlogPostsListMeta;
};
