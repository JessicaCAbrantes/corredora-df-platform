export interface BlogCardProps {
  title: string;
  excerpt: string;
  category?: string;
  readingTime?: string;
  href?: string;
  className?: string;
}

export const BLOG_CARD_CLASS = "butterfly-blog-card";
export const BLOG_CARD_MEDIA_CLASS = "butterfly-blog-card__media";
export const BLOG_CARD_BODY_CLASS = "butterfly-blog-card__body";
export const BLOG_CARD_CATEGORY_CLASS = "butterfly-blog-card__category";
export const BLOG_CARD_TITLE_CLASS = "butterfly-blog-card__title";
export const BLOG_CARD_EXCERPT_CLASS = "butterfly-blog-card__excerpt";
export const BLOG_CARD_META_CLASS = "butterfly-blog-card__meta";
