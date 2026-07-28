import { describe, expect, it } from "vitest";
import type { GetBlogPostsListResult } from "../../blog/types/blog-posts-list";
import {
  HOME_BLOG_EMPTY_MESSAGE,
  HOME_BLOG_ERROR_MESSAGE,
  HOME_BLOG_LIST_HREF,
  HOME_BLOG_PER_PAGE,
  buildHomeBlogParams,
  toHomeBlogPresentation,
} from "./home-blog";

describe("buildHomeBlogParams", () => {
  it("uses recommended GET /blog/posts query for Home", () => {
    expect(buildHomeBlogParams()).toEqual({
      page: 1,
      perPage: HOME_BLOG_PER_PAGE,
      published: true,
      sort: "publishedAt",
      order: "desc",
    });
  });
});

describe("toHomeBlogPresentation", () => {
  it("maps empty", () => {
    const result: GetBlogPostsListResult = {
      status: "success",
      posts: [],
      pagination: { page: 1, perPage: 3, total: 0, totalPages: 0 },
    };
    expect(toHomeBlogPresentation(result)).toEqual({
      status: "empty",
      message: HOME_BLOG_EMPTY_MESSAGE,
      listHref: HOME_BLOG_LIST_HREF,
    });
  });

  it("maps error", () => {
    const view = toHomeBlogPresentation({ status: "error", message: "" });
    expect(view.status).toBe("error");
    if (view.status !== "error") return;
    expect(view.message).toBe(HOME_BLOG_ERROR_MESSAGE);
  });

  it("maps ready", () => {
    const result: GetBlogPostsListResult = {
      status: "success",
      posts: [
        {
          id: "blg_01_5k_tips",
          title: "5 dicas para sua primeira corrida de 5K",
          excerpt: "Preparação simples.",
          href: "/blog/5-dicas-primeira-corrida-5k",
        },
      ],
      pagination: { page: 1, perPage: 3, total: 1, totalPages: 1 },
    };
    const view = toHomeBlogPresentation(result);
    expect(view.status).toBe("ready");
    if (view.status !== "ready") return;
    expect(view.posts[0]?.href).toBe("/blog/5-dicas-primeira-corrida-5k");
    expect(view.listHref).toBe(HOME_BLOG_LIST_HREF);
  });
});
