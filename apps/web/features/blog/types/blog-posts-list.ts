/**
 * Application contracts for blog posts listing (Home MVP).
 */

export type BlogPostListItem = {
  id: string;
  title: string;
  excerpt: string;
  category?: string;
  readingTimeLabel?: string;
  href: string;
};

export type BlogPostsListPagination = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type GetBlogPostsListParams = {
  page: number;
  perPage: number;
  published: boolean;
  sort: "publishedAt" | "title" | "createdAt";
  order: "asc" | "desc";
};

export type GetBlogPostsListResult =
  | {
      status: "success";
      posts: BlogPostListItem[];
      pagination: BlogPostsListPagination;
    }
  | {
      status: "error";
      message: string;
    };

export const BLOG_POSTS_LIST_DEFAULT_PAGE = 1;
export const BLOG_POSTS_LIST_DEFAULT_PER_PAGE = 3;
export const BLOG_POSTS_LIST_DEFAULT_SORT: GetBlogPostsListParams["sort"] =
  "publishedAt";
export const BLOG_POSTS_LIST_DEFAULT_ORDER: GetBlogPostsListParams["order"] =
  "desc";
export const BLOG_POSTS_LIST_DEFAULT_PUBLISHED = true;
