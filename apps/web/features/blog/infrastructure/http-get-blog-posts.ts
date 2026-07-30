import type {
  BlogPostListItem,
  BlogPostsListPagination,
  GetBlogPostsListParams,
  GetBlogPostsListResult,
} from "../types/blog-posts-list";
import { env } from "@/lib/env";

type HttpBlogPostDto = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string | null;
  readingTimeMinutes: number | null;
  publishedAt: string | null;
  published: boolean;
};

type HttpPaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type HttpBlogPostsListBody = {
  data?: unknown;
  meta?: unknown;
  error?: {
    code?: string;
    message?: string;
  };
};

export type HttpGetBlogPosts = (
  params: GetBlogPostsListParams,
) => Promise<GetBlogPostsListResult>;

export type HttpGetBlogPostsOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

const GENERIC_ERROR_MESSAGE = "Não foi possível carregar o blog.";

export function buildBlogPostsListQuery(params: GetBlogPostsListParams): string {
  const query = new URLSearchParams();
  query.set("page", String(params.page));
  query.set("perPage", String(params.perPage));
  query.set("sort", params.sort);
  query.set("order", params.order);
  query.set("published", String(params.published));
  return query.toString();
}

function isHttpBlogPostDto(value: unknown): value is HttpBlogPostDto {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.title === "string" &&
    typeof row.slug === "string" &&
    typeof row.excerpt === "string" &&
    (row.category === null || typeof row.category === "string") &&
    (row.readingTimeMinutes === null ||
      typeof row.readingTimeMinutes === "number") &&
    (row.publishedAt === null || typeof row.publishedAt === "string") &&
    typeof row.published === "boolean" &&
    !("content" in row) &&
    !("author" in row) &&
    !("authorId" in row) &&
    !("coverImage" in row)
  );
}

function isHttpPaginationMeta(value: unknown): value is HttpPaginationMeta {
  if (!value || typeof value !== "object") return false;
  const meta = value as Record<string, unknown>;
  return (
    typeof meta.page === "number" &&
    typeof meta.perPage === "number" &&
    typeof meta.total === "number" &&
    typeof meta.totalPages === "number"
  );
}

export function formatReadingTimeLabel(
  minutes: number | null,
): string | undefined {
  if (minutes === null || !Number.isFinite(minutes) || minutes <= 0) {
    return undefined;
  }
  return `${minutes} min de leitura`;
}

function toBlogPostListItem(dto: HttpBlogPostDto): BlogPostListItem {
  return {
    id: dto.id,
    title: dto.title,
    excerpt: dto.excerpt,
    category: dto.category ?? undefined,
    readingTimeLabel: formatReadingTimeLabel(dto.readingTimeMinutes),
    href: `/blog/${dto.slug}`,
  };
}

function toPagination(meta: HttpPaginationMeta): BlogPostsListPagination {
  return {
    page: meta.page,
    perPage: meta.perPage,
    total: meta.total,
    totalPages: meta.totalPages,
  };
}

function errorResult(message?: string): GetBlogPostsListResult {
  return {
    status: "error",
    message: message || GENERIC_ERROR_MESSAGE,
  };
}

/**
 * HTTP Adapter — GET /api/v1/blog/posts (public teaser, no credentials).
 */
export function createHttpGetBlogPosts(
  options: HttpGetBlogPostsOptions = {},
): HttpGetBlogPosts {
  const baseUrl = options.baseUrl ?? env.apiUrl;
  const fetchFn = options.fetchFn ?? fetch;

  return async function httpGetBlogPosts(
    params: GetBlogPostsListParams,
  ): Promise<GetBlogPostsListResult> {
    const url = `${baseUrl}/api/v1/blog/posts?${buildBlogPostsListQuery(params)}`;

    try {
      const response = await fetchFn(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      let body: HttpBlogPostsListBody = {};
      try {
        body = (await response.json()) as HttpBlogPostsListBody;
      } catch {
        return errorResult();
      }

      if (!response.ok) {
        if (response.status >= 500) {
          return errorResult();
        }
        return errorResult(
          typeof body.error?.message === "string"
            ? body.error.message
            : undefined,
        );
      }

      if (!Array.isArray(body.data) || !isHttpPaginationMeta(body.meta)) {
        return errorResult();
      }

      if (!body.data.every(isHttpBlogPostDto)) {
        return errorResult();
      }

      return {
        status: "success",
        posts: body.data.map(toBlogPostListItem),
        pagination: toPagination(body.meta),
      };
    } catch {
      return errorResult();
    }
  };
}
