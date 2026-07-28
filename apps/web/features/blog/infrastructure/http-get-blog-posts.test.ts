import { describe, expect, it, vi } from "vitest";
import {
  buildBlogPostsListQuery,
  createHttpGetBlogPosts,
  formatReadingTimeLabel,
} from "./http-get-blog-posts";

const homeParams = {
  page: 1,
  perPage: 3,
  published: true,
  sort: "publishedAt" as const,
  order: "desc" as const,
};

describe("formatReadingTimeLabel", () => {
  it("formats minutes", () => {
    expect(formatReadingTimeLabel(5)).toBe("5 min de leitura");
  });

  it("returns undefined for invalid values", () => {
    expect(formatReadingTimeLabel(null)).toBeUndefined();
    expect(formatReadingTimeLabel(0)).toBeUndefined();
  });
});

describe("createHttpGetBlogPosts", () => {
  it("GETs without credentials and maps reading time + href", async () => {
    const fetchFn = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: [
          {
            id: "blg_01_5k_tips",
            title: "5 dicas para sua primeira corrida de 5K",
            slug: "5-dicas-primeira-corrida-5k",
            excerpt: "Preparação simples para estreantes no calendário do DF.",
            category: "Treino",
            readingTimeMinutes: 5,
            publishedAt: "2026-06-10T09:00:00.000Z",
            published: true,
          },
        ],
        meta: {
          page: 1,
          perPage: 3,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      }),
    }));

    const getPosts = createHttpGetBlogPosts({
      baseUrl: "http://api.test",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    const result = await getPosts(homeParams);
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledWith(
      `http://api.test/api/v1/blog/posts?${buildBlogPostsListQuery(homeParams)}`,
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
      }),
    );
    const init = fetchFn.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init?.credentials).toBeUndefined();
    expect(
      (init?.headers as Record<string, string> | undefined)?.Authorization,
    ).toBeUndefined();
    expect(result.status).toBe("success");
    if (result.status !== "success") return;
    expect(result.posts[0]).toMatchObject({
      title: "5 dicas para sua primeira corrida de 5K",
      readingTimeLabel: "5 min de leitura",
      href: "/blog/5-dicas-primeira-corrida-5k",
      category: "Treino",
    });
  });

  it("returns empty list on success", async () => {
    const getPosts = createHttpGetBlogPosts({
      baseUrl: "http://api.test",
      fetchFn: (async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          data: [],
          meta: {
            page: 1,
            perPage: 3,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      })) as unknown as typeof fetch,
    });

    await expect(getPosts(homeParams)).resolves.toMatchObject({
      status: "success",
      posts: [],
    });
  });

  it("rejects payloads that expose content", async () => {
    const getPosts = createHttpGetBlogPosts({
      baseUrl: "http://api.test",
      fetchFn: (async () => ({
        ok: true,
        status: 200,
        json: async () => ({
          data: [
            {
              id: "blg_01",
              title: "x",
              slug: "x",
              excerpt: "y",
              category: null,
              readingTimeMinutes: null,
              publishedAt: null,
              published: true,
              content: "# secret",
            },
          ],
          meta: {
            page: 1,
            perPage: 3,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        }),
      })) as unknown as typeof fetch,
    });

    await expect(getPosts(homeParams)).resolves.toMatchObject({
      status: "error",
    });
  });

  it("returns error on network failure", async () => {
    const getPosts = createHttpGetBlogPosts({
      baseUrl: "http://api.test",
      fetchFn: (async () => {
        throw new Error("network");
      }) as unknown as typeof fetch,
    });

    await expect(getPosts(homeParams)).resolves.toMatchObject({
      status: "error",
    });
  });
});
