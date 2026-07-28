import type { BlogPost, Prisma } from "@prisma/client";
import type { ListBlogPostsQueryDto } from "./dto/list-blog-posts-query.dto";
import type { BlogPostDto, BlogPostsListMeta } from "./blog.types";

export function toBlogPostDto(row: BlogPost): BlogPostDto {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    category: row.category,
    readingTimeMinutes: row.readingTimeMinutes,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    published: row.published,
  };
}

export function buildBlogPostsWhere(
  query: ListBlogPostsQueryDto,
): Prisma.BlogPostWhereInput {
  return {
    published: query.published,
  };
}

export function buildBlogPostsOrderBy(
  query: ListBlogPostsQueryDto,
): Prisma.BlogPostOrderByWithRelationInput[] {
  const direction = query.order;
  const primary: Prisma.BlogPostOrderByWithRelationInput =
    query.sort === "title"
      ? { title: direction }
      : query.sort === "createdAt"
        ? { createdAt: direction }
        : { publishedAt: direction };

  return [primary, { id: "asc" }];
}

export function buildBlogPostsMeta(
  page: number,
  perPage: number,
  total: number,
): BlogPostsListMeta {
  const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);
  return {
    page,
    perPage,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
